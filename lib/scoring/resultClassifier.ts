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
import { isPublicPaidOffer, PUBLIC_PAID_OFFER_IDS } from '@/lib/services';
import {
  bandCutoffs,
  classifierThresholds as T,
  indexWeights,
  leadGradeRules,
  MIN_DIMENSION_CONFIDENCE,
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

/**
 * Category → the one recommended service, plus the other public one as the
 * alternative.
 *
 * Gate 8 (2026-07-29) replaced the 11-item mapping table with a two-service
 * catalogue, so this is now a single question: is this person standing in front
 * of an MBA application, or in front of a career/offer decision? Everything the
 * old table expressed through overlays (mock-interview packs, CV reviews,
 * multi-week sprints) refers to services that no longer exist publicly.
 *
 * The old signature also took `scores` and `timeline` to drive overlays. With a
 * two-item catalogue neither can change the answer, so they are gone rather
 * than left in place as dead parameters that imply a decision they don't make.
 */
export function offersFor(category: ResultCategory): {
  primary: OfferId;
  secondary: OfferId | null;
} {
  const mbaCategories: ResultCategory[] = [
    'ready_for_mba_story_sprint',
    'career_positioning_before_mba',
  ];
  const primary: OfferId = mbaCategories.includes(category)
    ? 'mba_story_teardown'
    : 'offer_path_read';
  const secondary: OfferId =
    primary === 'mba_story_teardown' ? 'offer_path_read' : 'mba_story_teardown';
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
  const { primary, secondary } = offersFor(category);
  const lead_grade = gradeLead(category, input.summary, input.timeline, input.seniority);
  return {
    category,
    primary_offer: primary,
    secondary_offer: secondary,
    lead_grade,
    degraded: input.degraded ?? false,
  };
}

/**
 * The paid slots shown on the report: the recommended service, then the other
 * public one. Two slots, never three — the anchor slot existed to make a
 * NT$30,000 package look reasonable, and that package no longer exists.
 * Archived offers can never reach a slot. The free call is rendered separately
 * as the hero in PaidOfferCta.
 */
export function ctaOffers(c: Pick<Classification, 'category' | 'primary_offer' | 'secondary_offer'>): {
  offer: OfferId;
  role: 'primary' | 'entry';
}[] {
  const slots: { offer: OfferId; role: 'primary' | 'entry' }[] = [];
  if (isPublicPaidOffer(c.primary_offer)) slots.push({ offer: c.primary_offer, role: 'primary' });
  if (c.secondary_offer && isPublicPaidOffer(c.secondary_offer) && c.secondary_offer !== c.primary_offer)
    slots.push({ offer: c.secondary_offer, role: 'entry' });

  // Historical rows (pre-Gate-8 classifications persisted in `scores`) can carry
  // archived offer ids. Rather than render a service that cannot be bought, fall
  // back to today's catalogue in its canonical order.
  if (slots.length === 0)
    return PUBLIC_PAID_OFFER_IDS.map((offer, i) => ({
      offer: offer as OfferId,
      role: i === 0 ? ('primary' as const) : ('entry' as const),
    }));

  const seen = new Set<OfferId>();
  return slots.filter((s) => (seen.has(s.offer) ? false : (seen.add(s.offer), true))).slice(0, 2);
}

/* ----------------------------------- utils ----------------------------------- */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export const BAND_ORDER: readonly Band[] = BANDS;
