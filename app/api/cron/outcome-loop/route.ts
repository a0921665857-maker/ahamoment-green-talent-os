import { NextRequest } from 'next/server';
import { errorJson, json } from '@/lib/http';
import { runOutcomeLoop } from '@/lib/outcomeLoop';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // personalization LLM calls + sends per run

/**
 * Weekly outcome-loop sender (vercel.json cron, Sundays 02:00 UTC = 10:00 SGT —
 * one hour after the daily followups cron so the two never race). Same auth as
 * followups/morning-brief: CRON_SECRET required when set. With
 * OUTCOME_EMAILS_ENABLED unset this is a dry run — it reports eligible counts
 * and sends nothing (docs/outcome-loop-design-2026-07-21.md).
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return errorJson('unauthorized', 401);
  }

  try {
    return json({ ok: true, ...(await runOutcomeLoop(new Date())) });
  } catch (e) {
    return errorJson('outcome_loop_failed', 500, e instanceof Error ? e.message : undefined);
  }
}
