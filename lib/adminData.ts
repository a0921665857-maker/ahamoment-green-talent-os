import { getServiceClient } from '@/lib/supabase';
import type { LeadGrade, ResultCategory, FollowupStatus } from '@/lib/constants';

export interface LeadRow {
  id: string;
  created_at: string;
  locale: string;
  status: string;
  email: string | null;
  name: string | null;
  lead_grade: LeadGrade | null;
  followup_status: FollowupStatus;
  result_category: ResultCategory | null;
}

const GRADE_RANK: Record<string, number> = { A: 0, B: 1, C: 2 };

/** Lead list for the dashboard: newest first, then grade A→C (PAID_OFFER_STRATEGY queue). */
export async function listLeads(): Promise<LeadRow[]> {
  const db = getServiceClient();
  const { data: sessions } = await db
    .from('mri_sessions')
    .select('id, created_at, locale, status, email, name, lead_grade, followup_status')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(200);
  if (!sessions) return [];

  const ids = sessions.map((s) => s.id);
  const { data: scores } = await db
    .from('scores')
    .select('session_id, result_category')
    .in('session_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
  const catBySession = new Map((scores ?? []).map((s) => [s.session_id, s.result_category]));

  const rows: LeadRow[] = sessions.map((s) => ({
    ...s,
    lead_grade: (s.lead_grade as LeadGrade | null) ?? null,
    followup_status: s.followup_status as FollowupStatus,
    result_category: (catBySession.get(s.id) as ResultCategory | null) ?? null,
  }));

  return rows.sort((a, b) => {
    const g = (GRADE_RANK[a.lead_grade ?? 'C'] ?? 2) - (GRADE_RANK[b.lead_grade ?? 'C'] ?? 2);
    if (g !== 0) return g;
    return b.created_at.localeCompare(a.created_at);
  });
}

export interface LeadDetail {
  session: {
    id: string;
    created_at: string;
    locale: string;
    status: string;
    email: string | null;
    name: string | null;
    lead_grade: string | null;
    followup_status: string;
    admin_notes: string | null;
    input_type: string | null;
    consent_aggregate: boolean;
  };
  source: { type: string; raw_text: string | null; char_count: number; purged_at: string | null } | null;
  profile: Record<string, unknown> | null;
  userEdits: Record<string, unknown> | null;
  answers: { question_id: string; answer: string }[];
  scores: {
    dimension_scores: Record<string, { score: number; confidence: number; evidence: string }>;
    weighted_summary: Record<string, number>;
    result_category: string;
    primary_offer: string;
    secondary_offer: string | null;
  } | null;
  report: { sections: Record<string, { body: string; evidence_ref: string }>; limited_data: boolean; degraded: boolean } | null;
  summaryEn: string | null;
  memo: Record<string, unknown> | null;
}

export async function getLeadDetail(id: string): Promise<LeadDetail | null> {
  const db = getServiceClient();
  const { data: session } = await db
    .from('mri_sessions')
    .select(
      'id, created_at, locale, status, email, name, lead_grade, followup_status, admin_notes, input_type, consent_aggregate',
    )
    .eq('id', id)
    .single();
  if (!session) return null;

  const [{ data: source }, { data: prof }, { data: ans }, { data: sc }, { data: rep }, { data: sum }] =
    await Promise.all([
      db.from('source_materials').select('type, raw_text, char_count, purged_at').eq('session_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('extracted_profiles').select('payload, user_edits').eq('session_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('question_answers').select('question_id, answer').eq('session_id', id),
      db.from('scores').select('dimension_scores, weighted_summary, result_category, primary_offer, secondary_offer').eq('session_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('reports').select('sections, limited_data, degraded').eq('session_id', id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      db.from('admin_summaries').select('summary_en, memo_draft').eq('session_id', id).maybeSingle(),
    ]);

  return {
    session,
    source: source ?? null,
    profile: (prof?.payload as Record<string, unknown>) ?? null,
    userEdits: (prof?.user_edits as Record<string, unknown>) ?? null,
    answers: ans ?? [],
    scores: sc ?? null,
    report: rep ?? null,
    summaryEn: sum?.summary_en ?? null,
    memo: (sum?.memo_draft as Record<string, unknown>) ?? null,
  };
}
