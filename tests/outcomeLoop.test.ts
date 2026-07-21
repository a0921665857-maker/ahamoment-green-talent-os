import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  earliestBookedBySession,
  excludeAlreadyHandled,
  fillOutcomeTemplate,
  inStageWindow,
  isEnabled,
  stageWindow,
} from '@/lib/outcomeLoop';

const NOW = new Date('2026-07-21T02:00:00Z');
const DAY_MS = 24 * 60 * 60 * 1000;

describe('stageWindow / inStageWindow', () => {
  it('d30 opens at 30 days and closes at 44; d90 opens at 90 and closes at 104', () => {
    const d30 = stageWindow('d30', NOW);
    expect(d30.newestAllowed.toISOString()).toBe('2026-06-21T02:00:00.000Z');
    expect(d30.oldestAllowed.toISOString()).toBe('2026-06-07T02:00:00.000Z');
    const d90 = stageWindow('d90', NOW);
    expect(d90.newestAllowed.toISOString()).toBe('2026-04-22T02:00:00.000Z');
    expect(d90.oldestAllowed.toISOString()).toBe('2026-04-08T02:00:00.000Z');
  });

  it('a booking exactly 30 days old is inside the d30 window; 29 days old is not yet eligible', () => {
    const exactly30 = new Date(NOW.getTime() - 30 * DAY_MS);
    const only29 = new Date(NOW.getTime() - 29 * DAY_MS);
    expect(inStageWindow('d30', exactly30, NOW)).toBe(true);
    expect(inStageWindow('d30', only29, NOW)).toBe(false);
  });

  it('a booking 43 days old is still inside the d30 window; 44 days old has aged out (oldest bound is exclusive, same convention as followups.ts)', () => {
    const day43 = new Date(NOW.getTime() - 43 * DAY_MS);
    const day44 = new Date(NOW.getTime() - 44 * DAY_MS);
    expect(inStageWindow('d30', day43, NOW)).toBe(true);
    expect(inStageWindow('d30', day44, NOW)).toBe(false);
  });

  it('a booking eligible for d90 is not simultaneously eligible for d30 (one send per person per stage window)', () => {
    const day90 = new Date(NOW.getTime() - 90 * DAY_MS);
    expect(inStageWindow('d90', day90, NOW)).toBe(true);
    expect(inStageWindow('d30', day90, NOW)).toBe(false);
  });
});

describe('earliestBookedBySession', () => {
  it('parses props.date and keeps one entry per session', () => {
    const rows = [
      { session_id: 'a', props: { date: '2026-06-01T00:00:00Z' } },
      { session_id: 'b', props: { date: '2026-06-05T00:00:00Z' } },
    ];
    const result = earliestBookedBySession(rows);
    expect(result.get('a')?.toISOString()).toBe('2026-06-01T00:00:00.000Z');
    expect(result.get('b')?.toISOString()).toBe('2026-06-05T00:00:00.000Z');
    expect(result.size).toBe(2);
  });

  it('keeps the earliest date when a session somehow has more than one booked row', () => {
    const rows = [
      { session_id: 'a', props: { date: '2026-06-10T00:00:00Z' } },
      { session_id: 'a', props: { date: '2026-06-01T00:00:00Z' } },
    ];
    const result = earliestBookedBySession(rows);
    expect(result.get('a')?.toISOString()).toBe('2026-06-01T00:00:00.000Z');
  });

  it('drops rows with no session_id or an unparsable/missing props.date (defensive against hand-backfilled data)', () => {
    const rows = [
      { session_id: null, props: { date: '2026-06-01T00:00:00Z' } },
      { session_id: 'c', props: { date: 'not-a-date' } },
      { session_id: 'd', props: {} },
      { session_id: 'e', props: null },
    ];
    expect(earliestBookedBySession(rows).size).toBe(0);
  });
});

describe('excludeAlreadyHandled (防重: already sent this stage, or opted out)', () => {
  const candidates = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

  it('drops candidates whose id appears in the handled set', () => {
    const result = excludeAlreadyHandled(candidates, ['b']);
    expect(result.map((c) => c.id)).toEqual(['a', 'c']);
  });

  it('keeps every candidate when nothing has been handled yet', () => {
    const result = excludeAlreadyHandled(candidates, []);
    expect(result).toHaveLength(3);
  });

  it('drops a candidate handled for any reason represented in the set (sent-marker OR opt-out, same mechanism)', () => {
    // The caller merges outcome_d30_sent/outcome_d90_sent and outcome_opted_out
    // session ids into one set before calling this — from this function's
    // point of view they are indistinguishable, which is the point: both mean
    // "never send this person another one of these for this stage again."
    const result = excludeAlreadyHandled(candidates, ['a', 'c']);
    expect(result.map((c) => c.id)).toEqual(['b']);
  });
});

describe('isEnabled (master switch gate)', () => {
  const ORIGINAL = {
    OUTCOME_EMAILS_ENABLED: process.env.OUTCOME_EMAILS_ENABLED,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    RESEND_FROM: process.env.RESEND_FROM,
  };

  beforeEach(() => {
    delete process.env.OUTCOME_EMAILS_ENABLED;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM;
  });

  afterEach(() => {
    for (const [key, value] of Object.entries(ORIGINAL)) {
      if (value === undefined) delete process.env[key as keyof typeof ORIGINAL];
      else process.env[key as keyof typeof ORIGINAL] = value;
    }
  });

  it('is false when OUTCOME_EMAILS_ENABLED is unset (the safe, un-deployed default)', () => {
    process.env.RESEND_API_KEY = 'key';
    process.env.RESEND_FROM = 'from@example.com';
    expect(isEnabled()).toBe(false);
  });

  it('is false when the flag is set but Resend envs are missing', () => {
    process.env.OUTCOME_EMAILS_ENABLED = 'true';
    expect(isEnabled()).toBe(false);
  });

  it('is false for any value other than the exact string "true" (no truthy-string footguns)', () => {
    process.env.OUTCOME_EMAILS_ENABLED = 'TRUE';
    process.env.RESEND_API_KEY = 'key';
    process.env.RESEND_FROM = 'from@example.com';
    expect(isEnabled()).toBe(false);
  });

  it('is true only when the flag is exactly "true" AND both Resend envs are set', () => {
    process.env.OUTCOME_EMAILS_ENABLED = 'true';
    process.env.RESEND_API_KEY = 'key';
    process.env.RESEND_FROM = 'from@example.com';
    expect(isEnabled()).toBe(true);
  });
});

describe('fillOutcomeTemplate', () => {
  const base = {
    locale: 'zh-TW' as const,
    focusArea: '把履歷的量化證據補齊',
    unsubscribeUrl: 'https://example.com/api/outcome/unsubscribe?s=abc',
  };

  it('fills all placeholders', () => {
    const out = fillOutcomeTemplate('{{name}} 你好，\n\n{{focus_area}}\n\n{{unsubscribe_url}}', {
      ...base,
      name: '小明',
    });
    expect(out).toBe(
      '小明 你好，\n\n把履歷的量化證據補齊\n\nhttps://example.com/api/outcome/unsubscribe?s=abc',
    );
  });

  it('drops the name token gracefully in zh-TW when name is missing', () => {
    const out = fillOutcomeTemplate('{{name}} 你好，', { ...base, name: null });
    expect(out).toBe('你好，');
  });

  it("falls back to 'there' in en when name is missing", () => {
    const out = fillOutcomeTemplate('Hi {{name}},', { ...base, locale: 'en', name: '  ' });
    expect(out).toBe('Hi there,');
  });

  it('collapses blank runs left by empty lines', () => {
    const out = fillOutcomeTemplate('a\n\n\n\nb', { ...base, name: 'x' });
    expect(out).toBe('a\n\nb');
  });
});
