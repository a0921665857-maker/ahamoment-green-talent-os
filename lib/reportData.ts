import { getServiceClient } from '@/lib/supabase';
import { RESULT_CATEGORIES } from '@/lib/constants';
import type { Locale, MbaIntent, ResultCategory, OfferId } from '@/lib/constants';
import type { Bands, ReportSections } from '@/lib/types';

export interface ReportView {
  locale: Locale;
  name: string | null;
  sections: ReportSections['sections'];
  bands: Bands;
  limitedData: boolean;
  degraded: boolean;
  category: ResultCategory;
  primaryOffer: OfferId;
  secondaryOffer: OfferId | null;
  mbaIntent: MbaIntent;
  createdAt: string;
}

/** Lightweight session lookup so the result page can distinguish "still generating" from "not found". */
export async function getSessionStatusByToken(
  token: string,
): Promise<{ status: string } | null> {
  const { data } = await getServiceClient()
    .from('mri_sessions')
    .select('status')
    .eq('session_token', token)
    .is('deleted_at', null)
    .single();
  return data ? { status: data.status as string } : null;
}

/** Server-side fetch of everything the result page renders, by report token. */
export async function getReportByToken(token: string): Promise<ReportView | null> {
  const db = getServiceClient();
  const { data: session } = await db
    .from('mri_sessions')
    .select('id, locale, name')
    .eq('session_token', token)
    .is('deleted_at', null)
    .single();
  if (!session) return null;

  const { data: report } = await db
    .from('reports')
    .select('sections, bands, limited_data, degraded, created_at')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  const { data: scores } = await db
    .from('scores')
    .select('result_category, primary_offer, secondary_offer')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (!report || !scores) return null;

  const { data: profileRow } = await db
    .from('extracted_profiles')
    .select('payload')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  const mbaIntent = (profileRow?.payload?.intent?.mba_intent as MbaIntent) ?? 'unknown';

  // Defensive: clamp to a known category so a legacy/renamed/unknown value can never
  // crash the result page (offers + share card index by category).
  const rawCategory = scores.result_category as string;
  const category = (RESULT_CATEGORIES as readonly string[]).includes(rawCategory)
    ? (rawCategory as ResultCategory)
    : 'profile_building_needed';

  return {
    locale: session.locale as Locale,
    name: session.name,
    sections: report.sections,
    bands: report.bands,
    limitedData: report.limited_data,
    degraded: report.degraded,
    category,
    primaryOffer: scores.primary_offer as OfferId,
    secondaryOffer: (scores.secondary_offer as OfferId | null) ?? null,
    mbaIntent,
    createdAt: report.created_at,
  };
}
