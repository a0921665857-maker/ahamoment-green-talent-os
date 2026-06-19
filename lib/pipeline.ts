/**
 * Server-side orchestration shared by the API routes. Keeps the route handlers
 * thin and the error/degraded patterns (ARCHITECTURE.md) in one place.
 */
import { DIMENSIONS, LOW_OVERALL_CONFIDENCE, type Locale } from '@/lib/constants';
import { getContent } from '@/content';
import type {
  Answer,
  Bands,
  Classification,
  DimensionScores,
  ExtractedProfile,
  ReportSections,
  UserEdits,
  WeightedSummary,
} from '@/lib/types';
import { callPrompt, PromptValidationError } from '@/lib/anthropic';
import { dimensionScoringPrompt, mriReportPrompt } from '@/lib/prompts';
import { classify, computeBands, computeWeightedSummary } from '@/lib/scoring/resultClassifier';
import { reportTemplates as enReportTemplates } from '@/content/en/reportTemplates';

/** Patch the working profile with the user's confirmation-page edits before scoring. */
export function applyUserEdits(profile: ExtractedProfile, edits: UserEdits | null): ExtractedProfile {
  if (!edits) return profile;
  const next: ExtractedProfile = structuredClone(profile);
  if (edits.current_role) next.identity.current_role = edits.current_role;
  if (edits.current_org) next.identity.current_org = edits.current_org;
  if (edits.intent_note) next.intent.target_move = edits.intent_note;
  // Notes are appended as free_text/risks rather than overwriting structured slugs,
  // so a user's clarification never silently drops extracted taxonomy hits.
  if (edits.sectors_note) next.green_economy.free_text.push(edits.sectors_note);
  if (edits.domains_note) next.green_economy.free_text.push(edits.domains_note);
  if (edits.career_summary) next.story_signals.differentiators.push(edits.career_summary);
  return next;
}

export interface ScoredResult {
  scores: DimensionScores;
  summary: WeightedSummary;
  classification: Classification;
  bands: Bands;
  limitedData: boolean;
  degraded: boolean;
}

/**
 * Score → classify. On a scoring failure after the built-in repair retry,
 * fall back to profile_building_needed + degraded=true (ARCHITECTURE.md).
 */
export async function scoreAndClassify(
  profile: ExtractedProfile,
  answers: Answer[],
): Promise<ScoredResult> {
  let scores: DimensionScores;
  let degraded = false;
  try {
    scores = await callPrompt(dimensionScoringPrompt, { profile, answers });
  } catch (e) {
    if (!(e instanceof PromptValidationError)) throw e;
    degraded = true;
    scores = degradedScores();
  }

  const summary = computeWeightedSummary(scores);
  const limitedData = profile.confidence.overall < LOW_OVERALL_CONFIDENCE;
  const baseClassification = classify({
    scores,
    summary,
    mba_intent: profile.intent.mba_intent,
    timeline: profile.intent.timeline,
    overall_confidence: profile.confidence.overall,
    seniority: profile.identity.seniority ?? null,
    degraded,
  });
  const classification: Classification = degraded
    ? { ...baseClassification, category: 'profile_building_needed', degraded: true }
    : baseClassification;
  const bands = computeBands(scores, summary, limitedData);
  return { scores, summary, classification, bands, limitedData, degraded };
}

/**
 * Generate the 12-section report in the user's locale. On failure after the
 * repair retry, return template fallback bodies + degraded=true so the user
 * still receives a report.
 */
export async function generateReport(
  locale: Locale,
  profile: ExtractedProfile,
  scored: ScoredResult,
): Promise<{ sections: ReportSections['sections']; degraded: boolean }> {
  const content = getContent(locale);
  const categoryCopy = content.results[scored.classification.category];
  try {
    const result = await callPrompt(mriReportPrompt, {
      locale,
      profile,
      bands: scored.bands,
      category: scored.classification.category,
      categoryCopy,
      limitedData: scored.limitedData,
    });
    return { sections: result.sections, degraded: scored.degraded };
  } catch (e) {
    if (!(e instanceof PromptValidationError)) throw e;
    return { sections: fallbackSections(locale), degraded: true };
  }
}

/* --------------------------------- fallbacks --------------------------------- */

function degradedScores(): DimensionScores {
  const out = {} as DimensionScores;
  for (const d of DIMENSIONS) out[d] = { score: 2, confidence: 0.2, evidence: 'unavailable (degraded)' };
  return out;
}

function fallbackSections(locale: Locale): ReportSections['sections'] {
  const tpl = getContent(locale).reportTemplates.sections;
  const keys = Object.keys(enReportTemplates.sections) as (keyof typeof tpl)[];
  const out = {} as ReportSections['sections'];
  for (const k of keys) out[k] = { body: tpl[k].fallback, evidence_ref: 'degraded-fallback' };
  return out;
}
