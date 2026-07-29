import { NextRequest } from 'next/server';
import { errorJson, json } from '@/lib/http';
import { runPurge } from '@/lib/purge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Daily 90-day raw-material purge (vercel.json cron, 03:00 UTC = 11:00 SGT —
 * after the other three so nothing races).
 *
 * Auth follows the other cron routes: CRON_SECRET required when it is set.
 *
 * Safety default is inverted relative to the email crons. Those default to
 * "do nothing" because sending is irreversible; this one defaults to **dry
 * run** for the same reason — deleting is irreversible too. Set
 * PURGE_ENABLED='true' to make it write. `?dry=1` forces a dry run regardless,
 * which is how you check what a live run would touch.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return errorJson('unauthorized', 401);
  }

  const forcedDry = new URL(req.url).searchParams.get('dry') === '1';
  const enabled = process.env.PURGE_ENABLED === 'true';
  const dryRun = forcedDry || !enabled;

  try {
    const result = await runPurge(new Date(), dryRun);
    return json({ ok: true, ...result, enabled });
  } catch (e) {
    return errorJson('purge_failed', 500, e instanceof Error ? e.message : undefined);
  }
}
