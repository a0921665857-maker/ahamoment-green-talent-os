import { describe, expect, it } from 'vitest';
import { composeBrief, mergeSources, normalizeSource, sgtDateString, type BriefData } from '@/lib/morning-brief';

// 2026-07-03 02:00 UTC = 2026-07-03 10:00 SGT → yesterday in SGT is 2026-07-02.
const NOW = new Date('2026-07-03T02:00:00Z');

function data(overrides: Partial<BriefData> = {}): BriefData {
  return {
    days: [
      { day: '2026-06-30', pageviews: 20, started: 4, reports: 2, cta: 1 },
      { day: '2026-07-01', pageviews: 10, started: 2, reports: 1, cta: 0 },
      { day: '2026-07-02', pageviews: 15, started: 3, reports: 2, cta: 1 },
      { day: '2026-07-03', pageviews: 5, started: 1, reports: 0, cta: 0 },
    ],
    sources: [
      { source: 'threads', pageviews: 30, started: 7 },
      { source: 'direct', pageviews: 12, started: 1 },
    ],
    funnel: { started: 10, material: 5, questions: 3, reports: 6, cta: 2 },
    ...overrides,
  };
}

describe('sgtDateString', () => {
  it('converts UTC instants to Singapore calendar dates', () => {
    // 23:30 UTC on the 2nd is already the 3rd in SGT (UTC+8).
    expect(sgtDateString(new Date('2026-07-02T23:30:00Z'))).toBe('2026-07-03');
    expect(sgtDateString(NOW)).toBe('2026-07-03');
  });
});

describe('normalizeSource / mergeSources', () => {
  it('collapses threads referrer variants and $direct into canonical channels', () => {
    expect(normalizeSource('l.threads.com')).toBe('threads');
    expect(normalizeSource('www.threads.net')).toBe('threads');
    expect(normalizeSource('$direct')).toBe('direct');
    expect(normalizeSource('my-app.vercel.app')).toBe('internal');
    expect(normalizeSource('www.google.com')).toBe('google.com');
  });

  it('sums merged channels so the top source is counted whole', () => {
    const merged = mergeSources([
      { source: 'l.threads.com', pageviews: 135, started: 35 },
      { source: 'threads', pageviews: 7, started: 2 },
      { source: '$direct', pageviews: 92, started: 10 },
    ]);
    expect(merged[0]).toEqual({ source: 'threads', pageviews: 142, started: 37 });
    expect(merged[1]).toEqual({ source: 'direct', pageviews: 92, started: 10 });
  });
});

describe('composeBrief', () => {
  it("reports yesterday's SGT numbers, not today's partial day", () => {
    const brief = composeBrief(data(), NOW);
    expect(brief).toContain('昨天:瀏覽 15 · 開始 MRI 3 · 看報告 2 · 點 CTA 1');
    // Prior-day average excludes yesterday and today: (20+10)/2 = 15 pv, (4+2)/2 = 3 started.
    expect(brief).toContain('前 2 天日均:瀏覽 15 · 開始 3');
  });

  it('shows the 7-day funnel with step conversion percentages', () => {
    const brief = composeBrief(data(), NOW);
    expect(brief).toContain('開始 10 → 交素材 5(50%)→ 答完題 3(60%)→ 看報告 6 → 點 CTA 2');
  });

  it('bases the action line on the best 7-day source by MRI starts', () => {
    const brief = composeBrief(data(), NOW);
    expect(brief).toContain('「threads」帶來最多開始 MRI(7 人)');
  });

  it('handles a totally quiet week without division-by-zero artifacts', () => {
    const brief = composeBrief(
      data({
        days: [],
        sources: [],
        funnel: { started: 0, material: 0, questions: 0, reports: 0, cta: 0 },
      }),
      NOW,
    );
    expect(brief).toContain('昨天:瀏覽 0 · 開始 MRI 0');
    expect(brief).toContain('(—)');
    expect(brief).toContain('直接發一則導流貼文');
    expect(brief).not.toContain('NaN');
  });
});
