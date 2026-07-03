import { Resend } from 'resend';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { getServiceClient } from '@/lib/supabase';
import { callPrompt } from '@/lib/anthropic';
import { followupEmailPrompt } from '@/lib/prompts';
import { applyUserEdits } from '@/lib/pipeline';
import type { ExtractedProfile, UserEdits } from '@/lib/types';
import type { ResultCategory } from '@/lib/constants';

/**
 * Automated d2/d6 follow-up sends (the emails.ts templates were written for
 * manual V1 sending; this wires them to a daily cron). Safety posture:
 * - Master switch: FOLLOWUP_EMAILS_ENABLED must be exactly 'true' AND the
 *   Resend envs must be set, otherwise the run is a dry run — counts only,
 *   nothing sent, nothing marked.
 * - Hard cap per run (FOLLOWUP_MAX_PER_RUN, default 10) bounds cost and blast
 *   radius even if a query goes wrong.
 * - Sent-markers live in the events table under names that are deliberately
 *   NOT in EVENT_NAMES: /api/mri/event validates against that list, so keeping
 *   these names out means a client can never forge a "already sent" marker.
 * - Only followup_status='new' leads are touched — the moment Michael marks a
 *   lead contacted/booked/paid/closed in admin, the sequence stops for them.
 */

export type FollowupStage = 'd2' | 'd6';

interface StageConfig {
  minDays: number; // send no earlier than this many days after the lead completed
  maxDays: number; // window closes — old leads are never suddenly mass-mailed
  sentEvent: string;
}

const STAGES: Record<FollowupStage, StageConfig> = {
  d2: { minDays: 2, maxDays: 6, sentEvent: 'followup_d2_sent' },
  d6: { minDays: 6, maxDays: 14, sentEvent: 'followup_d6_sent' },
};

export function stageWindow(stage: FollowupStage, now: Date): { newestAllowed: string; oldestAllowed: string } {
  const cfg = STAGES[stage];
  const day = 24 * 60 * 60 * 1000;
  return {
    newestAllowed: new Date(now.getTime() - cfg.minDays * day).toISOString(),
    oldestAllowed: new Date(now.getTime() - cfg.maxDays * day).toISOString(),
  };
}

export interface FillInput {
  name: string | null;
  locale: Locale;
  reportUrl: string;
  personalLine: string;
  categoryNote: string;
}

/** Same placeholder + graceful no-name policy as lib/email.ts sendReportEmail. */
export function fillEmailTemplate(body: string, input: FillInput): string {
  const name = input.name?.trim();
  const withName = name
    ? body.replaceAll('{{name}}', name)
    : input.locale === 'zh-TW'
      ? body.replace(/\{\{name\}\}\s*/g, '')
      : body.replaceAll('{{name}}', 'there');
  return withName
    .replaceAll('{{report_url}}', input.reportUrl)
    .replaceAll('{{personal_line}}', input.personalLine)
    .replaceAll('{{category_note}}', input.categoryNote)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  return `${user.slice(0, 1)}***@${domain ?? '?'}`;
}

interface CandidateRow {
  id: string;
  session_token: string;
  locale: string;
  email: string;
  name: string | null;
}

export interface StageResult {
  eligible: number;
  sent: string[]; // masked emails
  skipped: number; // eligible but errored/missing data — retried next run
}

export interface FollowupRunResult {
  enabled: boolean;
  stages: Record<FollowupStage, StageResult>;
}

function isEnabled(): boolean {
  return (
    process.env.FOLLOWUP_EMAILS_ENABLED === 'true' &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.RESEND_FROM)
  );
}

async function candidatesFor(stage: FollowupStage, now: Date): Promise<CandidateRow[]> {
  const db = getServiceClient();
  const { newestAllowed, oldestAllowed } = stageWindow(stage, now);
  const { data: rows } = await db
    .from('mri_sessions')
    .select('id, session_token, locale, email, name')
    .eq('status', 'report_generated')
    .eq('followup_status', 'new')
    .not('email', 'is', null)
    .is('deleted_at', null)
    .lte('created_at', newestAllowed)
    .gt('created_at', oldestAllowed);
  const candidates = (rows ?? []) as CandidateRow[];
  if (candidates.length === 0) return [];

  const { data: sentRows } = await db
    .from('events')
    .select('session_id')
    .eq('name', STAGES[stage].sentEvent)
    .in('session_id', candidates.map((c) => c.id));
  const alreadySent = new Set((sentRows ?? []).map((r) => r.session_id as string));
  return candidates.filter((c) => !alreadySent.has(c.id));
}

async function sendOne(stage: FollowupStage, lead: CandidateRow): Promise<void> {
  const db = getServiceClient();
  const locale = (lead.locale === 'en' ? 'en' : 'zh-TW') as Locale;

  const [{ data: profileRow }, { data: scoreRow }] = await Promise.all([
    db
      .from('extracted_profiles')
      .select('payload, user_edits')
      .eq('session_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
    db
      .from('scores')
      .select('result_category')
      .eq('session_id', lead.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single(),
  ]);
  if (!profileRow || !scoreRow) throw new Error('missing profile/score');

  const profile = applyUserEdits(
    profileRow.payload as ExtractedProfile,
    (profileRow.user_edits ?? null) as UserEdits | null,
  );
  const draft = await callPrompt(followupEmailPrompt, {
    locale,
    profile,
    category: scoreRow.result_category as ResultCategory,
  });

  const template = getContent(locale).emails[stage];
  const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/result/${lead.session_token}`;
  const body = fillEmailTemplate(template.body, {
    name: lead.name,
    locale,
    reportUrl,
    personalLine: draft.personal_line,
    categoryNote: draft.category_note,
  });

  await new Resend(process.env.RESEND_API_KEY!).emails.send({
    from: process.env.RESEND_FROM!,
    to: lead.email,
    subject: template.subject,
    text: body,
  });

  // Marker written only after a successful send — a failed send retries next run.
  await db.from('events').insert({ session_id: lead.id, name: STAGES[stage].sentEvent, props: { stage } });
}

export async function runFollowups(now: Date): Promise<FollowupRunResult> {
  const enabled = isEnabled();
  const maxPerRun = Number(process.env.FOLLOWUP_MAX_PER_RUN ?? 10);
  const result: FollowupRunResult = {
    enabled,
    stages: {
      d2: { eligible: 0, sent: [], skipped: 0 },
      d6: { eligible: 0, sent: [], skipped: 0 },
    },
  };

  let budget = maxPerRun;
  // d6 first: its window closes sooner, so it wins when the per-run budget is tight.
  for (const stage of ['d6', 'd2'] as const) {
    const candidates = await candidatesFor(stage, now);
    result.stages[stage].eligible = candidates.length;
    if (!enabled) continue;
    for (const lead of candidates.slice(0, Math.max(0, budget))) {
      try {
        await sendOne(stage, lead);
        result.stages[stage].sent.push(maskEmail(lead.email));
        budget -= 1;
      } catch {
        result.stages[stage].skipped += 1;
      }
    }
  }
  return result;
}
