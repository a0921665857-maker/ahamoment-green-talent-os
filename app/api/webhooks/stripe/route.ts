import { NextRequest } from 'next/server';
import { errorJson, json } from '@/lib/http';
import {
  parseStripeEvent,
  paymentAnalyticsProps,
  verifyStripeSignature,
} from '@/lib/stripeWebhook';
import { phCaptureServer } from '@/lib/posthogServer';
import { recordEvent } from '@/lib/events';
import { getServiceClient } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe → first-party events + PostHog. Env-gated exactly like the Cal.com
 * intake: with STRIPE_WEBHOOK_SECRET unset the endpoint is inert (503), so
 * shipping this route changes nothing until the secret is added in Vercel and
 * the same value is pasted into the Stripe endpoint settings.
 *
 * Test-mode guard: Stripe sends `livemode:false` for test payments. Unless
 * STRIPE_ALLOW_TEST_MODE is exactly 'true', those are acknowledged and dropped
 * — a test card must never be able to write a row that reads as revenue.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return errorJson('webhook_disabled', 503);

  const raw = await req.text();
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (!verifyStripeSignature(raw, req.headers.get('stripe-signature'), secret, nowSeconds)) {
    return errorJson('invalid_signature', 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorJson('invalid_json', 400);
  }

  const evt = parseStripeEvent(body);
  if (evt.kind === 'invalid') return errorJson('invalid_payload', 400);
  if (evt.kind === 'ignored') return json({ ok: true, ignored: evt.type });

  const c = evt.checkout;

  const allowTest = process.env.STRIPE_ALLOW_TEST_MODE === 'true';
  if (!c.livemode && !allowTest) {
    return json({ ok: true, ignored: 'test_mode' });
  }

  // Only a genuinely paid session counts. Payment Links can complete a session
  // in `unpaid` state for delayed methods; those get their own event later.
  if (c.paymentStatus !== 'paid') {
    return json({ ok: true, ignored: `payment_status:${c.paymentStatus ?? 'unknown'}` });
  }

  // Idempotency. Stripe retries on any non-2xx and can legitimately deliver the
  // same event twice; without this a retry would double-count a sale.
  if (await alreadyRecorded(c.id)) {
    return json({ ok: true, duplicate: true, checkout_id: c.id });
  }

  await recordEvent('payment_succeeded', c.clientReferenceId, {
    checkout_id: c.id,
    currency: c.currency ?? 'unknown',
    // Amount stays in our own database and is never forwarded to analytics.
    amount_minor: c.amountTotalMinor ?? 0,
    livemode: c.livemode,
  });

  await phCaptureServer(
    'payment_succeeded',
    c.clientReferenceId ?? `stripe:${c.id}`,
    paymentAnalyticsProps(c),
  );

  return json({ ok: true, checkout_id: c.id });
}

/**
 * Dedupe against the first-party events table rather than a new column, so this
 * ships without a migration. `props->>checkout_id` is indexed well enough at
 * this volume (single-digit rows) and the query is bounded to one row.
 */
async function alreadyRecorded(checkoutId: string): Promise<boolean> {
  try {
    const { data } = await getServiceClient()
      .from('events')
      .select('id')
      .eq('name', 'payment_succeeded')
      .eq('props->>checkout_id', checkoutId)
      .limit(1);
    return Array.isArray(data) && data.length > 0;
  } catch {
    // A failed dedupe check must not drop a real payment; recording twice is
    // recoverable, losing the record is not.
    return false;
  }
}
