import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { OUTCOME_OPT_OUT_EVENT } from '@/lib/outcomeLoop';

export const runtime = 'nodejs';

function page(body: string): NextResponse {
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"><title>AhaMoment</title></head><body style="font-family:sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.6">${body}</body></html>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

/**
 * Outcome-loop unsubscribe link (the {{unsubscribe_url}} placeholder in
 * content/*\/emails.ts outcomeD30/outcomeD90). GET so it works as a plain
 * clicked link, no auth beyond the opaque session_token already used for
 * report links and twin magic links (same risk class).
 *
 * Writes the opt-out marker directly via the service client rather than
 * lib/events.ts recordEvent — that helper only accepts names in EVENT_NAMES,
 * and outcome_opted_out is deliberately excluded (same convention as the
 * outcome_d30_sent/outcome_d90_sent markers in lib/outcomeLoop.ts): a client
 * must never be able to forge OTHER people's markers, but a recipient setting
 * their OWN opt-out via this dedicated route is the intended behavior.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('s');
  if (!token) {
    return page('連結不完整，如果你想停止收信，直接回信告訴我就好。<br>Link is incomplete — reply to the email and I will stop the series.');
  }

  const db = getServiceClient();
  const { data: session } = await db
    .from('mri_sessions')
    .select('id, locale')
    .eq('session_token', token)
    .is('deleted_at', null)
    .maybeSingle();

  if (!session) {
    return page('這個連結已經失效，如果你想停止收信，直接回信告訴我就好。<br>This link is no longer valid — reply to the email and I will stop the series.');
  }

  await db.from('events').insert({ session_id: session.id, name: OUTCOME_OPT_OUT_EVENT, props: {} });

  const isZh = session.locale !== 'en';
  return page(
    isZh
      ? '已收到，之後不會再寄這系列的信給你。謝謝你之前的回覆。'
      : "Got it — you will not get any more of these. Thank you for replying before.",
  );
}
