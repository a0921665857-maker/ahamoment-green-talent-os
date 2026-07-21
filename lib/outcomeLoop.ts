import { Resend } from 'resend';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { getServiceClient } from '@/lib/supabase';
import { callPrompt } from '@/lib/anthropic';
import { outcomeEmailPrompt } from '@/lib/prompts';
import { applyUserEdits } from '@/lib/pipeline';
import { maskEmail } from '@/lib/followups';
import type { ExtractedProfile, UserEdits } from '@/lib/types';
import type { ResultCategory } from '@/lib/constants';

/**
 * MRI outcome loop (docs/outcome-loop-design-2026-07-21.md): d+30/d+90 check-in
 * emails to people who booked a free consult, asking whether they acted on the
 * report and what changed. Same safety posture as lib/followups.ts:
 * - Master switch: OUTCOME_EMAILS_ENABLED must be exactly 'true' AND the Resend
 *   envs must be set, otherwise the run is a dry run — counts only, nothing
 *   sent, nothing marked.
 * - Hard cap per run (OUTCOME_MAX_PER_RUN, default 10) bounds cost and blast
 *   radius even if a query goes wrong. Real volume is tiny (~11 bookings total
 *   at design time), so this is a guardrail, not a throttle that ever bites.
 * - Sent-markers (and the opt-out marker) live in the events table under names
 *   that are deliberately NOT in EVENT_NAMES: /api/mri/event validates against
 *   that list, so a client can never forge an "already sent" marker. The
 *   opt-out marker IS meant to be settable by the recipient — that happens
 *   through the dedicated unsubscribe route, not the generic event endpoint.
 * - Only the `booked` event source is wired here (design doc entry point 1).
 *   Entry points 2 (paid clients, PIPELINE.md) and 3 (the "(a) line" consult
 *   promise, CONSULT_PLAYBOOK.md) live in documents outside this app's data
 *   model and stay manual — wiring them would be scope this task did not ask
 *   for and this codebase cannot verify.
 */

export type OutcomeStage = 'd30' | 'd90';

interface StageConfig {
  minDays: number; // send no earlier than this many days after the booked date
  maxDays: number; // window closes — old bookings are never suddenly mass-mailed
  sentEvent: string;
  templateKey: 'outcomeD30' | 'outcomeD90';
}

const STAGES: Record<OutcomeStage, StageConfig> = {
  d30: { minDays: 30, maxDays: 44, sentEvent: 'outcome_d30_sent', templateKey: 'outcomeD30' },
  d90: { minDays: 90, maxDays: 104, sentEvent: 'outcome_d90_sent', templateKey: 'outcomeD90' },
};

/** Marker written by the unsubscribe link (app/api/outcome/unsubscribe). Kept out
 * of EVENT_NAMES for the same reason as the sent-markers above: this file writes
 * it directly via the service client, never through the client-facing endpoint. */
export const OUTCOME_OPT_OUT_EVENT = 'outcome_opted_out';

const DAY_MS = 24 * 60 * 60 * 1000;

export function stageWindow(stage: OutcomeStage, now: Date): { newestAllowed: Date; oldestAllowed: Date } {
  const cfg = STAGES[stage];
  return {
    newestAllowed: new Date(now.getTime() - cfg.minDays * DAY_MS),
    oldestAllowed: new Date(now.getTime() - cfg.maxDays * DAY_MS),
  };
}

/** True when a booked date falls inside the stage's send window: (oldestAllowed, newestAllowed]. */
export function inStageWindow(stage: OutcomeStage, bookedAt: Date, now: Date): boolean {
  const { newestAllowed, oldestAllowed } = stageWindow(stage, now);
  return bookedAt.getTime() > oldestAllowed.getTime() && bookedAt.getTime() <= newestAllowed.getTime();
}

export interface FillOutcomeInput {
  name: string | null;
  locale: Locale;
  focusArea: string;
  unsubscribeUrl: string;
}

/** Same placeholder + graceful no-name policy as followups.ts fillEmailTemplate. */
export function fillOutcomeTemplate(body: string, input: FillOutcomeInput): string {
  const name = input.name?.trim();
  const withName = name
    ? body.replaceAll('{{name}}', name)
    : input.locale === 'zh-TW'
      ? body.replace(/\{\{name\}\}\s*/g, '')
      : body.replaceAll('{{name}}', 'there');
  return withName
    .replaceAll('{{focus_area}}', input.focusArea)
    .replaceAll('{{unsubscribe_url}}', input.unsubscribeUrl)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Master switch, checked by both the cron route (for its `enabled` field in the
 * response) and runOutcomeLoop. Unset OUTCOME_EMAILS_ENABLED (or missing Resend
 * envs) = dry run: exported so the gate itself has a direct unit test, not just
 * an inferred one from a DB-backed integration test. */
export function isEnabled(): boolean {
  return (
    process.env.OUTCOME_EMAILS_ENABLED === 'true' &&
    Boolean(process.env.RESEND_API_KEY) &&
    Boolean(process.env.RESEND_FROM)
  );
}

function parseBookedDate(props: unknown): Date | null {
  if (!props || typeof props !== 'object') return null;
  const raw = (props as Record<string, unknown>).date;
  if (typeof raw !== 'string') return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Pure reduction of raw `booked` event rows to one earliest date per session.
 * Extracted from candidatesFor so the "which booking counts" rule is unit
 * testable without a DB. Rows with a missing session_id or unparsable
 * props.date are dropped (defensive — B3 backfilled these by hand). */
export function earliestBookedBySession(
  rows: { session_id: string | null; props: unknown }[],
): Map<string, Date> {
  const bySession = new Map<string, Date>();
  for (const row of rows) {
    const sessionId = row.session_id;
    const bookedAt = parseBookedDate(row.props);
    if (!sessionId || !bookedAt) continue;
    const existing = bySession.get(sessionId);
    if (!existing || bookedAt.getTime() < existing.getTime()) bySession.set(sessionId, bookedAt);
  }
  return bySession;
}

/** Pure dedup rule: a candidate is dropped if it already has a sent-marker for
 * this stage OR an opt-out marker (any stage). "查 events 防重" from the design
 * doc, factored out so it is directly unit testable. */
export function excludeAlreadyHandled<T extends { id: string }>(
  candidates: T[],
  handledSessionIds: Iterable<string>,
): T[] {
  const excluded = new Set(handledSessionIds);
  return candidates.filter((c) => !excluded.has(c.id));
}

interface CandidateRow {
  id: string;
  session_token: string;
  locale: string;
  email: string;
  name: string | null;
  bookedAt: Date;
}

export interface StageResult {
  eligible: number;
  sent: string[]; // masked emails
  skipped: number; // eligible but errored/missing data — retried next run
}

export interface OutcomeRunResult {
  enabled: boolean;
  stages: Record<OutcomeStage, StageResult>;
}

async function candidatesFor(stage: OutcomeStage, now: Date): Promise<CandidateRow[]> {
  const db = getServiceClient();

  // `booked` is deliberately not in EVENT_NAMES (see followups.ts convention);
  // volume is tiny (a handful of consults/month) so a full-table read + in-JS
  // window filter is simpler and safer than a jsonb range query.
  const { data: bookedRows } = await db.from('events').select('session_id, props').eq('name', 'booked');
  const allBookings = earliestBookedBySession(
    (bookedRows ?? []) as { session_id: string | null; props: unknown }[],
  );
  const bookedBySession = new Map(
    [...allBookings].filter(([, bookedAt]) => inStageWindow(stage, bookedAt, now)),
  );
  if (bookedBySession.size === 0) return [];

  const sessionIds = [...bookedBySession.keys()];
  const { data: sessions } = await db
    .from('mri_sessions')
    .select('id, session_token, locale, email, name')
    .in('id', sessionIds)
    .not('email', 'is', null)
    .is('deleted_at', null);
  const candidates = (sessions ?? []) as Omit<CandidateRow, 'bookedAt'>[];
  if (candidates.length === 0) return [];

  const { data: markerRows } = await db
    .from('events')
    .select('session_id, name')
    .in('name', [STAGES[stage].sentEvent, OUTCOME_OPT_OUT_EVENT])
    .in(
      'session_id',
      candidates.map((c) => c.id),
    );
  const handledIds = (markerRows ?? []).map((r) => r.session_id as string);

  return excludeAlreadyHandled(candidates, handledIds).map((c) => ({
    ...c,
    bookedAt: bookedBySession.get(c.id)!,
  }));
}

async function sendOne(stage: OutcomeStage, lead: CandidateRow): Promise<void> {
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
  const draft = await callPrompt(outcomeEmailPrompt, {
    locale,
    profile,
    category: scoreRow.result_category as ResultCategory,
  });

  const template = getContent(locale).emails[STAGES[stage].templateKey];
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/outcome/unsubscribe?s=${lead.session_token}`;
  const body = fillOutcomeTemplate(template.body, {
    name: lead.name,
    locale,
    focusArea: draft.focus_area,
    unsubscribeUrl,
  });

  await new Resend(process.env.RESEND_API_KEY!).emails.send({
    from: process.env.RESEND_FROM!,
    to: lead.email,
    subject: template.subject,
    text: body,
    // The from-address has no mailbox — route replies to Michael's real inbox
    // (the templates explicitly invite replies; this IS the reply-in loop).
    replyTo: process.env.FOUNDER_EMAIL || undefined,
  });

  // Marker written only after a successful send — a failed send retries next run.
  await db.from('events').insert({ session_id: lead.id, name: STAGES[stage].sentEvent, props: { stage } });
}

export async function runOutcomeLoop(now: Date): Promise<OutcomeRunResult> {
  const enabled = isEnabled();
  const maxPerRun = Number(process.env.OUTCOME_MAX_PER_RUN ?? 10);
  const result: OutcomeRunResult = {
    enabled,
    stages: {
      d30: { eligible: 0, sent: [], skipped: 0 },
      d90: { eligible: 0, sent: [], skipped: 0 },
    },
  };

  let budget = maxPerRun;
  // d90 first: fewer people ever reach it, and it is the higher-value ask
  // (testimonial consent) — it should not lose the shared budget to d30.
  for (const stage of ['d90', 'd30'] as const) {
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
