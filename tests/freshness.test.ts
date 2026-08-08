import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { copySurfaces } from '@/scripts/constitution/surfaces';
import { getContent } from '@/content';
import { costOfLiving } from '@/content/costOfLiving';
import {
  greenJobs,
  greenJobsCopy,
  isJobsSweepOnSchedule,
  JOBS_SWEEP_TOLERANCE_DAYS,
} from '@/content/greenJobs';
import { LEVELUP_EDITION, levelupName, levelupReports } from '@/content/levelup';
import { navCopy } from '@/content/nav';
import { newsletterCopy } from '@/content/newsletter';
import { salaryIndexCopy } from '@/content/salaryIndexCopy';
import { salaryIndexMeta } from '@/content/salaryIndex';
import { salaryReports } from '@/content/salaryReport';
import { LOCALES } from '@/lib/constants';
import { FX, FX_PAIR } from '@/lib/fx';
import { judgmentData, repAsOf } from '@/lib/judgment';
import { fillYear, YEAR_TOKEN } from '@/lib/siteMeta';

/**
 * FRESHNESS — the tests for claims that rot.
 *
 * The 2026-08-08 content audit found ten of them live at once. Every single one
 * had been true on the day it was typed, which is why reading the page could not
 * catch them: 「每週更新」 on an index frozen for a week, 「每週一封」 on a
 * newsletter that had never sent an issue, 「目前庫裡的 98 筆」 against a ledger
 * holding 113, an undated 1 SGD ≈ 25 TWD underneath every "2 to 3×" claim on the
 * site, 「2026 H2」 typed into five places, a hand-written © 2026, and 108 `as_of`
 * dates sitting in the judgement corpus that no component ever rendered.
 *
 * The shape of the defect is always the same: a fact was copied into a sentence
 * instead of read from the thing it describes. So these tests enforce the rule
 * rather than the values — a promise must be provable on the same page, a number
 * must come from its own source, a date must be rendered rather than typed.
 */

const REPO = process.cwd();
const read = (...p: string[]) => readFileSync(join(REPO, ...p), 'utf8');

const jobsPage = read('app', '(site)', '[locale]', 'jobs', 'page.tsx');
const salaryIndexPage = read('app', '(site)', '[locale]', 'salary-index', 'page.tsx');
const costOfLivingPage = read('app', '(site)', '[locale]', 'cost-of-living', 'page.tsx');
const levelupPage = read('app', '(site)', '[locale]', 'levelup', 'page.tsx');
const salaryReportPage = read('app', '(site)', '[locale]', 'salary-report', 'page.tsx');
const homePage = read('app', '(site)', '[locale]', 'page.tsx');
const judgmentApp = read('components', 'JudgmentApp.tsx');

/** Every reader-facing string, with its dotted path. */
const surfaces = copySurfaces();

function stringsUnder(root: unknown, prefix = ''): [string, string][] {
  const out: [string, string][] = [];
  const walk = (v: unknown, path: string) => {
    if (typeof v === 'string') out.push([path, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) walk(x, path ? `${path}.${k}` : k);
    }
  };
  walk(root, prefix);
  return out;
}

/* ------------------------- 1. cadence promises ------------------------------ */

/**
 * Words that commit the site to a schedule. Any of them in reader-facing copy is
 * a claim someone has to keep, forever, with nothing checking that they do.
 */
const CADENCE =
  /週更|每週|每周|每日|每天|每月|每兩週|本週|當週|週刊|weekly|daily|monthly|every (?:week|day|month|Sunday|Monday)|(?:a|per|each|every|this|next) (?:week|day|month)\b|refreshe?d? weekly/i;

describe('an update cadence is only promised where the page can prove it', () => {
  /**
   * The nav ships on every page and can never show evidence beside itself. It
   * carried 「（週更）」 on two links for months, including the week the index
   * export silently stopped running.
   */
  it('the nav promises no cadence at all, in either locale', () => {
    for (const locale of LOCALES) {
      for (const [path, value] of stringsUnder(navCopy[locale], `navCopy.${locale}`)) {
        expect(value, `${path} puts an update cadence in the site rail`).not.toMatch(CADENCE);
      }
    }
  });

  /**
   * lib/email.ts has four send functions and none of them sends an issue. Until
   * one does, the signup box may describe what the list is, never how often it
   * arrives.
   */
  it('the newsletter box promises no send frequency', () => {
    for (const locale of LOCALES) {
      for (const [path, value] of stringsUnder(newsletterCopy[locale], `newsletterCopy.${locale}`)) {
        expect(value, `${path} promises a send frequency with no sender behind it`).not.toMatch(
          CADENCE,
        );
      }
    }
  });

  /**
   * The jobs radar prints a date, and — since 2026-08-09 — a cadence beside it.
   * `nextUpdate` is the one string on the site allowed to name a cadence, and only
   * because `isJobsSweepOnSchedule()` withdraws it the moment the sweep stops
   * delivering. Every other string here stays under the ban.
   */
  it('the jobs radar promises a cadence in exactly one string, and prints the date it has', () => {
    for (const locale of LOCALES) {
      for (const [path, value] of stringsUnder(greenJobsCopy[locale], `greenJobsCopy.${locale}`)) {
        if (path.endsWith('.nextUpdate')) continue;
        expect(value, `${path} promises a refresh cadence the page cannot evidence`).not.toMatch(
          CADENCE,
        );
      }
    }
    expect(jobsPage).toContain('greenJobs.updatedAt');
    expect(greenJobs.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('the cadence promise is rendered behind the freshness gate, never on its own', () => {
    const line = jobsPage.split(/\r?\n/).find((l) => l.includes('t.nextUpdate'));
    expect(line, 'the jobs page stopped printing a next-update line at all').toBeDefined();
    expect(line, 'the cadence line renders unconditionally — it will outlive the sweep').toContain(
      'isJobsSweepOnSchedule(greenJobs.updatedAt) &&',
    );
    // Static rendering would freeze that gate at build time, and a broken sweep
    // is precisely the case where no new build happens.
    expect(jobsPage, 'the jobs page is static again, so the gate cannot expire').toMatch(
      /export const revalidate = \d+/,
    );
  });

  it('the sweep is on schedule for a day, and off it after the tolerance window', () => {
    const day = 86_400_000;
    const swept = new Date('2026-08-09T00:00:00+08:00').getTime();
    expect(isJobsSweepOnSchedule('2026-08-09', new Date(swept + 12 * 3_600_000))).toBe(true);
    expect(
      isJobsSweepOnSchedule('2026-08-09', new Date(swept + JOBS_SWEEP_TOLERANCE_DAYS * day)),
    ).toBe(true);
    expect(
      isJobsSweepOnSchedule('2026-08-09', new Date(swept + (JOBS_SWEEP_TOLERANCE_DAYS + 1) * day)),
    ).toBe(false);
    // The 07-28 batch that sat on the page for 11 days must not have qualified.
    expect(isJobsSweepOnSchedule('2026-07-28', new Date('2026-08-08T09:00:00+08:00'))).toBe(false);
    expect(isJobsSweepOnSchedule('not-a-date')).toBe(false);
  });

  /**
   * The home page describes the same two tools in hard-coded JSX, which is how
   * 「每週更新」 survived on the front door after the pages themselves stopped
   * saying it. Literals live in page source, so this reads the file.
   */
  it('the home page promises no cadence for the tools it links to', () => {
    for (const [, literal] of homePage.matchAll(/'([^'\\]{8,})'/g)) {
      expect(literal, 'a hard-coded cadence promise is back on the home page').not.toMatch(CADENCE);
    }
  });

  /**
   * The index is the one surface allowed to describe its Sunday sweep, because
   * `updatedLine` puts the last export date in the same sentence — so a reader
   * can see the moment the promise stops being kept.
   */
  it('the salary index states its cadence only next to the date that proves it', () => {
    for (const locale of LOCALES) {
      const c = salaryIndexCopy[locale];
      expect(c.eyebrow, `${locale}: the eyebrow is a bare promise again`).not.toMatch(CADENCE);
      expect(c.updatedLine, `${locale}: updatedLine lost its date slot`).toContain('{date}');
      expect(c.updatedLine, `${locale}: updatedLine states no cadence`).toMatch(CADENCE);
    }
    expect(salaryIndexPage).toContain('t.updatedLine.replace');
    expect(salaryIndexPage).toContain('salaryIndexMeta.exportedOn');
  });
});

/* --------------------- 2. counts are read, never retyped --------------------- */

describe('the index prose reports the snapshot it actually ships', () => {
  it('quotes no observation count that disagrees with salaryIndexMeta', () => {
    const live = new Set(
      [
        salaryIndexMeta.totalObservations,
        salaryIndexMeta.excludedUnknownSeniority,
        salaryIndexMeta.excludedDuplicate,
        salaryIndexMeta.postingsInCells,
      ].map(String),
    );
    // Any 2-3 digit count followed by 筆 / "rows" has to be one of the live ones.
    for (const locale of LOCALES) {
      for (const [i, m] of salaryIndexCopy[locale].method.entries()) {
        for (const hit of m.matchAll(/(\d{2,3})\s*(?:筆|rows)/g)) {
          expect(live, `${locale}.method[${i}] quotes a stale count: ${hit[0]}`).toContain(hit[1]);
        }
      }
    }
  });

  it('quotes the ledger dates from the snapshot, not from memory', () => {
    for (const locale of LOCALES) {
      const m = salaryIndexCopy[locale].method.join(' ');
      expect(m).toContain(salaryIndexMeta.ledgerOpenedOn);
      expect(m).toContain(salaryIndexMeta.exportedOn);
      expect(m).toContain(salaryIndexMeta.firstSeen);
      expect(m).toContain(salaryIndexMeta.lastSeen);
    }
  });
});

/* ------------------------------ 3. the FX rate ------------------------------- */

describe('the exchange rate has exactly one home, and it is dated', () => {
  it('every rendered mention of the pair carries the as-of date', () => {
    const mentions = surfaces.filter((s) => s.text.includes('SGD ≈'));
    expect(mentions.length, 'the FX pair vanished from the site entirely').toBeGreaterThan(4);
    for (const s of mentions) {
      expect(s.text, `${s.path} states the rate with no date behind it`).toContain(FX.asOf);
    }
  });

  it('the disposable-multiple table names the rate its arithmetic rests on', () => {
    for (const locale of LOCALES) {
      expect(costOfLiving[locale].verdictSource).toContain(FX_PAIR);
      expect(costOfLiving[locale].verdictSource).toContain(FX.asOf);
    }
    expect(costOfLivingPage).toContain('{r.verdictSource}');
  });

  it('derives the USD leg rather than letting a second number drift', () => {
    expect(FX.usdSgd * FX.sgdTwd).toBe(33.75);
  });
});

/* ------------------------- 4. the copyright year ----------------------------- */

describe('the © year is rendered, not typed', () => {
  const footers = [
    ...LOCALES.map((l) => [`costOfLiving.${l}`, costOfLiving[l].footer] as const),
    ...LOCALES.map((l) => [`levelup.${l}`, levelupReports[l].footer] as const),
    ...LOCALES.map((l) => [`salaryReport.${l}`, salaryReports[l].footer] as const),
  ];

  it('every long-form footer carries the token instead of a year', () => {
    for (const [path, text] of footers) {
      expect(text, `${path} lost its {year} token`).toContain(YEAR_TOKEN);
      expect(text, `${path} hard-codes a year again`).not.toMatch(/©\s*\d{4}/);
    }
  });

  it('all three pages fill it, and re-render often enough for it to move', () => {
    for (const page of [costOfLivingPage, levelupPage, salaryReportPage]) {
      expect(page).toContain('fillYear(r.footer)');
      expect(page).toMatch(/export const revalidate = \d+/);
    }
  });

  it('fillYear substitutes the year of the moment it is called', () => {
    expect(fillYear('© {year} AhaMoment', new Date('2031-01-02T00:00:00Z'))).toBe(
      '© 2031 AhaMoment',
    );
  });
});

/* --------------------------- 5. the report edition --------------------------- */

describe('the level-up edition is named in one place', () => {
  it('the home-page card reads the name instead of retyping the edition', () => {
    expect(homePage).not.toContain(LEVELUP_EDITION);
    expect(homePage).toContain('levelupName');
  });

  it('the report title and byline are built from it in both locales', () => {
    for (const locale of LOCALES) {
      expect(levelupReports[locale].meta.title).toContain(levelupName[locale]);
      expect(levelupReports[locale].byline).toContain(levelupName[locale]);
      expect(levelupName[locale]).toContain(LEVELUP_EDITION);
    }
  });
});

/* ---------------------- 6. the judgement corpus's own dates ------------------ */

describe('the judgement corpus shows the dates it has always carried', () => {
  it('the data still has a check date on every explainer and every drill', () => {
    for (const [id, ex] of Object.entries(judgmentData.explainers)) {
      expect(ex?.meta.as_of, `explainer ${id} lost its as_of`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    for (const rep of judgmentData.reps) {
      expect(repAsOf(rep), `${rep.id} has no dated source`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('a drill is dated by its OLDEST source, never its newest', () => {
    const rep = {
      id: 'T',
      competencies: [],
      scenario: '',
      question: '',
      options: [],
      reasoning: '',
      takeaway: '',
      sources: [
        { title: 'new', url: 'https://example.com/a', as_of: '2026-08-01' },
        { title: 'old', url: 'https://example.com/b', as_of: '2025-01-01' },
        { title: 'undated', url: 'https://example.com/c' },
      ],
    };
    expect(repAsOf(rep)).toBe('2025-01-01');
    expect(repAsOf({ ...rep, sources: [] })).toBeNull();
  });

  it('both locales ship the three disclosure lines, each with a date slot', () => {
    for (const locale of LOCALES) {
      const t = getContent(locale).judgment;
      for (const [path, value] of [
        ['gaps.explainerAsOf', t.gaps.explainerAsOf],
        ['gaps.volatileAsOf', t.gaps.volatileAsOf],
        ['reps.asOf', t.reps.asOf],
      ] as const) {
        expect(value.length, `${locale}.${path} is empty`).toBeGreaterThan(0);
        expect(value, `${locale}.${path} has no {date} slot`).toContain('{date}');
      }
    }
  });

  it('the component renders all three, on the card, in the map and on the drill', () => {
    expect(judgmentApp).toContain('t.gaps.explainerAsOf');
    expect(judgmentApp).toContain('t.gaps.volatileAsOf');
    expect(judgmentApp).toContain('t.reps.asOf');
    // Two explainer surfaces exist (the gap card and the map tile) and both must
    // disclose: the map tile is the one most readers actually open.
    expect(judgmentApp.match(/t\.gaps\.explainerAsOf/g)?.length).toBe(2);
  });

  it('never invents a date for material that carries none', () => {
    // AsOfNote renders nothing without a date; that guard is the whole contract.
    expect(judgmentApp).toContain('if (!date) return null;');
  });
});

/* ------------------- 7. second-hand estimates are dated too ------------------ */

describe('the estimate tables are dated as precisely as the official block', () => {
  it('each estimate table and the derived verdict carries a period and a check date', () => {
    for (const locale of LOCALES) {
      const c = costOfLiving[locale];
      for (const [path, value] of [
        ['sgTableSource', c.sgTableSource],
        ['twTableSource', c.twTableSource],
        ['verdictSource', c.verdictSource],
      ] as const) {
        expect(value.length, `${locale}.${path} is empty`).toBeGreaterThan(0);
        expect(value, `${locale}.${path} carries no year`).toMatch(/\d{4}/);
      }
      expect(c.estimateBadge.length).toBeGreaterThan(0);
    }
  });

  it('the page renders them under the tables they describe', () => {
    for (const field of ['{r.sgTableSource}', '{r.twTableSource}', '{r.verdictSource}']) {
      expect(costOfLivingPage, `${field} is not rendered`).toContain(field);
    }
    expect(costOfLivingPage.indexOf('{r.sgTableSource}')).toBeLessThan(
      costOfLivingPage.indexOf('<SgOfficialDataSection'),
    );
  });

  it('every second-hand source note says when it was last checked', () => {
    for (const locale of LOCALES) {
      const secondHand = costOfLiving[locale].sources.filter(
        (s) => !s.url.includes('data.gov.sg') && s.url.startsWith('http'),
      );
      expect(secondHand.length, `${locale}: no second-hand sources found to check`).toBeGreaterThan(
        3,
      );
      for (const s of secondHand) {
        expect(s.note, `${locale}: ${s.label} gives no check date`).toMatch(/\d{4}/);
      }
    }
  });
});
