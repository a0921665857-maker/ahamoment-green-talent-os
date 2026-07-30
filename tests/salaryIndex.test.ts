import { describe, expect, it } from 'vitest';
import { MIN_N, publishable, salaryCells, salaryIndexMeta } from '@/content/salaryIndex';

/**
 * These guard the one claim the page makes about itself: a number appears only
 * when the cell has cleared the threshold. Everything the site's credibility
 * rests on is downstream of that rule holding.
 */
describe('posted-salary index integrity', () => {
  it('never publishes a range below the threshold', () => {
    for (const c of salaryCells) {
      if (c.n < MIN_N) {
        expect(c.p25, `${c.market}/${c.fn}/${c.seniority} n=${c.n}`).toBeNull();
        expect(c.p75).toBeNull();
        expect(c.median).toBeNull();
      }
    }
  });

  it('publishes a complete, ordered quartile range whenever it does publish', () => {
    for (const c of salaryCells.filter(publishable)) {
      expect(c.p25).not.toBeNull();
      expect(c.p75).not.toBeNull();
      expect(c.median).not.toBeNull();
      expect(c.p75!).toBeGreaterThanOrEqual(c.p25!);
      expect(c.median!).toBeGreaterThanOrEqual(c.p25!);
      expect(c.median!).toBeLessThanOrEqual(c.p75!);
      expect(c.currency.length).toBe(3);
    }
  });

  /**
   * The defect this replaced: the first export published min-to-max, so a single
   * SGD 1,000 internship posting set the published entry floor for Singapore
   * in-house sustainability. An intern is not an early-career hire.
   */
  it('publishes no floor low enough to be an internship', () => {
    for (const c of salaryCells.filter(publishable)) {
      if (c.currency === 'SGD' && c.period === 'monthly') {
        expect(c.p25!, `${c.market}/${c.fn}/${c.seniority}`).toBeGreaterThan(2000);
      }
    }
  });

  it('reports every cell, including the ones with no numbers', () => {
    // The empty cells are the product. If a future export silently drops them,
    // the page turns into exactly the kind of source it exists to replace.
    expect(salaryCells.length).toBeGreaterThan(salaryCells.filter(publishable).length);
    expect(salaryCells.every((c) => c.n > 0)).toBe(true);
  });

  it('matches the reconciled ledger snapshot of 2026-07-30', () => {
    expect(salaryIndexMeta.totalObservations).toBe(98);
    expect(salaryIndexMeta.postedObservations).toBe(97);
    expect(salaryIndexMeta.excludedUnknownSeniority).toBe(26);
    expect(salaryIndexMeta.excludedInternship).toBe(1);
    expect(salaryIndexMeta.excludedDuplicate).toBe(12);
    expect(salaryIndexMeta.postingsInCells).toBe(59);
    // The number the pre-Gate-8 docs got wrong: three cells clear n≥5, not five.
    expect(salaryCells.filter(publishable).length).toBe(3);
  });

  it('accounts for every posted row with readable seniority', () => {
    // 72 posted rows had readable seniority; 1 intern and 12 duplicates were
    // removed, leaving 59 distinct postings. Nothing is dropped silently.
    expect(
      salaryIndexMeta.postingsInCells +
        salaryIndexMeta.excludedInternship +
        salaryIndexMeta.excludedDuplicate,
    ).toBe(72);
    expect(salaryCells.reduce((a, c) => a + c.n, 0)).toBe(salaryIndexMeta.postingsInCells);
  });

  it('does not claim to be hand-collected', () => {
    expect(salaryIndexMeta.collectedBy).toContain('green-jobs-weekly');
    expect(salaryIndexMeta.ledgerOpenedOn).toBe('2026-07-21');
  });

  it('every publishable cell today is Singapore — the skew is disclosed, not hidden', () => {
    expect(new Set(salaryCells.filter(publishable).map((c) => c.market))).toEqual(new Set(['SG']));
  });

  it('carries no verification claim it has not earned', () => {
    expect(salaryIndexMeta.verification).toBe('source_available_unverified');
    expect(salaryCells.every((c) => c.verification !== 'manually_verified')).toBe(true);
  });

  it('has no duplicate cells', () => {
    const keys = salaryCells.map((c) => `${c.market}/${c.fn}/${c.seniority}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('reconciles back to the ledger total', () => {
    // 98 = 59 in cells + 1 intern + 12 duplicates + 26 unreadable seniority.
    // (The single `estimated` row is one of the 26.)
    expect(
      salaryIndexMeta.postingsInCells +
        salaryIndexMeta.excludedInternship +
        salaryIndexMeta.excludedDuplicate +
        salaryIndexMeta.excludedUnknownSeniority,
    ).toBe(salaryIndexMeta.totalObservations);
  });
});
