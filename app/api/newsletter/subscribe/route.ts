import { NextRequest } from 'next/server';
import { z } from 'zod';
import { RATE_LIMIT } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getServiceClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { clientIp, errorJson, json } from '@/lib/http';
import { recordEvent } from '@/lib/events';

export const runtime = 'nodejs';

const BodySchema = z.object({
  email: z.string().email().max(254),
  locale: z.string().refine(isLocale),
  source: z.string().max(64).optional(),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = await checkRateLimit(ip, 'newsletter_subscribe', RATE_LIMIT.submissionsPerHourPerIp);
  if (!rl.allowed) return errorJson('rate_limited', 429);

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return errorJson('invalid_input', 400);
  }

  const email = body.email.trim().toLowerCase();
  try {
    const db = getServiceClient();
    // Idempotent: re-subscribing the same email is not an error.
    const { error } = await db
      .from('newsletter_subscribers')
      .upsert(
        { email, locale: body.locale, source: body.source ?? null, status: 'active' },
        { onConflict: 'email' },
      );
    if (error) {
      // Most likely the `newsletter_subscribers` table has not been migrated yet.
      return errorJson('subscribe_failed', 503, error.message);
    }
  } catch {
    return errorJson('subscribe_failed', 503);
  }

  // No PII in event props — structural data only.
  await recordEvent('newsletter_subscribed', null, {
    locale: body.locale,
    source: body.source ?? 'unknown',
  });
  return json({ ok: true });
}
