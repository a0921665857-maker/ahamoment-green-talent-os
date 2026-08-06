import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { costOfLiving, type CostOfLiving } from '@/content/costOfLiving';
import { sgOfficial } from '@/content/sgOfficial';
import { LOCALES } from '@/lib/constants';

/**
 * /cost-of-living now carries two layers of data that must never be confused:
 * second-hand estimates (Numbeo, Wise, blog surveys) in one-person monthly
 * budgets, and official data.gov.sg figures in whole-flat medians and macro
 * series. These tests hold the wall between them, and hold the page's voice and
 * its funnel link in place while content around them changes.
 */

const pageSource = readFileSync(
  join(process.cwd(), 'app', '(site)', '[locale]', 'cost-of-living', 'page.tsx'),
  'utf8',
);

function stringFields(c: CostOfLiving): [string, string][] {
  const out: [string, string][] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === 'string') out.push([path, value]);
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
    }
  };
  walk(c, '');
  return out;
}

describe('cost-of-living bilingual completeness', () => {
  it('ships every string in both locales', () => {
    for (const locale of LOCALES) {
      for (const [path, value] of stringFields(costOfLiving[locale])) {
        expect(value.length, `${locale}${path}`).toBeGreaterThan(0);
      }
    }
  });

  it('both locales expose the same shape', () => {
    const shape = (c: CostOfLiving) => stringFields(c).map(([p]) => p);
    expect(shape(costOfLiving.en)).toEqual(shape(costOfLiving['zh-TW']));
  });

  it('every table row matches its header width', () => {
    for (const locale of LOCALES) {
      const c = costOfLiving[locale];
      for (const table of [c.sgTable, c.twTable]) {
        for (const row of table.rows) {
          expect(row.length, `${locale} row [${row[0]}]`).toBe(table.head.length);
        }
      }
      for (const row of c.verdictRows) {
        expect(row.stage.length).toBeGreaterThan(0);
        expect(row.note.length).toBeGreaterThan(0);
      }
      expect(c.verdictHead.length).toBe(4);
    }
  });

  it('every source carries a label, a note and a reachable-looking url', () => {
    for (const locale of LOCALES) {
      for (const s of costOfLiving[locale].sources) {
        expect(s.label.length, s.url).toBeGreaterThan(0);
        expect(s.note.length, s.url).toBeGreaterThan(0);
        expect(s.url, s.label).toMatch(/^(https:\/\/|\/)/);
      }
      const urls = costOfLiving[locale].sources.map((s) => s.url);
      expect(new Set(urls).size, `${locale} has a duplicate source url`).toBe(urls.length);
    }
  });
});

describe('Michael’s voice canon, enforced rather than remembered', () => {
  it('uses no em dash anywhere', () => {
    expect(JSON.stringify(costOfLiving)).not.toMatch(/——/);
    expect(JSON.stringify(costOfLiving)).not.toMatch(/—/);
  });

  it('keeps zh-TW punctuation full-width', () => {
    for (const [path, value] of stringFields(costOfLiving['zh-TW'])) {
      expect(value, `half-width punctuation after a Chinese character at ${path}`)
        .not.toMatch(/[一-鿿][,.]/);
    }
  });
});

describe('the first-hand / second-hand wall', () => {
  /**
   * THE ONE THAT MATTERS MOST. The official rents are whole 4-room flats shared
   * by two or three people; sgTable is one person's monthly budget. Dropping an
   * official figure into that table would turn the page from "here is the maths"
   * into "you personally owe the rent on a whole flat", and would destroy the
   * distinction between what the government published and what I estimated.
   */
  it('no official rent figure has leaked into the estimate tables', () => {
    const rents = sgOfficial.rent.byTown.map((t) => t.medianRent);
    // A whole-flat median pasted in would arrive as a complete amount, e.g.
    // "S$4,600". Bare digits are not enough to judge on: the estimate ranges
    // already end in round hundreds, so "S$1,500–3,500" shares an upper bound
    // with a town median by coincidence and is not a leak.
    const asAmount = rents.map((r) => `S$${r.toLocaleString('en-US')}`);
    // These are not round hundreds, so they cannot turn up in an estimate range
    // by chance. Any appearance at all is a leak.
    const distinctive = rents.filter((r) => r % 100 !== 0).map((r) => r.toLocaleString('en-US'));
    expect(distinctive.length, 'expected some non-round town medians to guard with').toBeGreaterThan(
      0,
    );

    for (const locale of LOCALES) {
      const c = costOfLiving[locale];
      const cells = [
        ...c.sgTable.rows.flat(),
        ...c.twTable.rows.flat(),
        ...c.verdictRows.flatMap((r) => [r.nominal, r.disposable]),
      ];
      for (const cell of cells) {
        for (const value of asAmount) {
          expect(cell, `${locale}: official whole-flat median ${value} pasted into an estimate cell`)
            .not.toContain(value);
        }
        for (const value of distinctive) {
          expect(cell, `${locale}: official figure ${value} appears in an estimate cell`)
            .not.toContain(value);
        }
      }
    }
  });

  it('the official figures stay in SGD and never enter the Taipei table', () => {
    for (const locale of LOCALES) {
      for (const cell of costOfLiving[locale].twTable.rows.flat()) {
        expect(cell).not.toContain('S$');
      }
      for (const cell of costOfLiving[locale].sgTable.rows.flat().slice(1)) {
        expect(cell).not.toContain('NT$');
      }
    }
  });

  it('the byline and method disclose that there are two layers with two dates', () => {
    const zh = costOfLiving['zh-TW'];
    const en = costOfLiving.en;
    expect(zh.byline).toContain('二手估計');
    expect(zh.byline).toContain('官方數據');
    expect(en.byline).toContain('Second-hand estimates');
    expect(en.byline).toContain('official data retrieved');
    expect(zh.method).toContain('data.gov.sg');
    expect(zh.method).toContain('沒有混合計算');
    expect(zh.method).toContain('沒有換算成新台幣');
    expect(en.method).toContain('data.gov.sg');
    expect(en.method).toContain('never merged into one calculation');
  });

  it('cites all four rendered datasets and the licence in the sources list', () => {
    for (const locale of LOCALES) {
      const urls = costOfLiving[locale].sources.map((s) => s.url);
      for (const source of [
        sgOfficial.rent.source,
        sgOfficial.cpi.source,
        sgOfficial.income.source,
        sgOfficial.unemployment.source,
      ]) {
        expect(urls, `${locale} is missing ${source.datasetKey}`).toContain(source.datasetUrl);
      }
      expect(urls).toContain(sgOfficial.rent.source.licenceUrl);
      // The discontinued visa series is not cited, because it is not used.
      expect(urls).not.toContain(sgOfficial.foreignWorkforce.source.datasetUrl);
    }
  });

  it('never claims a tenancy count the rent dataset does not publish', () => {
    expect(JSON.stringify(costOfLiving)).not.toContain('13,305');
  });
});

describe('what this change was not allowed to touch', () => {
  /**
   * The disposable multiples are coupled to lib/salaryBands.ts and to the MRI
   * report's own band copy. Recomputing them here because official rents arrived
   * would put two pages of the site into open contradiction. Official figures
   * are corroboration on this page, never an input to these two numbers.
   */
  it('leaves the disposable multiples exactly where salaryBands expects them', () => {
    expect(costOfLiving['zh-TW'].verdictRows.map((r) => r.disposable)).toEqual([
      '約 1.6 倍',
      '約 2.5 倍',
    ]);
    expect(costOfLiving.en.verdictRows.map((r) => r.disposable)).toEqual(['~1.6×', '~2.5×']);
    expect(costOfLiving['zh-TW'].verdictRows.map((r) => r.nominal)).toEqual([
      '約 2.4 倍',
      '約 3 倍',
    ]);
    expect(costOfLiving.en.verdictRows.map((r) => r.nominal)).toEqual(['~2.4×', '~3×']);
  });

  it('keeps the MRI funnel link and all three utm parameters intact', () => {
    expect(pageSource).toContain('/mri?utm_source=cost_of_living');
    expect(pageSource).toContain('utm_medium=on_site');
    expect(pageSource).toContain('utm_content=cta');
    expect(pageSource).toContain('{r.ctaButton}');
  });

  it('still renders the official block, and renders it after the estimates', () => {
    expect(pageSource).toContain('<SgOfficialDataSection locale={L} />');
    expect(pageSource.indexOf('{r.sgAfter}')).toBeLessThan(
      pageSource.indexOf('<SgOfficialDataSection'),
    );
    expect(pageSource.indexOf('<SgOfficialDataSection')).toBeLessThan(
      pageSource.indexOf('{r.twTitle}'),
    );
  });

  /**
   * Without a revalidate the page is frozen at build time, `new Date()` in the
   * official block never advances, and the 90-day staleness notice can never
   * fire. Deleting this line silently disables the whole degradation mechanism.
   */
  it('re-renders often enough for the staleness notice to be able to fire', () => {
    expect(pageSource).toMatch(/export const revalidate = \d+/);
    const seconds = Number(/export const revalidate = (\d+)/.exec(pageSource)?.[1]);
    expect(seconds).toBeGreaterThan(0);
    expect(seconds).toBeLessThanOrEqual(86_400);
  });
});
