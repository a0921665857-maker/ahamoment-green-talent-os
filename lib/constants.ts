/**
 * Canonical ID lists. Single source of truth — content/schema.ts, lib/types.ts,
 * scoring, and components all derive their unions from these arrays.
 * Adding a value here intentionally breaks the build everywhere it must be handled.
 */

export const LOCALES = ['en', 'zh-TW'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const INPUT_TYPES = ['cv_pdf', 'linkedin_paste', 'notes_paste', 'voice_transcript'] as const;
export type InputType = (typeof INPUT_TYPES)[number];

export const SESSION_STATUSES = [
  'started',
  'input_received',
  'extracted',
  'confirmed',
  'questions_answered',
  'report_generated',
  'abandoned',
  'failed',
] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const FOLLOWUP_STATUSES = ['new', 'contacted', 'booked', 'paid', 'closed'] as const;
export type FollowupStatus = (typeof FOLLOWUP_STATUSES)[number];

export const RESULT_CATEGORIES = [
  'ready_for_mba_story_sprint',
  'strong_profile_weak_story',
  'climate_career_first_mba_later',
  'career_positioning_before_mba',
  'profile_building_needed',
  'high_potential_low_commercial_clarity',
  'interview_ready_positioning_weak',
  'cv_strong_narrative_weak',
] as const;
export type ResultCategory = (typeof RESULT_CATEGORIES)[number];

export const OFFER_IDS = [
  // Entry-tier "first yes" products (lowest friction first). The free intro call
  // and Deep Read are the cheapest yeses; consult is a low-risk human entry.
  'intro_call_free',
  'deep_read',
  'consult_60',
  'teardown_90',
  'cv_linkedin_review',
  'climate_positioning_sprint',
  'mba_story_sprint',
  'mock_interview_pack',
  // INSEAD-differentiated green-career services
  'offer_negotiation',
  'climate_finance_transition',
  'full_package',
] as const;
export type OfferId = (typeof OFFER_IDS)[number];

/** The 12 report sections, in render order (FREE_REPORT_STRATEGY.md). */
export const REPORT_SECTION_KEYS = [
  'current_positioning',
  'hidden_strengths',
  'underused_story_assets',
  'core_story_gap',
  'green_career_fit',
  'mba_readiness',
  'commercial_clarity',
  'international_positioning',
  'interview_readiness',
  'cv_readiness',
  'recommended_next_move',
  'suggested_paid_next_step',
] as const;
export type ReportSectionKey = (typeof REPORT_SECTION_KEYS)[number];

/** Sections whose band chip is suppressed in limited-data mode. */
export const LIMITED_DATA_SUPPRESSED: ReportSectionKey[] = ['interview_readiness', 'cv_readiness'];

export const BANDS = ['emerging', 'developing', 'strong'] as const;
export type Band = (typeof BANDS)[number];

export const DIMENSIONS = [
  'career_clarity',
  'green_economy_fit',
  'mba_readiness',
  'climate_career_fit',
  'leadership_proof',
  'impact_evidence',
  'commercial_credibility',
  'differentiation',
  'role_fit',
  'school_fit',
  'international_positioning',
  'story_risk',
  'interview_readiness',
  'cv_readiness',
] as const;
export type Dimension = (typeof DIMENSIONS)[number];

export const QUESTION_IDS = [
  'q_target_move',
  'q_timeline',
  'q_mba_intent',
  'q_geography',
  'q_commercial_ownership',
  'q_quantified_result',
  'q_green_focus',
  'q_recent_achievement',
] as const;
export type QuestionId = (typeof QUESTION_IDS)[number];

export const MBA_INTENTS = ['active', 'considering', 'later', 'no', 'unknown'] as const;
export type MbaIntent = (typeof MBA_INTENTS)[number];

export const TIMELINES = ['<6m', '6-12m', '12m+', 'unknown'] as const;
export type Timeline = (typeof TIMELINES)[number];

export const EVIDENCE_THEMES = [
  'leadership',
  'impact',
  'commercial',
  'technical',
  'international',
  'transition',
] as const;
export type EvidenceTheme = (typeof EVIDENCE_THEMES)[number];

export const SENIORITIES = ['junior', 'mid', 'senior', 'lead', 'exec'] as const;
export type Seniority = (typeof SENIORITIES)[number];

export const GREEN_DEPTHS = ['core', 'adjacent', 'aspiring'] as const;
export type GreenDepth = (typeof GREEN_DEPTHS)[number];

export const LEAD_GRADES = ['A', 'B', 'C'] as const;
export type LeadGrade = (typeof LEAD_GRADES)[number];

export const EVENT_NAMES = [
  'page_view',
  'language_selected',
  'mri_started',
  'input_method_selected',
  'consent_given',
  'material_submitted',
  'extraction_succeeded',
  'extraction_failed',
  'profile_confirmed',
  'questions_submitted',
  'report_generated',
  'report_viewed',
  'cta_clicked',
  'booking_clicked',
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

/** Input limits (PROFILE_EXTRACTION_MODEL.md). */
export const INPUT_LIMITS = {
  minCharsEn: 150,
  minCharsZh: 80,
  maxChars: 40_000,
  maxPdfBytes: 10 * 1024 * 1024,
} as const;

/** Question count rules (missingInfoDetector). */
export const QUESTION_COUNT = { normal: 3, lowConfidence: 5 } as const;
export const LOW_OVERALL_CONFIDENCE = 0.5;
export const LOW_GROUP_CONFIDENCE = 0.5;

export const RATE_LIMIT = {
  submissionsPerHourPerIp: 5,
  maxRegenerations: 2,
  adminLoginsPerHourPerIp: 10,
} as const;

/** Site-wide daily MRI kill switch. Env-overridable; ≤0 disables the cap. */
export const DAILY_MRI_CAP = Number(process.env.MRI_DAILY_CAP ?? 50);

export const MODELS = {
  quality: 'claude-sonnet-4-6',
  cheap: 'claude-haiku-4-5',
} as const;
