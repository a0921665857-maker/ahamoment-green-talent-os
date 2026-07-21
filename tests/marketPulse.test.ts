import { describe, expect, it } from 'vitest';
import { MARKET_PULSE_STALE_DAYS, isMarketPulseFresh, marketPulse } from '../content/marketPulse';

describe('marketPulse freshness gate', () => {
  const now = new Date('2026-07-22T12:00:00+08:00');

  it('renders on the day it was updated', () => {
    expect(isMarketPulseFresh('2026-07-22', now)).toBe(true);
  });

  it(`renders up to ${MARKET_PULSE_STALE_DAYS} days after update`, () => {
    expect(isMarketPulseFresh('2026-07-02', now)).toBe(true);
  });

  it('hides once the data is older than the stale window', () => {
    expect(isMarketPulseFresh('2026-06-29', now)).toBe(false);
  });

  it('hides on a future updatedAt (clock skew or typo)', () => {
    expect(isMarketPulseFresh('2026-08-01', now)).toBe(false);
  });

  it('hides on an invalid date string', () => {
    expect(isMarketPulseFresh('not-a-date', now)).toBe(false);
  });
});

describe('marketPulse data discipline', () => {
  it('every item carries posted date, disclosed salary, and a live-checked url', () => {
    expect(marketPulse.items.length).toBeGreaterThan(0);
    for (const item of marketPulse.items) {
      expect(item.posted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.salary.length).toBeGreaterThan(0);
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.roleZh.length).toBeGreaterThan(0);
      expect(item.roleEn.length).toBeGreaterThan(0);
      expect(item.org.length).toBeGreaterThan(0);
    }
  });

  it('both locales ship complete copy', () => {
    for (const copy of [marketPulse.zh, marketPulse.en]) {
      expect(copy.eyebrow.length).toBeGreaterThan(0);
      expect(copy.intro.length).toBeGreaterThan(0);
      expect(copy.reading.length).toBeGreaterThan(0);
      expect(copy.sourceNote.length).toBeGreaterThan(0);
      expect(copy.jobsCta.length).toBeGreaterThan(0);
    }
  });
});
