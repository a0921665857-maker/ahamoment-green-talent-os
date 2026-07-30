#!/usr/bin/env python3
"""Regenerate content/salaryIndex.ts from the salary_index ledger.

Run this every Sunday, right after green-jobs-weekly has finished inserting the
week's postings. Without it the ledger keeps growing and the public page keeps
showing last week's snapshot.

    python scripts/export_salary_index.py            # write the file
    python scripts/export_salary_index.py --check    # exit 1 if it would change

Why a script and not an ad-hoc query: the first snapshot was produced by hand
and published min-to-max, which let a single SGD 1,000 internship posting set
the published entry floor for Singapore. The rules that stop that now live here,
in one place, and run identically every week.

Zero dependencies — Python's stdlib sqlite3 only. The web app has no SQLite
driver and does not need one; the ledger is read at export time, never at
request time, so the public page stays static and costs nothing to serve.

Rules, in the order they apply (INDEX_METHODOLOGY.md §2–3):
  1. Only salary_type='posted'. Estimated and self-reported never enter.
  2. Rows whose seniority the posting never made readable are excluded.
  3. Internships are excluded. An intern is not an early-career hire, and
     under a min-to-max range one intern moves the whole floor.
  4. Duplicates are excluded: same employer + title + band, or the same
     posting filed under two functions.
  5. A cell publishes median and P25–P75 only at n >= MIN_N. Below that the
     cell still ships, with its n and no numbers. The empty cell is the point.
"""

from __future__ import annotations

import argparse
import os
import re
import sqlite3
import statistics
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

DB_PATH = Path(
    os.environ.get(
        "SALARY_INDEX_DB",
        r"C:\Users\michael\personal-intelligence-system\ledgers\salary_index\salary_index.db",
    )
)
OUT_PATH = Path(__file__).resolve().parent.parent / "content" / "salaryIndex.ts"

MIN_N = 5
INTERN_RE = re.compile(r"intern(ship)?\b", re.IGNORECASE)

FN_ORDER = [
    "sustainable_finance",
    "carbon_env_commodities",
    "corporate_sustainability",
    "esg_consulting",
    "climate_tech",
    "compliance_disclosure",
]


def load(db: Path):
    if not db.exists():
        sys.exit(
            f"ledger not found: {db}\n"
            "Set SALARY_INDEX_DB if the personal-intelligence-system repo lives elsewhere."
        )
    con = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
    cur = con.cursor()
    total = cur.execute("select count(*) from observations").fetchone()[0]
    posted = cur.execute(
        "select count(*) from observations where salary_type='posted'"
    ).fetchone()[0]
    unknown_sen = cur.execute(
        "select count(*) from observations where seniority='unknown'"
    ).fetchone()[0]
    by_market = dict(
        cur.execute("select market, count(*) from observations group by 1").fetchall()
    )
    span = cur.execute(
        "select min(first_seen_date), max(last_seen_date) from observations"
    ).fetchone()
    opened = cur.execute("select min(substr(created_at,1,10)) from observations").fetchone()[0]
    rows = cur.execute(
        """select market, function, seniority, employer_name, title_raw,
                  salary_min, salary_max, currency, period,
                  first_seen_date, last_seen_date
           from observations
           where salary_type='posted' and seniority!='unknown'"""
    ).fetchall()
    con.close()
    return rows, dict(
        total=total,
        posted=posted,
        unknown_sen=unknown_sen,
        by_market=by_market,
        first_seen=span[0],
        last_seen=span[1],
        opened=opened,
    )


def build(rows):
    seen: set[tuple] = set()
    kept, dropped_intern, dropped_dup = [], 0, 0
    for r in rows:
        market, fn, sen, employer, title, lo, hi, cur, per, first, last = r
        if INTERN_RE.search(title or ""):
            dropped_intern += 1
            continue
        key = (
            market,
            fn,
            sen,
            (employer or "").strip().lower(),
            (title or "").strip().lower(),
            lo,
            hi,
        )
        if key in seen:
            dropped_dup += 1
            continue
        seen.add(key)
        kept.append(r)

    cells = defaultdict(list)
    for market, fn, sen, _emp, _title, lo, hi, cur, per, first, last in kept:
        if lo is None or hi is None:
            continue
        cells[(market, fn, sen, cur, per)].append(((lo + hi) / 2.0, first, last))

    out = []
    for (market, fn, sen, cur, per), vals in cells.items():
        values = sorted(v[0] for v in vals)
        n = len(values)

        def q(p: float) -> float:
            # Nearest-rank percentile: with single-digit n, interpolation invents
            # precision the sample does not have.
            return values[min(n - 1, int(round(p * (n - 1))))]

        publish = n >= MIN_N
        out.append(
            dict(
                market=market,
                fn=fn,
                seniority=sen,
                n=n,
                median=int(round(statistics.median(values))) if publish else None,
                p25=int(round(q(0.25))) if publish else None,
                p75=int(round(q(0.75))) if publish else None,
                currency=cur,
                period=per,
                first_seen=min(v[1] for v in vals),
                last_seen=max(v[2] for v in vals),
            )
        )

    # Stable order: biggest sample first, then a fixed key, so a re-run with
    # unchanged data produces a byte-identical file and an empty git diff.
    out.sort(
        key=lambda c: (
            -c["n"],
            c["market"],
            FN_ORDER.index(c["fn"]) if c["fn"] in FN_ORDER else 99,
            c["seniority"],
        )
    )
    return out, dropped_intern, dropped_dup, len(kept)


HEADER = '''import type {{ Locale }} from '@/lib/constants';

/**
 * 綠領揭薪指數 — generated file. Do not hand-edit.
 *
 * Regenerate with `python scripts/export_salary_index.py`, which is run by the
 * green-jobs-weekly scheduled job every Sunday after that week's postings have
 * been inserted. Editing this file by hand will be silently overwritten.
 *
 * HOW THE ROWS GET HERE. green-jobs-weekly sweeps green-collar postings across
 * Singapore, Hong Kong and the UK every Sunday and records every qualifying
 * posting that printed a salary. It is automated; no row is hand-entered. The
 * ledger opened on {opened}. The {first_seen} to {last_seen} span below is when
 * the POSTINGS were seen, not how long collection has run.
 *
 * WHAT IS EXCLUDED, and why:
 *   - estimated and self-reported rows never enter.
 *   - {unknown_sen} rows whose seniority the posting never made readable.
 *   - {intern} internship posting(s). An intern is not an early-career hire,
 *     and under a min-to-max range one intern moves the entire floor — which is
 *     exactly what happened in the first snapshot.
 *   - {dup} duplicate rows: the same posting captured by more than one sweep,
 *     or filed under two functions.
 *   {kept} distinct postings remain in cells.
 *
 * WHAT IS PUBLISHED. Median plus P25–P75 over each posting's band midpoint, per
 * INDEX_METHODOLOGY.md §2, and only at n >= MIN_N. Below the threshold the cell
 * keeps its place with its n and no numbers.
 *
 * VERIFICATION. Every row was read off the posting at capture time and none has
 * been re-opened since, so the snapshot is `source_available_unverified`.
 * Nothing here may be described as audited.
 */

export const MIN_N = {min_n};
export const GENERATED_ON = '{generated_on}';

export type Market = 'SG' | 'HK' | 'UK';
export type Fn =
  | 'sustainable_finance'
  | 'carbon_env_commodities'
  | 'corporate_sustainability'
  | 'esg_consulting'
  | 'climate_tech'
  | 'compliance_disclosure';
export type Seniority = '0-3' | '4-8' | '8+';

/** How much a number on this page has been checked. Only `manually_verified`
 * may ever be described as audited; nothing is that yet. */
export type VerificationStatus =
  | 'manually_verified'
  | 'source_available_unverified'
  | 'automatically_collected'
  | 'source_unavailable'
  | 'excluded';

export interface SalaryCell {{
  market: Market;
  fn: Fn;
  seniority: Seniority;
  /** Distinct postings behind this cell. Shown even when below MIN_N. */
  n: number;
  /** Median of the postings' band midpoints. Null below MIN_N. */
  median: number | null;
  /** Interquartile range — the published band. Null below MIN_N. */
  p25: number | null;
  p75: number | null;
  currency: string;
  period: 'monthly' | 'annual';
  firstSeen: string;
  lastSeen: string;
  verification: VerificationStatus;
}}

export const salaryIndexMeta = {{
  exportedOn: '{generated_on}',
  /** Every row the ledger holds. */
  totalObservations: {total},
  postedObservations: {posted},
  /** Seniority unreadable from the posting, so excluded from every cell. */
  excludedUnknownSeniority: {unknown_sen},
  /** An intern posting is not an early-career salary. */
  excludedInternship: {intern},
  /** Same posting captured twice, or filed under two functions. */
  excludedDuplicate: {dup},
  /** Distinct postings that actually sit in a cell. */
  postingsInCells: {kept},
  byMarket: {{ SG: {sg}, HK: {hk}, UK: {uk} }},
  firstSeen: '{first_seen}',
  lastSeen: '{last_seen}',
  /** Automated weekly sweep, not hand-collected. */
  collectedBy: 'green-jobs-weekly scheduled sweep (Sundays)',
  ledgerOpenedOn: '{opened}',
  verification: 'source_available_unverified' as VerificationStatus,
}} as const;

'''

FOOTER = '''
export function publishable(cell: SalaryCell): boolean {
  return cell.n >= MIN_N && cell.p25 !== null && cell.p75 !== null;
}

/** Bilingual labels for the ledger's controlled vocabularies. */
export const fnLabels: Record<Locale, Record<Fn, string>> = {
  'zh-TW': {
    sustainable_finance: '永續金融',
    carbon_env_commodities: '碳與環境商品',
    corporate_sustainability: '企業永續部門',
    esg_consulting: 'ESG 顧問',
    climate_tech: '氣候科技',
    compliance_disclosure: '法遵與揭露',
  },
  en: {
    sustainable_finance: 'Sustainable finance',
    carbon_env_commodities: 'Carbon & environmental commodities',
    corporate_sustainability: 'In-house sustainability',
    esg_consulting: 'ESG consulting',
    climate_tech: 'Climate tech',
    compliance_disclosure: 'Compliance & disclosure',
  },
};

export const marketLabels: Record<Locale, Record<Market, string>> = {
  'zh-TW': { SG: '新加坡', HK: '香港', UK: '英國' },
  en: { SG: 'Singapore', HK: 'Hong Kong', UK: 'United Kingdom' },
};

export const seniorityLabels: Record<Locale, Record<Seniority, string>> = {
  'zh-TW': { '0-3': '0–3 年', '4-8': '4–8 年', '8+': '8 年以上' },
  en: { '0-3': '0–3 yrs', '4-8': '4–8 yrs', '8+': '8+ yrs' },
};
'''


def render(cells, meta, intern, dup, kept, generated_on: str) -> str:
    head = HEADER.format(
        min_n=MIN_N,
        generated_on=generated_on,
        total=meta["total"],
        posted=meta["posted"],
        unknown_sen=meta["unknown_sen"],
        intern=intern,
        dup=dup,
        kept=kept,
        sg=meta["by_market"].get("SG", 0),
        hk=meta["by_market"].get("HK", 0),
        uk=meta["by_market"].get("UK", 0),
        first_seen=meta["first_seen"],
        last_seen=meta["last_seen"],
        opened=meta["opened"],
    )
    lines = ["export const salaryCells: SalaryCell[] = ["]
    for c in cells:
        lines.append(
            "  {{ market: '{market}', fn: '{fn}', seniority: '{seniority}', n: {n}, "
            "median: {median}, p25: {p25}, p75: {p75}, currency: '{currency}', "
            "period: '{period}', firstSeen: '{first_seen}', lastSeen: '{last_seen}', "
            "verification: 'source_available_unverified' }},".format(
                median="null" if c["median"] is None else c["median"],
                p25="null" if c["p25"] is None else c["p25"],
                p75="null" if c["p75"] is None else c["p75"],
                **{k: v for k, v in c.items() if k not in ("median", "p25", "p75")},
            )
        )
    lines.append("];")
    return head + "\n".join(lines) + FOOTER


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--check",
        action="store_true",
        help="exit 1 if the generated file would differ (for the weekly run)",
    )
    ap.add_argument("--date", default=date.today().isoformat(), help="stamp a fixed date")
    args = ap.parse_args()

    rows, meta = load(DB_PATH)
    cells, intern, dup, kept = build(rows)
    rendered = render(cells, meta, intern, dup, kept, args.date)

    published = sum(1 for c in cells if c["n"] >= MIN_N)
    existing = OUT_PATH.read_text(encoding="utf-8") if OUT_PATH.exists() else ""

    # Ignore the date stamp when deciding whether anything really changed, so a
    # re-run on a quiet week does not produce a diff that is only a date.
    def strip_date(text: str) -> str:
        return re.sub(r"20\d\d-\d\d-\d\d", "DATE", text)

    changed = strip_date(rendered) != strip_date(existing)

    print(
        f"ledger {meta['total']} rows · posted {meta['posted']} · "
        f"in cells {kept} · excluded: seniority {meta['unknown_sen']}, "
        f"intern {intern}, duplicate {dup}"
    )
    print(f"cells {len(cells)} · publishable at n>={MIN_N}: {published}")

    if args.check:
        print("CHANGED" if changed else "unchanged")
        return 1 if changed else 0

    if not changed:
        print(f"unchanged — {OUT_PATH.name} left alone")
        return 0

    OUT_PATH.write_text(rendered, encoding="utf-8", newline="")
    print(f"wrote {OUT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
