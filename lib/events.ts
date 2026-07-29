import { EVENT_NAMES, type EventName } from '@/lib/constants';
import { getServiceClient } from '@/lib/supabase';

const NAMES = new Set<string>(EVENT_NAMES);

/**
 * Events the browser may never write. `payment_succeeded` is money: it is
 * written only by the signature-verified Stripe webhook, so the public event
 * endpoint must refuse it or anyone could POST themselves a sale. Same reason
 * `booked` was kept out of the client path entirely.
 */
const SERVER_ONLY = new Set<string>(['payment_succeeded']);

/**
 * First-party funnel event. props must never contain PII (enforced rule):
 * callers pass only structural data (step names, input_type, category).
 * Best-effort — never throws into the request path.
 */
export async function recordEvent(
  name: EventName,
  sessionId: string | null,
  props: Record<string, string | number | boolean> = {},
): Promise<void> {
  if (!NAMES.has(name)) return;
  try {
    await getServiceClient().from('events').insert({ session_id: sessionId, name, props });
  } catch {
    /* analytics must not break the flow */
  }
}

export function isEventName(value: string): value is EventName {
  return NAMES.has(value);
}

/** Accepted from the public /api/mri/event endpoint. */
export function isClientWritableEventName(value: string): value is EventName {
  return NAMES.has(value) && !SERVER_ONLY.has(value);
}
