import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Cal.com webhook intake (booked-event pipeline).
 *
 * Replaces the B3b Gmail-scrape bookkeeping: Cal.com POSTs BOOKING_CREATED /
 * BOOKING_CANCELLED the moment they happen, and we forward a `booked` event to
 * PostHog with the same analysis shape the Gmail path used (status +
 * dedup-able uid). Privacy discipline is inherited from B3b: attendee names
 * and emails never enter event props — only the booking uid, timing, and the
 * report token (which is already the funnel's anonymous id).
 */

export type CalcomBooking = {
  status: 'booked' | 'canceled';
  uid: string;
  startTime: string | null;
  title: string | null;
  reportToken: string | null;
  /** report token when present so the event joins the MRI funnel person; else a uid-scoped id */
  distinctId: string;
};

export type CalcomEvent =
  | { kind: 'ping' }
  | { kind: 'ignored'; triggerEvent: string }
  | { kind: 'booking'; booking: CalcomBooking }
  | { kind: 'invalid' };

/** HMAC-SHA256 hex of the raw body, sent by Cal.com in x-cal-signature-256. */
export function verifyCalcomSignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature.trim(), 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v !== null && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}

export function parseCalcomEvent(body: unknown): CalcomEvent {
  const root = asRecord(body);
  if (!root || typeof root.triggerEvent !== 'string') return { kind: 'invalid' };
  const trigger = root.triggerEvent;

  if (trigger === 'PING') return { kind: 'ping' };
  if (trigger !== 'BOOKING_CREATED' && trigger !== 'BOOKING_CANCELLED') {
    return { kind: 'ignored', triggerEvent: trigger };
  }

  const payload = asRecord(root.payload);
  if (!payload || typeof payload.uid !== 'string' || payload.uid.length === 0) {
    return { kind: 'invalid' };
  }

  const metadata = asRecord(payload.metadata);
  const token =
    metadata && typeof metadata.token === 'string' && metadata.token.length > 0
      ? metadata.token
      : null;

  const booking: CalcomBooking = {
    status: trigger === 'BOOKING_CREATED' ? 'booked' : 'canceled',
    uid: payload.uid,
    startTime: typeof payload.startTime === 'string' ? payload.startTime : null,
    title: typeof payload.title === 'string' ? payload.title : null,
    reportToken: token,
    distinctId: token ?? `calcom:${payload.uid}`,
  };
  return { kind: 'booking', booking };
}

/** Event props for PostHog. Deliberately allowlist-built: attendee PII can never leak in. */
export function bookedProps(b: CalcomBooking): Record<string, string | number | boolean> {
  return {
    source: 'calcom_webhook',
    cal_booking_uid: b.uid,
    status: b.status,
    ...(b.startTime ? { start_time: b.startTime } : {}),
    ...(b.title ? { event_title: b.title } : {}),
    ...(b.reportToken ? { report_token: b.reportToken } : {}),
  };
}
