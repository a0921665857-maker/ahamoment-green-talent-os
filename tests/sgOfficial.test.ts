import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/lib/constants';
import {
  SG_OFFICIAL_LICENCE,
  SG_OFFICIAL_LICENCE_URL,
  SG_OFFICIAL_STALE_DAYS,
  anyRenderedSourceStale,
  isSgOfficialFresh,
  sgOfficial,
  sgOfficialAgeDays,
  sgOfficialRenderedSources,
  sgOfficialSources,
} from '@/content/sgOfficial';
import {
  fillSgOfficial,
  sgOfficialCopy,
  sgOfficialPeriodLabel,
  sgOfficialVars,
} from '@/content/sgOfficialCopy';

/**
 * The cost-of-living page makes one structural claim about this data: it is
 * first-hand, it is attributable, and it is a WHOLE FLAT rather than one
 * person's room. These tests defend that claim. Regenerating the snapshot with
 * scripts/export_sg_official.py after a refresh will move the reconciliation
 * numbers, and that is the intended prompt to re-read the copy, not a nuisance.
 */

describe('official snapshot provenance', () => {
  it('carries a full, attributable envelope on every dataset', () => {
    expect(sgOfficialSources.length).toBe(6);
    for (const s of sgOfficialSources) {
      expect(s.datasetKey.length, s.datasetKey).toBeGreaterThan(0);
      expect(s.datasetName.length, s.datasetKey).toBeGreaterThan(0);
      expect(['HDB', 'MOM', 'SingStat']).toContain(s.agency);
      expect(s.datasetUrl, s.datasetKey).toMatch(/^https:\/\/data\.gov\.sg\/datasets\//);
      expect(s.fetchedAt, s.datasetKey).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(s.latestPeriod.length, s.datasetKey).toBeGreaterThan(0);
    }
  });

  /**
   * The Singapore Open Data Licence permits redistribution of derived analysis
   * only with attribution. If this string ever goes missing the site is in
   * breach, so it fails here rather than quietly on the page.
   */
  it('never drops the licence it redistributes under', () => {
    for (const s of sgOfficialSources) {
      expect(s.licence, s.datasetKey).toBe(SG_OFFICIAL_LICENCE);
      expect(s.licenceUrl, s.datasetKey).toBe(SG_OFFICIAL_LICENCE_URL);
    }
    for (const locale of LOCALES) {
      const note = sgOfficialCopy[locale].licenceNote;
      expect(note, locale).toContain('data.gov.sg');
      expect(note, locale).toContain('Singapore Open Data Licence v1.0');
    }
  });

  /**
   * fetchedAt (when this site pulled it) and latestPeriod (how current the
   * agency's data is) are different claims. Showing only the first would let a
   * three-year-old series look fresh, which is exactly the foreign-workforce case.
   */
  it('keeps fetch date and reporting period as separate claims', () => {
    for (const s of sgOfficialSources) {
      expect(s.fetchedAt.slice(0, 10), s.datasetKey).not.toBe(s.latestPeriod);
    }
    const discontinued = sgOfficialSources.filter((s) => s.discontinued);
    expect(discontinued.map((s) => s.datasetKey)).toEqual(['foreign_workforce']);
    for (const s of discontinued) {
      expect(s.latestPeriod.length).toBeGreaterThan(0);
    }
  });

  it('renders only the four datasets that answer "what does a month cost"', () => {
    expect(sgOfficialRenderedSources.map((s) => s.datasetKey)).toEqual([
      'hdb_rent',
      'cpi',
      'income',
      'unemployment',
    ]);
    // Resale is buying and foreign_workforce is a discontinued visa series.
    // Both stay in the snapshot and out of the page.
    expect(sgOfficialRenderedSources.map((s) => s.datasetKey)).not.toContain('hdb_resale');
    expect(sgOfficialRenderedSources.map((s) => s.datasetKey)).not.toContain('foreign_workforce');
  });
});

describe('freshness gate', () => {
  const fetched = '2026-08-06T16:34:15+08:00';
  const at = (iso: string) => new Date(iso);

  it('is fresh on the day it was fetched', () => {
    expect(isSgOfficialFresh(fetched, at('2026-08-06T18:00:00+08:00'))).toBe(true);
  });

  it(`is still fresh on day ${SG_OFFICIAL_STALE_DAYS}`, () => {
    expect(isSgOfficialFresh(fetched, at('2026-11-04T16:00:00+08:00'))).toBe(true);
  });

  it(`is stale on day ${SG_OFFICIAL_STALE_DAYS + 1}`, () => {
    expect(isSgOfficialFresh(fetched, at('2026-11-05T18:00:00+08:00'))).toBe(false);
  });

  it('treats a future fetch date as stale, not fresh (clock skew or typo)', () => {
    expect(isSgOfficialFresh(fetched, at('2026-08-01T00:00:00+08:00'))).toBe(false);
  });

  it('fails closed on an unparseable date', () => {
    expect(sgOfficialAgeDays('not-a-date')).toBe(Number.POSITIVE_INFINITY);
    expect(isSgOfficialFresh('not-a-date')).toBe(false);
  });

  it('the section banner only watches the datasets it renders', () => {
    // The discontinued foreign-workforce series must not be able to trip it.
    expect(anyRenderedSourceStale(at('2026-08-07T00:00:00+08:00'))).toBe(false);
    expect(anyRenderedSourceStale(at('2027-08-07T00:00:00+08:00'))).toBe(true);
  });
});

describe('HDB rent, the number most at risk of being misread', () => {
  const { rent } = sgOfficial;

  it('is a whole flat of one flat type in one quarter, stated in the type', () => {
    expect(rent.unit).toBe('whole_flat');
    expect(rent.flatType).toBe('4-RM');
    expect(rent.quarter).toBe('2026-Q2');
    expect(rent.source.latestPeriod).toBe(rent.quarter);
  });

  it('publishes all 25 towns, highest first, all positive', () => {
    expect(rent.byTown.length).toBe(25);
    for (let i = 1; i < rent.byTown.length; i += 1) {
      expect(rent.byTown[i].medianRent).toBeLessThanOrEqual(rent.byTown[i - 1].medianRent);
    }
    for (const t of rent.byTown) {
      expect(t.medianRent, t.town).toBeGreaterThan(0);
    }
  });

  /**
   * THE MIXING TRIPWIRE. A whole 4-room flat cannot rent for room money. If a
   * value ever drops to that magnitude, someone has pushed a per-person estimate
   * from the Numbeo layer into the official table, which is the single worst
   * thing that could happen to this page.
   */
  it('holds no value low enough to be a single room', () => {
    for (const t of rent.byTown) {
      expect(t.medianRent, `${t.town} looks like a room price, not a whole flat`)
        .toBeGreaterThanOrEqual(2500);
    }
  });

  it('keeps the official English name intact and pairs it with a hand-written Chinese one', () => {
    for (const t of rent.byTown) {
      expect(t.town, t.town).toBe(t.town.toUpperCase());
      expect(t.townZh.length, t.town).toBeGreaterThan(0);
      // Machine translation is banned by docs/UX_PRINCIPLES.md rule 10; a name
      // left in English would be the tell that nobody wrote one.
      expect(t.townZh, t.town).toMatch(/[一-鿿]/);
    }
    expect(new Set(rent.byTown.map((t) => t.town)).size).toBe(25);
  });

  it('labels its derived aggregates consistently with the raw rows', () => {
    expect(rent.highest).toBe(rent.byTown[0].medianRent);
    expect(rent.lowest).toBe(rent.byTown[rent.byTown.length - 1].medianRent);
    expect(rent.p25).toBeLessThanOrEqual(rent.medianOfTowns);
    expect(rent.p75).toBeGreaterThanOrEqual(rent.medianOfTowns);
    expect(rent.spread).toBeCloseTo(rent.highest / rent.lowest, 2);
    for (const t of rent.trend) {
      expect(t.toRent / t.fromRent - 1).toBeCloseTo(t.changePct / 100, 2);
    }
  });
});

describe('reconciles against the 2026-08-06 data.gov.sg pull', () => {
  // Hand-checked against content/sg-official/*.json. A refresh that moves any of
  // these has to move this test too, so no figure drifts silently under the copy.
  it('rent', () => {
    expect(sgOfficial.rent.byTown[0]).toMatchObject({ town: 'CENTRAL', medianRent: 4600 });
    expect(sgOfficial.rent.byTown[24]).toMatchObject({ town: 'CHOA CHU KANG', medianRent: 3000 });
    expect(sgOfficial.rent.medianOfTowns).toBe(3400);
    expect(sgOfficial.rent.p25).toBe(3200);
    expect(sgOfficial.rent.p75).toBe(3800);
  });

  it('cpi', () => {
    expect(sgOfficial.cpi.month).toBe('2026-06');
    expect(sgOfficial.cpi.yoyAllItems).toBe(1.94);
    expect(sgOfficial.cpi.yoyFood).toBe(2.13);
    expect(sgOfficial.cpi.yoyHousingUtilities).toBe(0.31);
    expect(sgOfficial.cpi.yoyTransport).toBe(7.48);
  });

  it('income, both CPF treatments, because the comparison depends on which one', () => {
    expect(sgOfficial.income.year).toBe('2025');
    expect(sgOfficial.income.medianMonthlyInclEmployerCpf).toBe(5775);
    expect(sgOfficial.income.medianMonthlyExclEmployerCpf).toBe(5000);
    expect(sgOfficial.income.population).toBe('resident_full_time');
  });

  it('unemployment', () => {
    expect(sgOfficial.unemployment.period).toBe('2026-06');
    expect(sgOfficial.unemployment.seasonallyAdjustedRate).toBe(2.0);
    expect(sgOfficial.unemployment.coverage).toBe('overall');
    expect(sgOfficial.unemployment.quartersInBand).toBeGreaterThanOrEqual(8);
    expect(sgOfficial.unemployment.seasonallyAdjustedRate).toBeGreaterThanOrEqual(1.9);
    expect(sgOfficial.unemployment.seasonallyAdjustedRate).toBeLessThanOrEqual(2.0);
  });

  it('resale, carried but not rendered, and counted from real transactions', () => {
    expect(sgOfficial.resale.medianByFlatType['4 ROOM']).toBe(625000);
    expect(sgOfficial.resale.transactionsLatestMonth).toBe(2654);
    expect(sgOfficial.resale.transactionsInWindow).toBe(78567);
  });
});

describe('official-section copy', () => {
  it('ships every field in both locales', () => {
    for (const locale of LOCALES) {
      const c = sgOfficialCopy[locale];
      for (const [key, value] of Object.entries(c)) {
        if (typeof value === 'string') {
          expect(value.length, `${locale}.${key}`).toBeGreaterThan(0);
        }
      }
      expect(c.stats.map((s) => s.key)).toEqual(['cpi', 'income', 'unemployment']);
      for (const s of c.stats) {
        expect(s.label.length, `${locale}.${s.key}.label`).toBeGreaterThan(0);
        expect(s.value.length, `${locale}.${s.key}.value`).toBeGreaterThan(0);
        expect(s.reading.length, `${locale}.${s.key}.reading`).toBeGreaterThan(0);
      }
    }
  });

  /**
   * The six datasets disagree on granularity on purpose: rent is quarterly, CPI
   * and unemployment monthly, income annual. Each figure has to show its own
   * period, in the reader's language, or the section implies they are all as
   * current as the newest one.
   */
  it('renders each period in its own granularity and locale', () => {
    expect(sgOfficialPeriodLabel('2026-Q2', 'zh-TW')).toBe('2026 年第 2 季');
    expect(sgOfficialPeriodLabel('2026-Q2', 'en')).toBe('2026 Q2');
    expect(sgOfficialPeriodLabel('2026-06', 'zh-TW')).toBe('2026 年 6 月');
    expect(sgOfficialPeriodLabel('2026-06', 'en')).toBe('June 2026');
    expect(sgOfficialPeriodLabel('2025', 'zh-TW')).toBe('2025 年');
    expect(sgOfficialPeriodLabel('2025', 'en')).toBe('2025');
    // Every rendered dataset's period must actually be translated in zh-TW, not
    // echoed back as a raw ISO string in the middle of Chinese copy.
    for (const s of sgOfficialRenderedSources) {
      expect(sgOfficialPeriodLabel(s.latestPeriod, 'zh-TW'), `${s.datasetKey} left untranslated`)
        .not.toBe(s.latestPeriod);
    }
  });

  it('both locales carry the same field and stat shape', () => {
    expect(Object.keys(sgOfficialCopy.en).sort()).toEqual(Object.keys(sgOfficialCopy['zh-TW']).sort());
  });

  /**
   * The copy holds tokens, never typed-in figures, so it cannot keep quoting an
   * old quarter after a refresh. A token with no value behind it would render as
   * literal braces in front of a reader.
   */
  it('leaves no unresolved token in either locale', () => {
    for (const locale of LOCALES) {
      const vars = sgOfficialVars(locale);
      const c = sgOfficialCopy[locale];
      const strings = [
        ...Object.values(c).filter((v): v is string => typeof v === 'string'),
        ...c.stats.flatMap((s) => [s.label, s.value, s.reading]),
      ];
      for (const s of strings) {
        const filled = fillSgOfficial(s, vars);
        expect(filled, `${locale}: unresolved token in "${s.slice(0, 60)}"`).not.toMatch(/\{\w+\}/);
      }
      for (const [key, value] of Object.entries(vars)) {
        expect(value.length, `${locale}.${key} resolved to an empty string`).toBeGreaterThan(0);
      }
    }
  });

  it('states the unit, the provenance split, the licence and the ageing rule', () => {
    const fill = (locale: (typeof LOCALES)[number]) => {
      const vars = sgOfficialVars(locale);
      const c = sgOfficialCopy[locale];
      return {
        intro: fillSgOfficial(c.intro, vars),
        caliberWarning: fillSgOfficial(c.caliberWarning, vars),
        licenceNote: fillSgOfficial(c.licenceNote, vars),
        staleNote: fillSgOfficial(c.staleNote, vars),
      };
    };
    const zh = fill('zh-TW');
    const en = fill('en');
    // Unit: whole flat, not one room, and the two tables are not interchangeable.
    expect(zh.caliberWarning).toContain('整戶');
    expect(zh.caliberWarning).toContain('不能相加');
    expect(en.caliberWarning).toContain('whole');
    expect(en.caliberWarning).toContain('cannot be added together');
    // Provenance: which figures are the government's and which are mine.
    expect(zh.intro).toContain('新加坡政府自己發布');
    expect(en.intro).toContain('published by the Singapore government');
    // Licence and non-affiliation.
    expect(zh.licenceNote).toContain('沒有任何隸屬關係');
    expect(en.licenceNote).toContain('not affiliated with the Singapore government');
    // Degradation, promised in the always-visible note and delivered in staleNote.
    expect(zh.licenceNote).toContain(`${SG_OFFICIAL_STALE_DAYS} 天`);
    expect(zh.staleNote).toContain('沒有被隱藏');
    expect(en.staleNote).toContain('nothing has been hidden');
  });

  /**
   * The rent dataset publishes medians, not a tenancy count. "13,305 tenancies"
   * was a misreading of the row count and would be trivially falsifiable. The
   * only real transaction count on this data is the resale series.
   */
  it('never claims a tenancy count the dataset does not publish', () => {
    const all = JSON.stringify(sgOfficialCopy);
    expect(all).not.toContain('13,305');
    expect(all).not.toContain('13305');
  });

  it('keeps Michael’s punctuation rules', () => {
    const all = JSON.stringify(sgOfficialCopy);
    expect(all).not.toMatch(/——/);
    expect(all).not.toMatch(/—/);
    for (const locale of LOCALES) {
      const strings = Object.values(sgOfficialCopy[locale]).filter(
        (v): v is string => typeof v === 'string',
      );
      const readings = sgOfficialCopy[locale].stats.flatMap((s) => [s.label, s.value, s.reading]);
      if (locale !== 'zh-TW') continue;
      for (const s of [...strings, ...readings]) {
        expect(s, `half-width punctuation after a Chinese character: ${s.slice(0, 60)}`)
          .not.toMatch(/[一-鿿][,.]/);
      }
    }
  });
});
