/**
 * Deterministic classification (SCORING_MODEL.md, binding decision #4).
 * Pure functions, no I/O, fully unit-tested. The LLM scores; THIS picks the category.
 */
import {
  BANDS,
  DIMENSIONS,
  type Band,
  type Dimension,
  type LeadGrade,
  type MbaIntent,
  type OfferId,
  type ResultCategory,
  type Seniority,
  type Timeline,
} from '@/lib/constants';
import type { Bands, Classification, DimensionScores, WeightedSummary } from '@/lib/types';
import {
  bandCutoffs,
  classifierThresholds as T,
  indexWeights,
  leadGradeRules,
  MIN_DIMENSION_CONFIDENCE,
  overlayThresholds,
} from './scoreWeights';

/* --------------------------------- aggregates -------------------------------- */

export function toBand(value: number): Band {
  for (const { band, min } of bandCutoffs) if (value >= min) return band;
  return 'emerging';
}

function confidentDims(scores: DimensionScores): Dimension[] {
  return DIMENSIONS.filter((d) => scores[d].confidence >= MIN_DIMENSION_CONFIDENCE);
}

/**
 * Weighted mean over the index's dimensions, excluding low-confidence dims and
 * renormalizing remaining weights. If every component is low-confidence, falls
 * back to the unweighted mean of the component scores (R0 usually catches these
 * sessions anyway via overall confidence).
 */
export function computeIndex(
  scores: DimensionScores,
  weights: Partial<Record<Dimension, number>>,
): number {
  const entries = Object.entries(weights) as [Dimension, number][];
  const usable = entries.filter(([d]) => scores[d].confidence >= MIN_DIMENSION_CONFIDENCE);
  if (usable.length === 0) {
    const vals = entries.map(([d]) => scores[d].score);
    return round2(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  const totalW = usable.reduce((a, [, w]) => a + w, 0);
  const sum = usable.reduce((a, [d, w]) => a + scores[d].score * (w / totalW), 0);
  return round2(sum);
}

export function computeWeightedSummary(scores: DimensionScores): WeightedSummary {
  const usable = confidentDims(scores);
  const pool = usable.length > 0 ? usable : [...DIMENSIONS];
  const vals = pool.map((d) => scores[d].score);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const top5 = [...vals].sort((a, b) => b - a).slice(0, Math.min(5, vals.length));
  const avgTop5 = top5.reduce((a, b) => a + b, 0) / top5.length;
  return {
    story_index: computeIndex(scores, indexWeights.story_index),
    mba_index: computeIndex(scores, indexWeights.mba_index),
    climate_index: computeIndex(scores, indexWeights.climate_index),
    avg_score: round2(avg),
    avg_top5: round2(avgTop5),
  };
}

/** User-facing bands. Pass limitedData to suppress interview/cv bands. */
export function computeBands(
  scores: DimensionScores,
  summary: WeightedSummary,
  limitedData: boolean,
): Bands {
  const dimBand = (d: Dimension): Band =>
    scores[d].confidence >= MIN_DIMENSION_CONFIDENCE ? toBand(scores[d].score) : 'emerging';
  const dimBandOrNull = (d: Dimension): Band | null => {
    if (limitedData) return null;
    if (scores[d].confidence < MIN_DIMENSION_CONFIDENCE) return null; // "not enough signal"
    return toBand(scores[d].score);
  };
  return {
    story_index: toBand(summary.story_index),
    mba_index: toBand(summary.mba_index),
    climate_index: toBand(summary.climate_index),
    commercial_credibility: dimBand('commercial_credibility'),
    international_positioning: dimBand('international_positioning'),
    interview_readiness: dimBandOrNull('interview_readiness'),
    cv_readiness: dimBandOrNull('cv_readiness'),
    green_economy_fit: dimBand('green_economy_fit'),
    mba_readiness: dimBand('mba_readiness'),
  };
}

/* --------------------------------- classifier -------------------------------- */

export interface ClassifierInput {
  scores: DimensionScores;
  summary: WeightedSummary;
  mba_intent: MbaIntent;
  timeline: Timeline;
  overall_confidence: number;
  seniority: Seniority | null;
  degraded?: boolean;
}

/** Priority-ordered rules R0–R8 — first match wins (SCORING_MODEL.md v0.1). */
export function pickCategory(input: ClassifierInput): ResultCategory {
  const { scores: s, summary: w, mba_intent: mba, overall_confidence: conf } = input;

  // R0
  if (conf < T.r0_minOverallConfidence || w.avg_score < T.r0_minAvgScore)
    return 'profile_building_needed';
  // R1
  if (mba === 'active' && w.mba_index >= T.r1_mbaIndex && w.story_index >= T.r1_storyIndex)
    return 'ready_for_mba_story_sprint';
  // R2
  if (
    (mba === 'active' || mba === 'considering') &&
    w.mba_index >= T.r2_mbaIndex &&
    w.story_index < T.r2_storyIndexBelow
  )
    return 'career_positioning_before_mba';
  // R3
  if (
    (mba === 'considering' || mba === 'later') &&
    w.climate_index >= T.r3_climateIndex &&
    w.mba_index < T.r3_mbaIndexBelow
  )
    return 'climate_career_builder';
  // R4
  if (s.cv_readiness.score >= T.r4_cvReadiness && w.story_index < T.r4_storyIndexBelow)
    return 'cv_strong_narrative_weak';
  // R5
  if (s.interview_readiness.score >= T.r5_interviewReadiness && w.story_index < T.r5_storyIndexBelow)
    return 'interview_ready_positioning_weak';
  // R6
  if (w.avg_top5 >= T.r6_avgTop5 && s.commercial_credibility.score <= T.r6_commercialMax)
    return 'high_potential_low_commercial_clarity';
  // R7
  if (w.avg_score >= T.r7_avgScore && w.story_index < T.r7_storyIndexBelow)
    return 'strong_profile_weak_story';
  // R8 fallback. Someone who already holds / is doing an MBA is a job-seeker, not an
  // applicant — route them to job-positioning, never an "MBA later/before" category.
  if (mba === 'current') return 'strong_profile_weak_story';
  return mba === 'active' || mba === 'considering'
    ? 'career_positioning_before_mba'
    : 'climate_career_builder';
}

/** Category → primary/secondary offers (PAID_OFFER_STRATEGY.md mapping table). */
export function offersFor(
  category: ResultCategory,
  scores: DimensionScores,
  timeline: Timeline,
): { primary: OfferId; secondary: OfferId | null } {
  let primary: OfferId;
  let secondary: OfferId | null = null;

  switch (category) {
    case 'ready_for_mba_story_sprint':
      primary = 'mba_story_sprint';
      break;
    case 'strong_profile_weak_story':
      primary = 'teardown_90';
      if (scores.cv_readiness.score <= overlayThresholds.cvReviewIfCvReadinessAtMost)
        secondary = 'cv_linkedin_review';
      break;
    case 'climate_career_builder':
      primary = 'climate_positioning_sprint';
      break;
    case 'career_positioning_before_mba':
      primary = 'climate_positioning_sprint';
      secondary = 'teardown_90';
      break;
    case 'profile_building_needed':
      primary = 'teardown_90'; // framed as optional; honest build-first guidance is the headline
      break;
    case 'high_potential_low_commercial_clarity':
      primary = 'climate_positioning_sprint';
      secondary = 'teardown_90';
      break;
    case 'interview_ready_positioning_weak':
      primary = 'teardown_90';
      secondary = 'mock_interview_pack';
      break;
    case 'cv_strong_narrative_weak':
      primary = 'teardown_90';
      break;
  }

  // Any-category overlay: mock pack when interviews are imminent and weak.
  // Fills an EMPTY secondary slot only — category-specific secondaries take precedence.
  if (
    secondary === null &&
    scores.interview_readiness.score <= overlayThresholds.mockPackIfInterviewAtMost &&
    timeline === '<6m' &&
    // defensive: no category maps mock pack as primary today, but the mapping is config
    (primary as OfferId) !== 'mock_interview_pack'
  ) {
    secondary = 'mock_interview_pack';
  }

  return { primary, secondary };
}

export function gradeLead(
  category: ResultCategory,
  summary: WeightedSummary,
  timeline: Timeline,
  seniority: Seniority | null,
): LeadGrade {
  const aTimeline = (leadGradeRules.a_timelines as readonly string[]).includes(timeline);
  const aSeniority =
    seniority !== null && (leadGradeRules.a_minSeniority as readonly string[]).includes(seniority);
  const aCategory = (leadGradeRules.a_categories as readonly string[]).includes(category);
  if (aTimeline && aSeniority && aCategory) return 'A';

  const bTimeline = (leadGradeRules.b_timelines as readonly string[]).includes(timeline);
  const strongVague =
    summary.avg_score >= leadGradeRules.b_strongAvgScore &&
    (timeline === 'unknown' || timeline === '12m+');
  if (bTimeline || strongVague) return 'B';
  return 'C';
}

export function classify(input: ClassifierInput): Classification {
  const category = pickCategory(input);
  const { primary, secondary } = offersFor(category, input.scores, input.timeline);
  const lead_grade = gradeLead(category, input.summary, input.timeline, input.seniority);
  return {
    category,
    primary_offer: primary,
    secondary_offer: secondary,
    lead_grade,
    degraded: input.degraded ?? false,
  };
}

/** The cheapest paid "yes" — the universal low-risk entry (PRODUCT_OPTIMIZATION_ROADMAP). */
const CHEAPEST_YES: OfferId = 'deep_read';

/**
 * The three CTA slots shown on the report: primary recommendation + a low-risk
 * entry + full_package anchor. The entry slot prefers a category-specific
 * secondary (tailored); absent that, it leads with the cheapest paid yes
 * (Deep Read) per START_HERE — "the first yes is the hardest; make it small."
 * Deduped, nulls dropped, max 3, anchor last. The free intro call is surfaced
 * separately as a quiet always-on option in PaidOfferCta.
 */
export function ctaOffers(c: Pick<Classification, 'category' | 'primary_offer' | 'secondary_offer'>): {
  offer: OfferId;
  role: 'primary' | 'entry' | 'anchor';
}[] {
  const slots: { offer: OfferId; role: 'primary' | 'entry' | 'anchor' }[] = [];
  slots.push({ offer: c.primary_offer, role: 'primary' });

  const entry =
    c.secondary_offer && c.secondary_offer !== 'full_package' ? c.secondary_offer : CHEAPEST_YES;
  if (entry !== c.primary_offer) slots.push({ offer: entry, role: 'entry' });

  if (!slots.some((s) => s.offer === 'full_package'))
    slots.push({ offer: 'full_package', role: 'anchor' });

  const seen = new Set<OfferId>();
  return slots.filter((s) => (seen.has(s.offer) ? false : (seen.add(s.offer), true))).slice(0, 3);
}

/* ----------------------------------- utils ----------------------------------- */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const BAND_ORDER: readonly Band[] = BANDS;
