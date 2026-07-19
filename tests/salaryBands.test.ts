import { describe, expect, it } from 'vitest';
import { getPersonalBand, _internal } from '@/lib/salaryBands';
import { salaryReports } from '@/content/salaryReport';

describe('getPersonalBand — deterministic mapping', () => {
  it('maps carbon-markets × 5y to the carbon mid band', () => {
    const b = getPersonalBand(['carbon-markets'], 5, 'zh-TW');
    expect(b).not.toBeNull();
    expect(b!.functionLabel).toBe('碳市場');
    expect(b!.expLabel).toBe('4 到 8 年');
    expect(b!.sgBand).toContain('S$104k');
    expect(b!.disposable).toBe('2.5×');
  });

  it('maps esg-advisory × 2y to the consulting entry band (monthly figure)', () => {
    const b = getPersonalBand(['esg-advisory'], 2, 'zh-TW');
    expect(b!.functionLabel).toBe('ESG 顧問');
    expect(b!.sgBand).toContain('S$4.5k–6.4k');
    expect(b!.disposable).toBe('1.6×');
  });

  it('first mapped sector wins when several are present', () => {
    const b = getPersonalBand(['climate-tech', 'green-finance', 'esg-advisory'], 10, 'zh-TW');
    expect(b!.functionLabel).toBe('永續金融');
    expect(b!.expLabel).toBe('8 年以上');
    expect(b!.disposable).toBeNull(); // senior disposable multiple was never computed — never invented
  });

  it('returns null for honestly unmapped sectors (the report says the data is too thin)', () => {
    expect(getPersonalBand(['climate-tech'], 5, 'zh-TW')).toBeNull();
    expect(getPersonalBand(['renewable-energy', 'climate-policy'], 5, 'zh-TW')).toBeNull();
    expect(getPersonalBand([], 5, 'zh-TW')).toBeNull();
  });

  it('returns null when years are unknown or invalid — no guessing from seniority labels', () => {
    expect(getPersonalBand(['carbon-markets'], null, 'zh-TW')).toBeNull();
    expect(getPersonalBand(['carbon-markets'], undefined, 'zh-TW')).toBeNull();
    expect(getPersonalBand(['carbon-markets'], -1, 'zh-TW')).toBeNull();
    expect(getPersonalBand(['carbon-markets'], Number.NaN, 'zh-TW')).toBeNull();
  });

  it('localises labels for /en readers', () => {
    const b = getPersonalBand(['carbon-markets'], 5, 'en');
    expect(b!.functionLabel).toBe('Carbon markets');
    expect(b!.sgBand).toContain('analyst');
    expect(b!.twAnchor).toContain('Taiwan');
  });
});

describe('drift guard — bands must stay verbatim in the salary report dataset', () => {
  const zhCells = salaryReports['zh-TW'].sgTable.rows.flat().join('\n');

  it('every zh SG band string appears in content/salaryReport.ts sgTable', () => {
    for (const row of Object.values(_internal.FUNCTION_ROWS)) {
      for (const band of Object.values(row.bands)) {
        // senior finance is rendered inside a longer cell; substring match is the contract
        expect(zhCells).toContain(band.replace('月 ', '月 '));
      }
    }
  });

  it('every mapped sector slug is a real taxonomy slug', async () => {
    const { isKnownSlug } = await import('@/lib/taxonomy');
    for (const slug of Object.keys(_internal.SECTOR_TO_FUNCTION)) {
      expect(isKnownSlug('sectors', slug)).toBe(true);
    }
  });
});

describe('getQuickBand — quick-read (zero-typing) mapping', () => {
  it('maps finance × y1 (1–3y) to the finance entry band', async () => {
    const { getQuickBand } = await import('@/lib/salaryBands');
    const qb = getQuickBand('finance', 'y1', 'zh-TW');
    expect(qb).not.toBeNull();
    expect(qb!.band!.functionLabel).toBe('永續金融');
    expect(qb!.band!.sgBand).toBe('S$65k–90k');
    expect(qb!.nominal).toBe('1.8–3.3×');
    expect(qb!.disposable).toBe('1.6×');
  });

  it('y6 (6–8y) rounds DOWN to mid, never up to senior', async () => {
    const { getQuickBand } = await import('@/lib/salaryBands');
    const qb = getQuickBand('carbon', 'y6', 'zh-TW');
    expect(qb!.band!.expLabel).toBe('4 到 8 年');
    expect(qb!.band!.sgBand).toContain('S$104k');
  });

  it('y8 maps to senior; senior disposable stays null (never invented)', async () => {
    const { getQuickBand } = await import('@/lib/salaryBands');
    const qb = getQuickBand('corporate', 'y8', 'zh-TW');
    expect(qb!.band!.sgBand).toBe('S$200k–400k');
    expect(qb!.disposable).toBeNull();
  });

  it("'other' sector: no SG band row, but exp-column facts still returned", async () => {
    const { getQuickBand } = await import('@/lib/salaryBands');
    const qb = getQuickBand('other', 'y1', 'zh-TW');
    expect(qb!.band).toBeNull();
    expect(qb!.twAnchor).toContain('68 萬');
    expect(qb!.nominal).toBe('1.8–3.3×');
  });

  it('unknown years option → null (no guessing)', async () => {
    const { getQuickBand } = await import('@/lib/salaryBands');
    expect(getQuickBand('finance', 'bogus', 'zh-TW')).toBeNull();
  });

  it('quick band strings stay inside the drift-guarded dataset', async () => {
    const { getQuickBand, _internal } = await import('@/lib/salaryBands');
    for (const sector of ['finance', 'carbon', 'consulting', 'corporate']) {
      for (const y of Object.keys(_internal.QUICK_YEARS)) {
        const qb = getQuickBand(sector, y, 'zh-TW');
        expect(qb).not.toBeNull();
        expect(qb!.band).not.toBeNull();
      }
    }
  });
});
