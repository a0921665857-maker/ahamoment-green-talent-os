import { NextRequest } from 'next/server';
import { errorJson, json } from '@/lib/http';
import { bookedProps, parseCalcomEvent, verifyCalcomSignature } from '@/lib/calcomWebhook';
import { phCaptureServer } from '@/lib/posthogServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cal.com → PostHog booked-event intake. Env-gated like the other side-effect
 * routes: with CALCOM_WEBHOOK_SECRET unset this endpoint is inert (503), so
 * deploying the code changes nothing until Michael adds the secret in Vercel
 * and pastes the same value into the Cal.com webhook settings.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) return errorJson('webhook_disabled', 503);

  const raw = await req.text();
  if (!verifyCalcomSignature(raw, req.headers.get('x-cal-signature-256'), secret)) {
    return errorJson('invalid_signature', 401);
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorJson('invalid_json', 400);
  }

  const evt = parseCalcomEvent(body);
  if (evt.kind === 'ping') return json({ ok: true, pong: true });
  if (evt.kind === 'invalid') return errorJson('invalid_payload', 400);
  if (evt.kind === 'ignored') return json({ ok: true, ignored: evt.triggerEvent });

  await phCaptureServer('booked', evt.booking.distinctId, bookedProps(evt.booking));
  return json({ ok: true, uid: evt.booking.uid, status: evt.booking.status });
}
