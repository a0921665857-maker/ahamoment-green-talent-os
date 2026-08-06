#!/usr/bin/env python3
"""Regenerate content/sgOfficial.ts from the data.gov.sg snapshots in content/sg-official/.

    python scripts/export_sg_official.py            # write the file
    python scripts/export_sg_official.py --check    # exit 1 if it would change
    python scripts/export_sg_official.py --sync     # copy the six JSONs in first
    python scripts/export_sg_official.py --date 2026-08-06

WHAT THIS SCRIPT DOES NOT DO: go on the internet. Fetching is the job of
`C:\\Users\\michael\\sg-dashboard\\refresh.py`, which already carries the polite
throttle data.gov.sg needs (4 seconds between requests, 60/90/120 second backoff
on 429). The keyless quota is very low; the sg-dashboard worklog recorded a 429
after barely a dozen consecutive requests. Do not shorten those intervals, do not
run them concurrently, and do not move fetching into this repo or into the Next.js
build. This script reads JSON that has already landed on disk, which is also why
`--check` works offline and why anyone can re-derive the published numbers from
the files committed next to them.

THE DIVISION OF LABOUR:
    sg-dashboard/refresh.py   goes online, writes sg-dashboard/data/*.json
    --sync                    copies those six files into content/sg-official/
    this script               reads content/sg-official/*.json, writes content/sgOfficial.ts
    the page                  imports content/sgOfficial.ts, never touches JSON at runtime

WHY THE RAW JSON IS COMMITTED. export_salary_index.py can only be re-run by
someone holding the personal-intelligence-system SQLite file, so a challenged
number cannot be re-derived on the spot. These six files are ~23 KB in total and
carry their own provenance envelope (dataset_id, agency, dataset_url, licence,
fetched_at, latest_period), so `--check` re-derives every published figure from
material sitting in the same commit.

FAIL LOUD. Any of these aborts with exit 1 and writes nothing, rather than
shipping half a snapshot:
  - one of the six JSON files missing
  - a missing or blank provenance field (licence, dataset_url, fetched_at, ...)
  - latest_by_town that is not exactly 25 towns
  - a median_rent that is null, zero or negative
  - a town with no hand-written Chinese name in TOWN_ZH below

TRANSLATION. TOWN_ZH is hand-written, per docs/UX_PRINCIPLES.md rule 10 (never
machine-translated). The official uppercase English name is carried alongside it
so a reader can match a row back to the data.gov.sg page it came from.

LICENCE. All six datasets are published under the Singapore Open Data Licence
v1.0, which permits redistribution of derived analysis and REQUIRES attribution
plus a statement of non-affiliation. Both obligations are discharged in
content/sgOfficialCopy.ts (`licenceNote`) and rendered on the page; the test
suite asserts the licence string survives on every dataset.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import statistics
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "content" / "sg-official"
OUT_PATH = ROOT / "content" / "sgOfficial.ts"

SG_DASHBOARD_DATA = Path(
    os.environ.get("SG_DASHBOARD_DATA", r"C:\Users\michael\sg-dashboard\data")
)

DATASET_KEYS = [
    "hdb_rent",
    "hdb_resale",
    "cpi",
    "unemployment",
    "income",
    "foreign_workforce",
]

PROVENANCE_FIELDS = [
    "dataset_key",
    "dataset_id",
    "dataset_name",
    "agency",
    "dataset_url",
    "licence",
    "licence_url",
    "fetched_at",
    "latest_period",
]

LICENCE = "Singapore Open Data Licence v1.0"
LICENCE_URL = "https://data.gov.sg/open-data-licence"
STALE_DAYS = 90

# Hand-written, checked against HDB's own town list. Never machine-translated.
TOWN_ZH = {
    "ANG MO KIO": "宏茂橋",
    "BEDOK": "勿洛",
    "BISHAN": "碧山",
    "BUKIT BATOK": "武吉巴督",
    "BUKIT MERAH": "紅山",
    "BUKIT PANJANG": "武吉班讓",
    "CENTRAL": "中央區",
    "CHOA CHU KANG": "蔡厝港",
    "CLEMENTI": "金文泰",
    "GEYLANG": "芽籠",
    "HOUGANG": "後港",
    "JURONG EAST": "裕廊東",
    "JURONG WEST": "裕廊西",
    "KALLANG/WHAMPOA": "加冷／黃埔",
    "MARINE PARADE": "馬林百列",
    "PASIR RIS": "巴西立",
    "PUNGGOL": "榜鵝",
    "QUEENSTOWN": "女皇鎮",
    "SEMBAWANG": "三巴旺",
    "SENGKANG": "盛港",
    "SERANGOON": "實龍崗",
    "TAMPINES": "淡濱尼",
    "TOA PAYOH": "大巴窯",
    "WOODLANDS": "兀蘭",
    "YISHUN": "義順",
}

# Towns whose full quarterly series the dashboard keeps, used for the six-year
# rent trend sentence. Order is the order they are quoted in the copy.
TREND_TOWNS = ["PUNGGOL", "TAMPINES", "JURONG WEST", "ANG MO KIO", "QUEENSTOWN"]


def die(msg: str) -> None:
    sys.exit(f"export_sg_official: {msg}")


def sync_raw() -> None:
    if not SG_DASHBOARD_DATA.exists():
        die(
            f"sg-dashboard data directory not found: {SG_DASHBOARD_DATA}\n"
            "Set SG_DASHBOARD_DATA if the dashboard repo lives elsewhere."
        )
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    for key in DATASET_KEYS:
        src = SG_DASHBOARD_DATA / f"{key}.json"
        if not src.exists():
            die(f"missing source file {src}. Run sg-dashboard/refresh.py first.")
        shutil.copyfile(src, RAW_DIR / f"{key}.json")
        print(f"synced {key}.json")


def load_raw() -> dict[str, dict]:
    data: dict[str, dict] = {}
    for key in DATASET_KEYS:
        path = RAW_DIR / f"{key}.json"
        if not path.exists():
            die(
                f"missing {path}. Run with --sync after sg-dashboard/refresh.py, "
                "or restore the file from git."
            )
        try:
            blob = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            die(f"{path.name} is not valid JSON: {exc}")
        for field in PROVENANCE_FIELDS:
            if not str(blob.get(field, "")).strip():
                die(f"{path.name} is missing provenance field '{field}'")
        if blob["licence"] != LICENCE:
            die(
                f"{path.name} declares licence '{blob['licence']}', expected '{LICENCE}'. "
                "Attribution terms may have changed; check data.gov.sg before publishing."
            )
        data[key] = blob
    return data


def check_rent(rent: dict) -> None:
    towns = rent.get("latest_by_town") or []
    if len(towns) != 25:
        die(f"latest_by_town has {len(towns)} towns, expected 25")
    for row in towns:
        name = row.get("town")
        value = row.get("median_rent")
        if not name:
            die("a latest_by_town row has no town name")
        if value is None or value <= 0:
            die(f"{name} has a non-positive median_rent: {value!r}")
        if name not in TOWN_ZH:
            die(
                f"no hand-written Chinese name for town '{name}'. Add it to TOWN_ZH "
                "in this script; do not machine-translate it in the TS layer."
            )


def ts_string(value: str) -> str:
    """Escape a value for a single-quoted TypeScript string literal."""
    return value.replace("\\", "\\\\").replace("'", "\\'")


def source_literal(blob: dict, discontinued: bool = False) -> str:
    parts = [
        f"datasetKey: '{blob['dataset_key']}'",
        "datasetName: '%s'" % ts_string(blob["dataset_name"]),
        f"agency: '{blob['agency']}'",
        f"datasetUrl: '{blob['dataset_url']}'",
        f"licence: SG_OFFICIAL_LICENCE",
        f"licenceUrl: SG_OFFICIAL_LICENCE_URL",
        f"fetchedAt: '{blob['fetched_at']}'",
        f"latestPeriod: '{blob['latest_period']}'",
    ]
    if discontinued:
        parts.append("discontinued: true")
    return "{ " + ", ".join(parts) + " }"


def pct(now: float, then: float) -> float:
    return round((now / then - 1) * 100, 1)


def build(raw: dict[str, dict], generated_on: str) -> str:
    rent, resale = raw["hdb_rent"], raw["hdb_resale"]
    cpi, unemp, income, foreign = (
        raw["cpi"],
        raw["unemployment"],
        raw["income"],
        raw["foreign_workforce"],
    )

    check_rent(rent)

    towns = sorted(rent["latest_by_town"], key=lambda r: -r["median_rent"])
    values = sorted(r["median_rent"] for r in towns)
    n = len(values)

    def q(p: float) -> int:
        # Nearest-rank, same convention as export_salary_index.py: with 25 points
        # interpolation would invent precision the sample does not have.
        return int(values[min(n - 1, int(round(p * (n - 1))))])

    median_of_towns = int(statistics.median(values))

    trend_rows = []
    tq = rent["trend_quarters"]
    for town in TREND_TOWNS:
        series = rent["trend_by_town"].get(town)
        if not series:
            die(f"trend_by_town has no series for {town}")
        trend_rows.append(
            "      { town: '%s', townZh: '%s', fromQuarter: '%s', fromRent: %d, "
            "toQuarter: '%s', toRent: %d, changePct: %s },"
            % (
                town,
                TOWN_ZH[town],
                tq[0],
                int(series[0]),
                tq[-1],
                int(series[-1]),
                pct(series[-1], series[0]),
            )
        )

    town_rows = [
        "      { town: '%s', townZh: '%s', medianRent: %d },"
        % (r["town"], TOWN_ZH[r["town"]], int(r["median_rent"]))
        for r in towns
    ]

    # CPI: the five-year cumulative and the peak are ours, computed from the
    # official index series, and are labelled as derived on the page.
    months, idx, yoy = cpi["months"], cpi["index_all_items"], cpi["yoy_all_items"]
    five_years_ago = months.index(f"{int(months[-1][:4]) - 5}-{months[-1][5:]}")
    cum5 = round((idx[-1] / idx[five_years_ago] - 1) * 100, 1)
    peak = max(yoy)
    peak_month = months[yoy.index(peak)]
    sub = cpi["yoy_subindices"]

    # Unemployment: how many consecutive trailing quarters sit inside the band
    # the copy quotes. Counted, never asserted by hand.
    rates = unemp["sa_rate"]
    latest_rate = rates[-1]
    run = 0
    for value in reversed(rates):
        if 1.9 <= value <= 2.0:
            run += 1
        else:
            break
    ten_year = rates[-40:]

    inc_incl = income["median_income_incl_emp_cpf"]
    inc_excl = income["median_income_excl_emp_cpf"]

    res_series = resale["median_price_by_flat_type"]
    res_counts = resale["transaction_count"]

    pass_counts = foreign["count_by_pass_type"]

    return TEMPLATE.format(
        generated_on=generated_on,
        stale_days=STALE_DAYS,
        licence=LICENCE,
        licence_url=LICENCE_URL,
        fetched_at=rent["fetched_at"][:10],
        rent_source=source_literal(rent),
        rent_quarter=rent["latest_quarter"],
        rent_flat_type=rent["flat_type"],
        rent_median=median_of_towns,
        rent_p25=q(0.25),
        rent_p75=q(0.75),
        rent_high=int(values[-1]),
        rent_low=int(values[0]),
        rent_spread=round(values[-1] / values[0], 2),
        town_rows="\n".join(town_rows),
        trend_rows="\n".join(trend_rows),
        cpi_source=source_literal(cpi),
        cpi_month=cpi["latest_period"],
        cpi_all=yoy[-1],
        cpi_food=sub["food"]["yoy"][-1],
        cpi_housing=sub["housing_utilities"]["yoy"][-1],
        cpi_transport=sub["transport"]["yoy"][-1],
        cpi_cum5=cum5,
        cpi_peak=peak,
        cpi_peak_month=peak_month,
        income_source=source_literal(income),
        income_year=income["latest_period"],
        income_incl=int(inc_incl[-1]),
        income_excl=int(inc_excl[-1]),
        income_incl_yoy=pct(inc_incl[-1], inc_incl[-2]),
        income_excl_yoy=pct(inc_excl[-1], inc_excl[-2]),
        unemp_source=source_literal(unemp),
        unemp_period=unemp["latest_period"],
        unemp_rate=latest_rate,
        unemp_run=run,
        unemp_low=min(ten_year),
        unemp_high=max(ten_year),
        resale_source=source_literal(resale),
        resale_month=resale["latest_period"],
        resale_3=int(res_series["3 ROOM"][-1]),
        resale_4=int(res_series["4 ROOM"][-1]),
        resale_5=int(res_series["5 ROOM"][-1]),
        resale_exec=int(res_series["EXECUTIVE"][-1]),
        resale_month_count=int(res_counts[-1]),
        resale_window_count=int(sum(res_counts)),
        resale_window_months=len(res_counts),
        foreign_source=source_literal(foreign, discontinued=True),
        foreign_period=foreign["latest_period"],
        foreign_ep=int(pass_counts["employment_pass"][-1]),
        foreign_spass=int(pass_counts["s_pass"][-1]),
        foreign_wp=int(pass_counts["work_permit"][-1]),
        foreign_other=int(pass_counts["other_work_passes"][-1]),
    )


TEMPLATE = """/**
 * 新加坡官方數據快照 — generated file. Do not hand-edit.
 *
 * Regenerate with `python scripts/export_sg_official.py`. Hand edits are
 * silently overwritten on the next run, and `--check` will fail the moment the
 * file stops matching content/sg-official/*.json.
 *
 * SOURCE. data.gov.sg, six datasets published by HDB, SingStat and MOM. The raw
 * responses live in content/sg-official/ in this repo, one JSON per dataset,
 * each carrying its own dataset id, agency, source URL, licence, fetch time and
 * reporting period. Every number below is re-derivable from those files offline.
 *
 * LICENCE. Singapore Open Data Licence v1.0. It permits redistribution of
 * derived analysis and requires attribution plus a statement that this site is
 * not affiliated with the Singapore government. Both are rendered on the page
 * from content/sgOfficialCopy.ts. Do not ship this data without them.
 *
 * FIRST-HAND vs SECOND-HAND. This file holds official first-hand figures only.
 * The second-hand estimates (Numbeo, Wise, blog surveys) stay in
 * content/costOfLiving.ts. The two are rendered in separate sections and are
 * never merged into one table, never added together, and never substituted for
 * one another. tests/costOfLiving.test.ts enforces the separation.
 *
 * TWO DIFFERENT DATES, both exposed. `fetchedAt` is when this site pulled the
 * dataset. `latestPeriod` is how current the agency's own data is. They are not
 * the same claim: foreign_workforce was fetched on {fetched_at} but the agency
 * stopped publishing it after 2022-12, so it carries `discontinued: true` and is
 * not rendered on the cost-of-living page at all.
 *
 * STALENESS BEHAVIOUR IS THE OPPOSITE OF marketPulse, deliberately. marketPulse
 * hides itself once stale because a closed job posting is a dead link. Official
 * statistics do not become false by ageing; the only risk is that a newer
 * reporting period exists. So a stale dataset here keeps its numbers and gains a
 * notice pointing at the official link. Never copy the hiding behaviour across.
 *
 * DERIVED FIGURES. Fields marked "derived" are computed by this script from the
 * official series, not published by the agency in that form: the median of the
 * 25 town medians, the quartiles, the six-year rent changes, the CPI five-year
 * cumulative, and the trailing run of quarters inside the unemployment band. The
 * page labels them as mine. Where they disagree with an official publication,
 * the official figure stands.
 *
 * TO REFRESH (roughly monthly, on the 5th; see docs/MAINTENANCE_GUIDE.md):
 *   1. python C:\\Users\\michael\\sg-dashboard\\refresh.py
 *      (4 second spacing and 60/90/120s backoff are built in; the keyless
 *       data.gov.sg quota 429s after about a dozen quick requests. Never shorten
 *       them, never parallelise, and never fetch from this repo or at build time.)
 *   2. python scripts/export_sg_official.py --sync
 *   3. npm run typecheck && npx vitest run
 *   4. commit on a feature branch; the snapshot test will point at any figure
 *      that moved, which is the intended prompt to re-read the copy.
 */

export const SG_OFFICIAL_STALE_DAYS = {stale_days};
export const SG_OFFICIAL_LICENCE = '{licence}';
export const SG_OFFICIAL_LICENCE_URL = '{licence_url}';

export interface SgOfficialSource {{
  datasetKey: string;
  datasetName: string;
  agency: 'HDB' | 'MOM' | 'SingStat';
  datasetUrl: string;
  licence: string;
  licenceUrl: string;
  /** When this site pulled the dataset (ISO 8601 with offset). Drives the 90-day notice. */
  fetchedAt: string;
  /** How current the agency's own data is. A different claim from fetchedAt; both are shown. */
  latestPeriod: string;
  /** The agency stopped publishing. Only foreign_workforce, frozen at 2022-12. */
  discontinued?: boolean;
}}

export interface SgTownRent {{
  /** Official uppercase name, unaltered, so a row matches back to data.gov.sg. */
  town: string;
  /** Hand-written in scripts/export_sg_official.py. Never machine-translated. */
  townZh: string;
  medianRent: number;
}}

export interface SgTownRentTrend {{
  town: string;
  townZh: string;
  fromQuarter: string;
  fromRent: number;
  toQuarter: string;
  toRent: number;
  /** Derived by this script from the official quarterly series. */
  changePct: number;
}}

export interface SgOfficialData {{
  generatedOn: string;
  rent: {{
    source: SgOfficialSource;
    quarter: string;
    flatType: '4-RM';
    /**
     * Written into the type so a whole-flat median can never be mistaken for the
     * price of one room. The estimate table on /cost-of-living is per person;
     * this is per household. They are different units and must not be added,
     * averaged, or swapped.
     */
    unit: 'whole_flat';
    /** 25 towns, highest first. Official values. */
    byTown: SgTownRent[];
    /** Derived: median of the 25 town medians, not an official publication. */
    medianOfTowns: number;
    /** Derived: nearest-rank quartiles across the 25 town medians. */
    p25: number;
    p75: number;
    highest: number;
    lowest: number;
    /** Derived: highest ÷ lowest. */
    spread: number;
    /** Derived: six-year change for the five towns the dashboard keeps in full. */
    trend: SgTownRentTrend[];
  }};
  cpi: {{
    source: SgOfficialSource;
    month: string;
    yoyAllItems: number;
    yoyFood: number;
    /** Includes owner-occupied imputed rent and utility rebates. NOT market rent. */
    yoyHousingUtilities: number;
    yoyTransport: number;
    /** Derived from the official index: cumulative change over five years. */
    cumulativeFiveYearPct: number;
    /** Derived: highest year-on-year print in the series and the month it landed. */
    peakYoy: number;
    peakYoyMonth: string;
  }};
  income: {{
    source: SgOfficialSource;
    year: string;
    medianMonthlyInclEmployerCpf: number;
    medianMonthlyExclEmployerCpf: number;
    /** Derived year-on-year changes. */
    yoyInclPct: number;
    yoyExclPct: number;
    /**
     * Citizens and PRs in full-time work, all occupations. Not a green-collar
     * band and not foreign-employee pay. Three different populations; this one
     * can neither confirm nor contradict the salary report on this site.
     */
    population: 'resident_full_time';
  }};
  unemployment: {{
    source: SgOfficialSource;
    period: string;
    seasonallyAdjustedRate: number;
    /** Derived: trailing quarters inside the 1.9-2.0 band. */
    quartersInBand: number;
    /** Derived: ten-year low and high. */
    tenYearLow: number;
    tenYearHigh: number;
    /**
     * Residents and non-residents together. A non-resident who loses a job
     * usually leaves and drops out of the labour force, so this understates how
     * hard a foreign job search is. Not a hiring-difficulty indicator.
     */
    coverage: 'overall';
  }};
  /** Buying, not monthly outgoings. Carried for completeness; the page does not render it. */
  resale: {{
    source: SgOfficialSource;
    month: string;
    medianByFlatType: Record<'3 ROOM' | '4 ROOM' | '5 ROOM' | 'EXECUTIVE', number>;
    /** Real transactions in the latest month, and across the whole window. */
    transactionsLatestMonth: number;
    transactionsInWindow: number;
    windowMonths: number;
  }};
  /**
   * Discontinued by MOM after 2022-12. Kept so the discontinued flag has a home
   * and so nobody re-adds it thinking it is current. Not rendered anywhere.
   */
  foreignWorkforce: {{
    source: SgOfficialSource;
    period: string;
    employmentPass: number;
    sPass: number;
    workPermit: number;
    otherWorkPasses: number;
  }};
}}

export const sgOfficial: SgOfficialData = {{
  generatedOn: '{generated_on}',
  rent: {{
    source: {rent_source},
    quarter: '{rent_quarter}',
    flatType: '{rent_flat_type}',
    unit: 'whole_flat',
    byTown: [
{town_rows}
    ],
    medianOfTowns: {rent_median},
    p25: {rent_p25},
    p75: {rent_p75},
    highest: {rent_high},
    lowest: {rent_low},
    spread: {rent_spread},
    trend: [
{trend_rows}
    ],
  }},
  cpi: {{
    source: {cpi_source},
    month: '{cpi_month}',
    yoyAllItems: {cpi_all},
    yoyFood: {cpi_food},
    yoyHousingUtilities: {cpi_housing},
    yoyTransport: {cpi_transport},
    cumulativeFiveYearPct: {cpi_cum5},
    peakYoy: {cpi_peak},
    peakYoyMonth: '{cpi_peak_month}',
  }},
  income: {{
    source: {income_source},
    year: '{income_year}',
    medianMonthlyInclEmployerCpf: {income_incl},
    medianMonthlyExclEmployerCpf: {income_excl},
    yoyInclPct: {income_incl_yoy},
    yoyExclPct: {income_excl_yoy},
    population: 'resident_full_time',
  }},
  unemployment: {{
    source: {unemp_source},
    period: '{unemp_period}',
    seasonallyAdjustedRate: {unemp_rate},
    quartersInBand: {unemp_run},
    tenYearLow: {unemp_low},
    tenYearHigh: {unemp_high},
    coverage: 'overall',
  }},
  resale: {{
    source: {resale_source},
    month: '{resale_month}',
    medianByFlatType: {{ '3 ROOM': {resale_3}, '4 ROOM': {resale_4}, '5 ROOM': {resale_5}, 'EXECUTIVE': {resale_exec} }},
    transactionsLatestMonth: {resale_month_count},
    transactionsInWindow: {resale_window_count},
    windowMonths: {resale_window_months},
  }},
  foreignWorkforce: {{
    source: {foreign_source},
    period: '{foreign_period}',
    employmentPass: {foreign_ep},
    sPass: {foreign_spass},
    workPermit: {foreign_wp},
    otherWorkPasses: {foreign_other},
  }},
}};

/** Every dataset in the snapshot, so a test or a page can iterate provenance. */
export const sgOfficialSources: SgOfficialSource[] = [
  sgOfficial.rent.source,
  sgOfficial.cpi.source,
  sgOfficial.income.source,
  sgOfficial.unemployment.source,
  sgOfficial.resale.source,
  sgOfficial.foreignWorkforce.source,
];

/** The four datasets the cost-of-living page actually renders. */
export const sgOfficialRenderedSources: SgOfficialSource[] = [
  sgOfficial.rent.source,
  sgOfficial.cpi.source,
  sgOfficial.income.source,
  sgOfficial.unemployment.source,
];

/**
 * Days since this site fetched the dataset. An unparseable or malformed date
 * returns Infinity so it reads as stale: fail closed, never fail fresh.
 */
export function sgOfficialAgeDays(fetchedAt: string, now: Date = new Date()): number {{
  const fetched = new Date(fetchedAt).getTime();
  if (Number.isNaN(fetched)) return Number.POSITIVE_INFINITY;
  const ageDays = (now.getTime() - fetched) / 86_400_000;
  // A fetch date in the future is a clock skew or a typo, not freshness.
  if (ageDays < 0) return Number.POSITIVE_INFINITY;
  return ageDays;
}}

/**
 * Signature deliberately mirrors isMarketPulseFresh so both can be probed by the
 * same shape of boundary test. The CONSEQUENCE is the opposite: marketPulse
 * hides itself when false, this only adds a notice. See the file header.
 */
export function isSgOfficialFresh(fetchedAt: string, now: Date = new Date()): boolean {{
  return sgOfficialAgeDays(fetchedAt, now) <= SG_OFFICIAL_STALE_DAYS;
}}

/** True when any dataset the page renders has gone past the stale window. */
export function anyRenderedSourceStale(now: Date = new Date()): boolean {{
  return sgOfficialRenderedSources.some((s) => !isSgOfficialFresh(s.fetchedAt, now));
}}
"""


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "--check",
        action="store_true",
        help="exit 1 if the generated file would differ (for the monthly run)",
    )
    ap.add_argument(
        "--sync",
        action="store_true",
        help="copy the six JSONs from sg-dashboard/data before generating",
    )
    ap.add_argument("--date", default=date.today().isoformat(), help="stamp a fixed date")
    args = ap.parse_args()

    if args.sync:
        sync_raw()

    raw = load_raw()
    rendered = build(raw, args.date)
    existing = OUT_PATH.read_text(encoding="utf-8") if OUT_PATH.exists() else ""

    # Ignore date stamps when deciding whether anything really moved, so a re-run
    # in a quiet month does not produce a diff that is only a date.
    def strip_date(text: str) -> str:
        return re.sub(r"20\d\d-\d\d-\d\d", "DATE", text)

    changed = strip_date(rendered) != strip_date(existing)

    print(
        f"rent {len(raw['hdb_rent']['latest_by_town'])} towns @ "
        f"{raw['hdb_rent']['latest_quarter']} · cpi {raw['cpi']['latest_period']} · "
        f"income {raw['income']['latest_period']} · "
        f"unemployment {raw['unemployment']['latest_period']} · "
        f"resale {raw['hdb_resale']['latest_period']} · "
        f"foreign_workforce {raw['foreign_workforce']['latest_period']} (discontinued)"
    )
    print(f"fetched_at {raw['hdb_rent']['fetched_at']} · licence {LICENCE}")

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
