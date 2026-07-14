import { NextResponse } from 'next/server';

/**
 * Best-effort client IP for rate limiting (no IP is ever stored raw — see rateLimit.ts).
 * Prefer x-real-ip: on Vercel it is set by the platform from the connection and
 * cannot be supplied by the client. The leftmost x-forwarded-for entry CAN be
 * client-supplied (prepended), which would let an attacker rotate rate-limit
 * keys — so it is only a fallback for non-Vercel/dev environments.
 */
export function clientIp(req: Request): string {
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return '0.0.0.0';
}

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init);
}

export function errorJson(code: string, status: number, detail?: string) {
  return NextResponse.json({ error: code, detail }, { status });
}
