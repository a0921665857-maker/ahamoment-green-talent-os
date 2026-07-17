import { NextRequest, after } from 'next/server';
import { z } from 'zod';
import { QUESTION_IDS, type Locale } from '@/lib/constants';
import { getContent } from '@/content';
import { getServiceClient } from '@/lib/supabase';
import { errorJson, json } from '@/lib/http';
import { recordEvent } from '@/lib/events';
import { applyUserEdits, generateReport, scoreAndClassify } from '@/lib/pipeline';
import { sendReportEmail, sendFounderNotification } from '@/lib/email';
import { phCaptureServer } from '@/lib/posthogServer';
import { callPrompt } from '@/lib/anthropic';
import { adminSummaryPrompt } from '@/lib/prompts';
import { RUBRIC_VERSION } from '@/lib/scoring/rubrics';
import { CLASSIFIER_VERSION } from '@/lib/scoring/scoreWeights';
import type { Answer } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // Pro plan ceiling — headroom for the deep v2 report pipeline

const BodySchema = z.object({
  session_token: z.string().uuid(),
  email: z.string().email(),
  name: z.string().max(120).optional(),
  answers: z
    .array(z.object({ question_id: z.enum(QUESTION_IDS), answer: z.string().min(1).max(2000) }))
    .default([]),
  // Client PostHog distinct_id — lets the server-side report_generated event
  // join the same person's funnel. Optional; falls back to the session token.
  distinct_id: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch (e) {
    const emailIssue = e instanceof z.ZodError && e.issues.some((i) => i.path.includes('email'));
    return errorJson(emailIssue ? 'email_invalid' : 'generic', 400);
  }

  const db = getServiceClient();
  const { data: session } = await db
    .from('mri_sessions')
    .select('id, locale')
    .eq('session_token', body.session_token)
    .is('deleted_at', null)
    .single();
  if (!session) return errorJson('not_found', 404);
  const locale = session.locale as Locale;

  const { data: profileRow } = await db
    .from('extracted_profiles')
    .select('payload, user_edits')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (!profileRow) return errorJson('generic', 409);

  // Persist email/name + answers
  await db
    .from('mri_sessions')
    .update({ email: body.email, name: body.name ?? null, status: 'questions_answered' })
    .eq('id', session.id);
  if (body.answers.length) {
    await db
      .from('question_answers')
      .insert(body.answers.map((a) => ({ session_id: session.id, question_id: a.question_id, answer: a.answer })));
  }
  await recordEvent('questions_submitted', session.id, { count: body.answers.length });

  const working = applyUserEdits(profileRow.payload, profileRow.user_edits ?? null);
  const answers: Answer[] = body.answers;
  const sessionId = session.id;

  // Heavy LLM pipeline (scoring + report) runs AFTER the response is sent, so the
  // client is never blocked on a 60–90s request (avoids serverless/proxy timeouts).
  // The result page polls /api/mri/report-status until the report row exists.
  after(async () => {
    try {
      const scored = await scoreAndClassify(working, answers);
      await db.from('scores').insert({
        session_id: sessionId,
        dimension_scores: scored.scores,
        weighted_summary: scored.summary,
        result_category: scored.classification.category,
        primary_offer: scored.classification.primary_offer,
        secondary_offer: scored.classification.secondary_offer,
        classifier_version: CLASSIFIER_VERSION,
        rubric_version: RUBRIC_VERSION,
      });
      await db
        .from('mri_sessions')
        .update({ lead_grade: scored.classification.lead_grade })
        .eq('id', sessionId);

      const report = await generateReport(locale, working, scored);
      await db.from('reports').insert({
        session_id: sessionId,
        locale,
        sections: report.sections,
        bands: scored.bands,
        limited_data: scored.limitedData,
        model: 'claude-sonnet-4-6',
        prompt_version: 'v2',
        degraded: report.degraded,
      });
      await db.from('mri_sessions').update({ status: 'report_generated' }).eq('id', sessionId);
      await recordEvent('report_generated', sessionId, {
        category: scored.classification.category,
        degraded: report.degraded,
      });
      // Mirror into PostHog so the funnel sees reports that were produced even when
      // the user closed the page. distinct_id from the client keeps the funnel joined.
      await phCaptureServer('report_generated', body.distinct_id || body.session_token, {
        category: scored.classification.category,
        degraded: report.degraded,
      });

      const reportUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${locale}/result/${body.session_token}`;

      // Deliver the report by email to the user (best-effort; no-op until RESEND_* are set).
      // Pass the type label so the email names how they were read, not a generic notice.
      const typeLabel = getContent(locale).share.types[scored.classification.category]?.label;
      await sendReportEmail({ to: body.email, name: body.name ?? null, reportUrl, locale, typeLabel });

      // Notify the founder of the new lead (best-effort; no-op until RESEND_API_KEY + FOUNDER_EMAIL set).
      await sendFounderNotification({
        leadEmail: body.email,
        leadName: body.name ?? null,
        locale,
        category: scored.classification.category,
        leadGrade: scored.classification.lead_grade,
        reportUrl,
        excerpt: report.sections.current_positioning?.body?.slice(0, 600),
      });

      // Admin summary — convenience only; failure must not affect the user's report.
      try {
        const summary = await callPrompt(adminSummaryPrompt, {
          profile: working,
          scores: scored.scores,
          category: scored.classification.category,
        });
        await db
          .from('admin_summaries')
          .upsert({ session_id: sessionId, summary_en: summary.summary_en, model: adminSummaryPrompt.model });
      } catch {
        /* admin convenience only */
      }
    } catch {
      // Pipeline failed entirely — mark the session so the result page can stop polling.
      await db.from('mri_sessions').update({ status: 'failed' }).eq('id', sessionId);
    }
  });

  return json({ session_token: body.session_token, status: 'generating' });
}
