import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import {
  bookedProps,
  parseCalcomEvent,
  verifyCalcomSignature,
} from '@/lib/calcomWebhook';
import { calendlyWithContext } from '@/lib/bookingUrl';

const SECRET = 'test-secret';

function sign(raw: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(raw).digest('hex');
}

const createdPayload = {
  triggerEvent: 'BOOKING_CREATED',
  payload: {
    uid: 'abc123',
    title: '30 分鐘聊聊｜永續職涯與 MBA 申請',
    startTime: '2026-07-25T02:00:00Z',
    metadata: { token: 'tok_9f' },
    attendees: [{ name: 'Real Person', email: 'person@example.com' }],
  },
};

describe('verifyCalcomSignature', () => {
  it('accepts the correct HMAC-SHA256 hex of the raw body', () => {
    const raw = JSON.stringify(createdPayload);
    expect(verifyCalcomSignature(raw, sign(raw), SECRET)).toBe(true);
  });

  it('rejects a signature made with a different secret, and a missing header', () => {
    const raw = JSON.stringify(createdPayload);
    expect(verifyCalcomSignature(raw, sign(raw, 'other'), SECRET)).toBe(false);
    expect(verifyCalcomSignature(raw, null, SECRET)).toBe(false);
  });
});

describe('parseCalcomEvent', () => {
  it('BOOKING_CREATED → booked, with uid, token, and token as distinctId', () => {
    const evt = parseCalcomEvent(createdPayload);
    expect(evt.kind).toBe('booking');
    if (evt.kind !== 'booking') return;
    expect(evt.booking.status).toBe('booked');
    expect(evt.booking.uid).toBe('abc123');
    expect(evt.booking.reportToken).toBe('tok_9f');
    expect(evt.booking.distinctId).toBe('tok_9f');
  });

  it('BOOKING_CANCELLED → canceled; without token distinctId falls back to uid scope', () => {
    const evt = parseCalcomEvent({
      triggerEvent: 'BOOKING_CANCELLED',
      payload: { uid: 'abc123' },
    });
    expect(evt.kind).toBe('booking');
    if (evt.kind !== 'booking') return;
    expect(evt.booking.status).toBe('canceled');
    expect(evt.booking.distinctId).toBe('calcom:abc123');
  });

  it('PING is a ping, unknown triggers are ignored, junk is invalid', () => {
    expect(parseCalcomEvent({ triggerEvent: 'PING' }).kind).toBe('ping');
    expect(parseCalcomEvent({ triggerEvent: 'MEETING_ENDED', payload: { uid: 'x' } }).kind).toBe(
      'ignored',
    );
    expect(parseCalcomEvent(null).kind).toBe('invalid');
    expect(parseCalcomEvent({ triggerEvent: 'BOOKING_CREATED', payload: {} }).kind).toBe('invalid');
  });
});

describe('bookedProps privacy discipline (B3b: 姓名信箱永不入 props)', () => {
  it('never contains attendee name or email even when the payload has them', () => {
    const evt = parseCalcomEvent(createdPayload);
    if (evt.kind !== 'booking') throw new Error('expected booking');
    const serialized = JSON.stringify(bookedProps(evt.booking));
    expect(serialized).not.toContain('person@example.com');
    expect(serialized).not.toContain('Real Person');
    expect(serialized).toContain('abc123');
    expect(serialized).toContain('"status":"booked"');
  });
});

describe('calendlyWithContext host awareness', () => {
  it('on cal.com hosts also sets metadata[token] for webhook passthrough', () => {
    const out = calendlyWithContext('https://cal.com/m/30min', { token: 'tok_9f' });
    const url = new URL(out);
    expect(url.searchParams.get('metadata[token]')).toBe('tok_9f');
    expect(url.searchParams.get('utm_content')).toBe('tok_9f');
  });

  it('on calendly hosts keeps utm-only behavior unchanged', () => {
    const out = calendlyWithContext('https://calendly.com/m/30min', { token: 'tok_9f' });
    const url = new URL(out);
    expect(url.searchParams.get('metadata[token]')).toBeNull();
    expect(url.searchParams.get('utm_content')).toBe('tok_9f');
  });
});
