import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorJson, json } from '@/lib/http';
import { checkRateLimit } from '@/lib/rateLimit';
import { recordEvent } from '@/lib/events';
import { signTwinToken } from '@/lib/twinAuth';
import { sendTwinLinkEmail } from '@/lib/email';

export const runtime = 'nodejs';

const BodySchema = z.object({
  email: z.string().email().max(200),
  locale: z.enum(['zh-TW', 'en']),
});

function whitelist(): Set<string> {
  return new Set(
    (process.env.TWIN_WHITELIST ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Twin magic-link request. Deliberately constant-shaped response: never reveals
 * whether an email is on the access list (no enumeration).
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rate = await checkRateLimit(ip, 'twin_request', 5);
  if (!rate.allowed) return errorJson('generic', 429);

  await recordEvent('twin_link_requested', null, {});

  const email = body.email.trim().toLowerCase();
  if (whitelist().has(email)) {
    const token = await signTwinToken(email);
    if (token) {
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
      await sendTwinLinkEmail({
        to: email,
        twinUrl: `${base}/${body.locale}/twin/${token}`,
        locale: body.locale,
      });
      await recordEvent('twin_link_sent', null, {});
    }
  }
  return json({ ok: true });
}
