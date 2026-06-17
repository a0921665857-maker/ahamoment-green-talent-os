import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { clientIp, errorJson } from '@/lib/http';
import { checkRateLimit } from '@/lib/rateLimit';
import { RATE_LIMIT } from '@/lib/constants';
import { ADMIN_COOKIE_NAME, safeEqual, signAdminCookie } from '@/lib/adminAuth';

export const runtime = 'nodejs';

const BodySchema = z.object({ password: z.string().min(1) });

export async function POST(req: NextRequest) {
  // Throttle brute-force attempts per IP before any password work.
  const rl = await checkRateLimit(clientIp(req), 'admin_login', RATE_LIMIT.adminLoginsPerHourPerIp);
  if (!rl.allowed) return errorJson('rate_limited', 429);

  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }

  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!expected || !secret) return errorJson('generic', 500);
  if (!safeEqual(body.password, expected)) return errorJson('unauthorized', 401);

  const cookie = await signAdminCookie(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}
