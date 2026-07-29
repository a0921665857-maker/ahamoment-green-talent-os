import { describe, expect, it } from 'vitest';
import { EVENT_NAMES } from '@/lib/constants';
import { isClientWritableEventName, isEventName } from '@/lib/events';

describe('event taxonomy', () => {
  it('has no duplicate names', () => {
    expect(new Set(EVENT_NAMES).size).toBe(EVENT_NAMES.length);
  });

  /**
   * `payment_succeeded` is money. It is written only by the signature-verified
   * Stripe webhook; if the public event endpoint ever accepts it, anyone can
   * POST themselves a sale.
   */
  it('refuses server-only names from the public endpoint', () => {
    expect(isEventName('payment_succeeded')).toBe(true);
    expect(isClientWritableEventName('payment_succeeded')).toBe(false);
  });

  it('still accepts ordinary funnel names from the client', () => {
    for (const name of ['mri_started', 'material_submitted', 'checkout_started'] as const) {
      expect(isClientWritableEventName(name)).toBe(true);
    }
  });

  it('rejects unknown names', () => {
    expect(isEventName('definitely_not_an_event')).toBe(false);
    expect(isClientWritableEventName('definitely_not_an_event')).toBe(false);
  });

  /** Removed in Gate 8: zero call sites in the whole repo. */
  it('no longer whitelists the two dead names', () => {
    expect(isEventName('page_view')).toBe(false);
    expect(isEventName('language_selected')).toBe(false);
  });

  it('carries the payment rail', () => {
    expect(isEventName('checkout_started')).toBe(true);
    expect(isEventName('jd_translate_submitted')).toBe(true);
  });
});
