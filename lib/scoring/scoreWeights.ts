/**
 * Every tunable number in the scoring system lives HERE, not in logic files.
 * Calibration after ~30 real sessions edits this file only, then reruns
 * `npm test` (golden classifier tests must still pass or be consciously updated).
 */
import type { Band, Dimension } from '@/lib/constants';

export const SCORE_WEIGHTS_VERSION = '0.1';
export const CLASSIFIER_VERSION = '0.1';

/** Composite index weights (must each sum to 1 — enforced by tests). */
export const indexWeights: Record<'story_index' | 'mba_index' | 'climate_index', Partial<Record<Dimension, number>>> = {
  story_index: {
    career_clarity: 0.3,
    differentiation: 0.25,
    story_risk: 0.25,
    commercial_credibility: 0.2,
  },
  mba_index: {
    mba_readiness: 0.35,
    leadership_proof: 0.25,
    impact_evidence: 0.2,
    international_positioning: 0.2,
  },
  climate_index: {
    green_economy_fit: 0.4,
    climate_career_fit: 0.35,
    role_fit: 0.25,
  },
};

/** User-facing band cutoffs (inclusive lower bounds). */
export const bandCutoffs: { band: Band; min: number }[] = [
  { band: 'strong', min: 3.8 },
  { band: 'developing', min: 2.5 },
  { band: 'emerging', min: 1.0 },
];

/** Dimensions with confidence below this are excluded from weighted aggregates. */
export const MIN_DIMENSION_CONFIDENCE = 0.4;

/** Classifier rule thresholds (R0–R8, SCORING_MODEL.md). */
export const classifierThresholds = {
  r0_minOverallConfidence: 0.45,
  r0_minAvgScore: 2.0,
  r1_mbaIndex: 3.8,
  r1_storyIndex: 3.3,
  r2_mbaIndex: 3.3,
  r2_storyIndexBelow: 3.0,
  r3_climateIndex: 3.3,
  r3_mbaIndexBelow: 3.3,
  r4_cvReadiness: 4,
  r4_storyIndexBelow: 3.0,
  r5_interviewReadiness: 4,
  r5_storyIndexBelow: 3.0,
  r6_avgTop5: 3.5,
  r6_commercialMax: 2.5,
  r7_avgScore: 3.3,
  r7_storyIndexBelow: 3.0,
} as const;

/** Secondary-offer overlay conditions (PAID_OFFER_STRATEGY.md). */
export const overlayThresholds = {
  cvReviewIfCvReadinessAtMost: 2, // strong_profile_weak_story secondary
  mockPackIfInterviewAtMost: 2, // any-category overlay, with timeline gate below
} as const;

/** Lead grading (PAID_OFFER_STRATEGY.md). */
export const leadGradeRules = {
  a_timelines: ['<6m'] as const,
  b_timelines: ['<6m', '6-12m'] as const,
  b_strongAvgScore: 3.5, // "strong scores with vague timeline"
  a_minSeniority: ['mid', 'senior', 'lead', 'exec'] as const,
  /** Categories eligible for grade A (table rows 1,2,4,6,7,8). */
  a_categories: [
    'ready_for_mba_story_sprint',
    'strong_profile_weak_story',
    'career_positioning_before_mba',
    'high_potential_low_commercial_clarity',
    'interview_ready_positioning_weak',
    'cv_strong_narrative_weak',
  ] as const,
} as const;
