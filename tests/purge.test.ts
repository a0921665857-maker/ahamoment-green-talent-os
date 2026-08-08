import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { cutoffFor, RAW_RETENTION_DAYS } from '@/lib/purge';
import { getContent } from '@/content';
import { LOCALES } from '@/lib/constants';
import { REPO_ROOT } from '@/scripts/constitution/surfaces';

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
/**
 * Whether the site can take a payment at all. The 2026-08-08 UX audit removed
 * the self-checkout path (the founder's model is LINE → call → scope → pay), so
 * the payment pages are gone and card data no longer touches any surface.
 *
 * The disclosure requirement is tied to that fact rather than hard-coded, in
 * both directions: while there is no checkout the privacy page must not carry a
 * payment section (that stale section is exactly the defect the audit found —
 * a page describing a Stripe flow no buyer had ever used), and the moment a
 * checkout page comes back these tests demand the disclosure back with it.
 */
const CHECKOUT_PAGES = [
  'app/(site)/[locale]/payment/success/page.tsx',
  'app/(site)/[locale]/payment/cancelled/page.tsx',
];
const hasCheckout = CHECKOUT_PAGES.some((p) => fs.existsSync(path.join(REPO_ROOT, p)));

describe('privacy disclosure completeness', () => {
  for (const locale of LOCALES) {
    it(`${locale}: discloses every third-party processor`, () => {
      const body = getContent(locale)
        .privacyPage.sections.map((s) => `${s.heading}\n${s.body}`)
        .join('\n');
      const processors = ['Vercel', 'Supabase', 'Anthropic', 'Resend', 'PostHog'];
      if (hasCheckout) processors.push('Stripe');
      for (const processor of processors) {
        expect(body, `${locale} must disclose ${processor}`).toContain(processor);
      }
      if (!hasCheckout) {
        expect(body, `${locale} must not name a payment processor while no checkout exists`).not.toContain('Stripe');
      }
    });

    it(`${locale}: discloses cookies and cross-border processing`, () => {
      const body = getContent(locale).privacyPage.sections.map((s) => s.body).join('\n');
      expect(body.toLowerCase()).toContain('cookie');
      expect(/跨境|離開台灣|across borders|not necessarily in your country/i.test(body)).toBe(true);
    });

    it(`${locale}: matches the payment reality of the build`, () => {
      const body = getContent(locale).privacyPage.sections.map((s) => s.body).join('\n');
      const claimsCardHandling = /完整卡號|full card number/i.test(body);
      expect(claimsCardHandling, hasCheckout ? 'checkout exists: card handling must be disclosed' : 'no checkout exists: the payment section is stale copy and must be removed').toBe(
        hasCheckout,
      );
    });

    it(`${locale}: still states the retention window it enforces`, () => {
      const body = getContent(locale).privacyPage.sections.map((s) => s.body).join('\n');
      expect(new RegExp(`${RAW_RETENTION_DAYS}`).test(body)).toBe(true);
    });
  }
});
