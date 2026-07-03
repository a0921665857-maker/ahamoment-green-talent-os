import { NextRequest } from 'next/server';
import { errorJson, json } from '@/lib/http';
import { composeBrief, fetchBriefData, sendBriefEmail, sgtDateString } from '@/lib/morning-brief';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Daily founder brief (vercel.json cron, 23:00 UTC = 07:00 SGT). When CRON_SECRET
 * is set (Vercel injects it as the Authorization bearer on cron invocations) the
 * route requires it; unset (local dev) it is open.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return errorJson('unauthorized', 401);
  }

  try {
    const data = await fetchBriefData();
    const now = new Date();
    const brief = composeBrief(data, now);
    const emailed = await sendBriefEmail(brief, sgtDateString(now));
    return json({ ok: true, emailed, brief });
  } catch (e) {
    return errorJson('brief_failed', 500, e instanceof Error ? e.message : undefined);
  }
}
