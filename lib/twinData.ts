/**
 * Twin data access: all completed reports for one email, oldest → newest.
 * Zero-migration v1 — aggregates existing mri_sessions rows by their email.
 */
import { getServiceClient } from '@/lib/supabase';
import { RESULT_CATEGORIES } from '@/lib/constants';
import type { Locale, ResultCategory } from '@/lib/constants';
import type { Bands } from '@/lib/types';

export interface TwinReportSummary {
  token: string;
  locale: Locale;
  createdAt: string;
  category: ResultCategory;
  bands: Bands;
}

export async function getTwinReports(email: string): Promise<TwinReportSummary[]> {
  const db = getServiceClient();
  const { data: sessions } = await db
    .from('mri_sessions')
    .select('id, session_token, locale, created_at')
    .ilike('email', email.trim())
    .eq('status', 'report_generated')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })
    .limit(12);
  if (!sessions?.length) return [];

  const out: TwinReportSummary[] = [];
  for (const s of sessions) {
    const { data: report } = await db
      .from('reports')
      .select('bands, created_at')
      .eq('session_id', s.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    const { data: score } = await db
      .from('scores')
      .select('result_category')
      .eq('session_id', s.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (!report || !score) continue;
    const rawCategory = score.result_category as string;
    out.push({
      token: s.session_token as string,
      locale: s.locale as Locale,
      createdAt: (report.created_at as string) ?? (s.created_at as string),
      category: (RESULT_CATEGORIES as readonly string[]).includes(rawCategory)
        ? (rawCategory as ResultCategory)
        : 'profile_building_needed',
      bands: report.bands as Bands,
    });
  }
  return out;
}
