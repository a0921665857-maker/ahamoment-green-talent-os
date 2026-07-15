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
