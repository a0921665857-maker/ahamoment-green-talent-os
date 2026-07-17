import { NextRequest } from 'next/server';
import { z } from 'zod';
import { RATE_LIMIT, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getServiceClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { clientIp, errorJson, json } from '@/lib/http';
import { recordEvent } from '@/lib/events';
import { sendSaveForLaterEmail } from '@/lib/email';

export const runtime = 'nodejs';

const BodySchema = z.object({
  email: z.string().email(),
  locale: z.string().refine(isLocale),
});

/**
 * Save-for-later: captures an email on the material step (before any paste), so
 * the 78% who leave without a CV on hand still become a reachable lead. Creates a
 * lightweight session (status saved_for_later, followup new) that the concierge
 * picks up, and emails the person the MRI link. No material is collected here.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = await checkRateLimit(ip, 'mri_submit', RATE_LIMIT.submissionsPerHourPerIp);
  if (!rl.allowed) return errorJson('rate_limited', 429);

  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }
  const locale = body.locale as Locale;

  const db = getServiceClient();
  // status must satisfy mri_sessions_status_check; 'input_received' is valid and
  // admin_notes flags this as an email-only save (no material collected yet), so
  // the lead tracker and concierge can tell it apart from a full run.
  const { data: session, error: insErr } = await db
    .from('mri_sessions')
    .insert({
      locale,
      status: 'input_received',
      email: body.email,
      followup_status: 'new',
      admin_notes: 'save_for_later',
    })
    .select('id')
    .single();
  if (insErr) return errorJson('generic', 500);

  await recordEvent('save_for_later_submitted', session?.id ?? null, { locale });

  const mriUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/mri?utm_source=save_email&utm_medium=email`;
  await sendSaveForLaterEmail({ to: body.email, mriUrl, locale });

  return json({ ok: true });
}
