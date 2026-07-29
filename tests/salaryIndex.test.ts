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
        expect(c.lo, `${c.market}/${c.fn}/${c.seniority} n=${c.n}`).toBeNull();
        expect(c.hi).toBeNull();
      }
    }
  });

  it('publishes a complete range whenever it does publish', () => {
    for (const c of salaryCells.filter(publishable)) {
      expect(c.lo).not.toBeNull();
      expect(c.hi).not.toBeNull();
      expect(c.hi!).toBeGreaterThanOrEqual(c.lo!);
      expect(c.currency.length).toBe(3);
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
    // The number the pre-Gate-8 docs got wrong: three cells clear n≥5, not five.
    expect(salaryCells.filter(publishable).length).toBe(3);
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

  it('the observation counts add up to the ledger total', () => {
    const inCells = salaryCells.reduce((a, c) => a + c.n, 0);
    // Verified against the ledger: 72 rows sit in cells, 26 have unreadable
    // seniority (the single `estimated` row is one of those 26), and nothing
    // else exists. Every observation is therefore either published, counted
    // towards a below-threshold cell, or explicitly excluded — none is dropped
    // silently, which is the property this test exists to hold.
    expect(inCells).toBe(72);
    expect(inCells + salaryIndexMeta.excludedUnknownSeniority).toBe(
      salaryIndexMeta.totalObservations,
    );
  });
});
