import { NextResponse } from 'next/server';

/** Best-effort client IP for rate limiting (no IP is ever stored raw — see rateLimit.ts). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? '0.0.0.0';
}

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === 'number' ? { status: init } : init);
}

export function errorJson(code: string, status: number, detail?: string) {
  return NextResponse.json({ error: code, detail }, { status });
}
