import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stripe webhook intake for hosted Payment Links.
 *
 * Deliberately no `stripe` SDK: the only thing we need from Stripe is (a) proof
 * that a POST really came from them and (b) two fields off the checkout session.
 * Both are a few lines of `node:crypto` and JSON, and adding a dependency to a
 * repo this small costs more than it saves.
 *
 * Privacy discipline is inherited from the Cal.com intake: the buyer's email,
 * name, address and every card field stay inside Stripe. Nothing here reads
 * them, so nothing downstream can leak them.
 */

export interface StripeCheckout {
  /** cs_… — the idempotency key for "have we already recorded this payment?" */
  id: string;
  /** Our report token, passed through the payment link. Null for direct buys. */
  clientReferenceId: string | null;
  amountTotalMinor: number | null;
  currency: string | null;
  paymentStatus: string | null;
  /** false = Stripe test mode. Guarded against so test payments never count. */
  livemode: boolean;
}

export type StripeEvent =
  | { kind: 'payment'; checkout: StripeCheckout }
  | { kind: 'ignored'; type: string }
  | { kind: 'invalid' };

/** Default Stripe replay window. */
export const SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Verifies the `Stripe-Signature` header: `t=<unix>,v1=<hex>[,v1=<hex>…]`,
 * where each v1 is HMAC-SHA256 of `${t}.${rawBody}` under the endpoint's
 * signing secret. Rejects stale timestamps so a captured POST cannot be
 * replayed later. Comparison is constant-time.
 */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSeconds: number,
  toleranceSeconds: number = SIGNATURE_TOLERANCE_SECONDS,
): boolean {
  if (!header || !secret) return false;

  let timestamp: string | null = null;
  const candidates: string[] = [];
  for (const part of header.split(',')) {
    const [k, v] = part.split('=', 2);
    if (!k || !v) continue;
    if (k.trim() === 't') timestamp = v.trim();
    if (k.trim() === 'v1') candidates.push(v.trim());
  }
  if (!timestamp || candidates.length === 0) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(nowSeconds - ts) > toleranceSeconds) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  return candidates.some((c) => {
    const b = Buffer.from(c, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

/**
 * Narrows a Stripe event to the one case we act on. `checkout.session.completed`
 * fires for Payment Links; everything else is acknowledged and dropped so
 * Stripe does not retry it forever.
 */
export function parseStripeEvent(body: unknown): StripeEvent {
  if (typeof body !== 'object' || body === null) return { kind: 'invalid' };
  const evt = body as Record<string, unknown>;
  const type = typeof evt.type === 'string' ? evt.type : '';
  if (!type) return { kind: 'invalid' };
  if (type !== 'checkout.session.completed') return { kind: 'ignored', type };

  const data = evt.data as Record<string, unknown> | undefined;
  const obj = data?.object as Record<string, unknown> | undefined;
  if (!obj || typeof obj.id !== 'string') return { kind: 'invalid' };

  return {
    kind: 'payment',
    checkout: {
      id: obj.id,
      clientReferenceId:
        typeof obj.client_reference_id === 'string' && obj.client_reference_id.length > 0
          ? obj.client_reference_id
          : null,
      amountTotalMinor: typeof obj.amount_total === 'number' ? obj.amount_total : null,
      currency: typeof obj.currency === 'string' ? obj.currency.toUpperCase() : null,
      paymentStatus: typeof obj.payment_status === 'string' ? obj.payment_status : null,
      livemode: obj.livemode === true,
    },
  };
}

/**
 * Structural props only — never an email, a name, an address or anything off a
 * card. `amount` is deliberately excluded from the analytics payload; it is
 * kept in our own events table instead, so revenue never leaves for a
 * third-party analytics vendor.
 */
export function paymentAnalyticsProps(c: StripeCheckout): Record<string, string | boolean> {
  return {
    currency: c.currency ?? 'unknown',
    payment_status: c.paymentStatus ?? 'unknown',
    livemode: c.livemode,
    has_report_token: c.clientReferenceId !== null,
  };
}
