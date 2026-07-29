import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  parseStripeEvent,
  paymentAnalyticsProps,
  verifyStripeSignature,
} from '@/lib/stripeWebhook';
import {
  isUsablePaymentLink,
  paymentLinkWithContext,
  priceFor,
  PUBLIC_PAID_OFFER_IDS,
} from '@/lib/services';

const SECRET = 'whsec_test_secret';
const NOW = 1_780_000_000;

function sign(body: string, secret = SECRET, t = NOW) {
  const v1 = createHmac('sha256', secret).update(`${t}.${body}`).digest('hex');
  return `t=${t},v1=${v1}`;
}

describe('Stripe signature verification', () => {
  const body = JSON.stringify({ type: 'checkout.session.completed' });

  it('accepts a correctly signed, in-window payload', () => {
    expect(verifyStripeSignature(body, sign(body), SECRET, NOW)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const header = sign(body);
    expect(verifyStripeSignature(body + ' ', header, SECRET, NOW)).toBe(false);
  });

  it('rejects the wrong secret', () => {
    expect(verifyStripeSignature(body, sign(body, 'whsec_other'), SECRET, NOW)).toBe(false);
  });

  it('rejects a replay outside the tolerance window', () => {
    const header = sign(body, SECRET, NOW - 3600);
    expect(verifyStripeSignature(body, header, SECRET, NOW)).toBe(false);
  });

  it('rejects a missing or malformed header', () => {
    expect(verifyStripeSignature(body, null, SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(body, 'garbage', SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(body, `t=${NOW}`, SECRET, NOW)).toBe(false);
  });

  it('accepts when one of several v1 candidates matches (key rotation)', () => {
    const good = createHmac('sha256', SECRET).update(`${NOW}.${body}`).digest('hex');
    const header = `t=${NOW},v1=${'0'.repeat(64)},v1=${good}`;
    expect(verifyStripeSignature(body, header, SECRET, NOW)).toBe(true);
  });
});

describe('Stripe event parsing', () => {
  const completed = {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        client_reference_id: '5f0d1f3a-0000-4000-8000-000000000000',
        amount_total: 680_000,
        currency: 'twd',
        payment_status: 'paid',
        livemode: true,
      },
    },
  };

  it('extracts exactly the fields we act on', () => {
    const evt = parseStripeEvent(completed);
    expect(evt.kind).toBe('payment');
    if (evt.kind !== 'payment') return;
    expect(evt.checkout).toEqual({
      id: 'cs_test_123',
      clientReferenceId: '5f0d1f3a-0000-4000-8000-000000000000',
      amountTotalMinor: 680_000,
      currency: 'TWD',
      paymentStatus: 'paid',
      livemode: true,
    });
  });

  it('ignores other event types rather than erroring', () => {
    expect(parseStripeEvent({ type: 'invoice.paid' })).toEqual({
      kind: 'ignored',
      type: 'invoice.paid',
    });
  });

  it('treats structurally broken payloads as invalid', () => {
    expect(parseStripeEvent(null).kind).toBe('invalid');
    expect(parseStripeEvent({}).kind).toBe('invalid');
    expect(parseStripeEvent({ type: 'checkout.session.completed', data: {} }).kind).toBe('invalid');
  });

  it('defaults livemode to false when Stripe omits it', () => {
    const evt = parseStripeEvent({
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_1' } },
    });
    expect(evt.kind === 'payment' && evt.checkout.livemode).toBe(false);
  });

  it('never puts an amount or an identifier into the analytics payload', () => {
    const evt = parseStripeEvent(completed);
    if (evt.kind !== 'payment') throw new Error('expected payment');
    const props = paymentAnalyticsProps(evt.checkout);
    const serialised = JSON.stringify(props);
    expect(serialised).not.toContain('680000');
    expect(serialised).not.toContain('cs_test_123');
    expect(serialised).not.toContain('5f0d1f3a');
    expect(props.currency).toBe('TWD');
    expect(props.has_report_token).toBe(true);
  });
});

describe('payment link guards', () => {
  it('rejects unset, placeholder and non-Stripe links', () => {
    for (const bad of [
      undefined,
      null,
      '',
      '   ',
      'undefined',
      'null',
      'https://stripe.com/placeholder',
      'http://buy.stripe.com/abc',
      'https://evil.example.com/buy.stripe.com',
      'not a url',
    ]) {
      expect(isUsablePaymentLink(bad as string | undefined)).toBe(false);
    }
  });

  it('accepts a real Stripe payment link', () => {
    expect(isUsablePaymentLink('https://buy.stripe.com/test_abc123')).toBe(true);
  });

  it('carries the report token through as client_reference_id', () => {
    const out = paymentLinkWithContext('https://buy.stripe.com/x', {
      token: 'tok-123',
      offer: 'offer_path_read',
      locale: 'zh-TW',
    });
    expect(new URL(out).searchParams.get('client_reference_id')).toBe('tok-123');
  });

  it('does not attach the sample token or a null token', () => {
    for (const token of ['sample', null]) {
      const out = paymentLinkWithContext('https://buy.stripe.com/x', {
        token,
        offer: 'offer_path_read',
        locale: 'en',
      });
      expect(new URL(out).searchParams.has('client_reference_id')).toBe(false);
    }
  });
});

describe('price ↔ market consistency', () => {
  it('minor units match the displayed amount in both markets', () => {
    for (const id of PUBLIC_PAID_OFFER_IDS) {
      expect(priceFor(id, 'zh-TW').amountMinor).toBe(680_000);
      expect(priceFor(id, 'en').amountMinor).toBe(42_000);
    }
  });
});
