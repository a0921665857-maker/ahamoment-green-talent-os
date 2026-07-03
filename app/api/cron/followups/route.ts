import { NextRequest } from 'next/server';
import { errorJson, json } from '@/lib/http';
import { runFollowups } from '@/lib/followups';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // up to 10 personalization LLM calls + sends per run

/**
 * Daily follow-up sender (vercel.json cron, 01:00 UTC = 09:00 SGT). Same auth
 * as morning-brief: CRON_SECRET required when set. With FOLLOWUP_EMAILS_ENABLED
 * unset this is a dry run — it reports eligible counts and sends nothing.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return errorJson('unauthorized', 401);
  }

  try {
    return json({ ok: true, ...(await runFollowups(new Date())) });
  } catch (e) {
    return errorJson('followups_failed', 500, e instanceof Error ? e.message : undefined);
  }
}
