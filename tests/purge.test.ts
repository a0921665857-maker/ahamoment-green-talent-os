import { describe, expect, it } from 'vitest';
import { cutoffFor, RAW_RETENTION_DAYS } from '@/lib/purge';
import { getContent } from '@/content';
import { LOCALES } from '@/lib/constants';

describe('retention window', () => {
  it('matches the 90 days promised in the consent copy', () => {
    expect(RAW_RETENTION_DAYS).toBe(90);
  });

  it('cuts off exactly 90 days back', () => {
    const now = new Date('2026-07-30T00:00:00.000Z');
    expect(cutoffFor(now).toISOString()).toBe('2026-05-01T00:00:00.000Z');
  });

  it('is unaffected by the local timezone of the runner', () => {
    const now = new Date('2026-01-01T23:30:00.000Z');
    const diffDays = (now.getTime() - cutoffFor(now).getTime()) / 86_400_000;
    expect(diffDays).toBe(90);
  });
});

/**
 * The privacy page is a promise. These check that the promise still names the
 * things the system actually does — the gap Gate 8 found was a page claiming
 * automatic deletion while deletion was a manual SQL snippet nobody ran.
 */
describe('privacy disclosure completeness', () => {
  for (const locale of LOCALES) {
    it(`${locale}: discloses every third-party processor`, () => {
      const body = getContent(locale)
        .privacyPage.sections.map((s) => `${s.heading}\n${s.body}`)
        .join('\n');
      for (const processor of ['Vercel', 'Supabase', 'Anthropic', 'Resend', 'PostHog', 'Stripe']) {
        expect(body, `${locale} must disclose ${processor}`).toContain(processor);
      }
    });

    it(`${locale}: discloses cookies and cross-border processing`, () => {
      const body = getContent(locale).privacyPage.sections.map((s) => s.body).join('\n');
      expect(body.toLowerCase()).toContain('cookie');
      expect(/跨境|離開台灣|across borders|not necessarily in your country/i.test(body)).toBe(true);
    });

    it(`${locale}: states that card details never reach this site`, () => {
      const body = getContent(locale).privacyPage.sections.map((s) => s.body).join('\n');
      expect(/完整卡號|full card number/i.test(body)).toBe(true);
    });

    it(`${locale}: still states the retention window it enforces`, () => {
      const body = getContent(locale).privacyPage.sections.map((s) => s.body).join('\n');
      expect(new RegExp(`${RAW_RETENTION_DAYS}`).test(body)).toBe(true);
    });
  }
});
