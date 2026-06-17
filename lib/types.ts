/**
 * Zod schemas for every LLM and data boundary. These are the runtime law;
 * lib/constants.ts supplies the canonical ID lists they validate against.
 */
import { z } from 'zod';
import {
  BANDS,
  DIMENSIONS,
  EVIDENCE_THEMES,
  GREEN_DEPTHS,
  LEAD_GRADES,
  MBA_INTENTS,
  QUESTION_IDS,
  REPORT_SECTION_KEYS,
  RESULT_CATEGORIES,
  OFFER_IDS,
  SENIORITIES,
  TIMELINES,
  type Dimension,
  type ReportSectionKey,
} from './constants';

/* ---------------------------------- helpers --------------------------------- */

const confidence = z.number().min(0).max(1);
// The extraction prompt is instructed to OMIT a group entirely when the material
// gives no signal (anti-hallucination). The schema is the tolerant boundary that
// normalizes an omitted/null confidence to 0 ("material does not support this").
const confidenceLax = z
  .number()
  .min(0)
  .max(1)
  .nullish()
  .transform((v) => v ?? 0);
const score15 = z.number().min(1).max(5);

/* ------------------------------ ExtractedProfile ----------------------------- */

export const EvidenceAssetSchema = z.object({
  quote: z.string().min(1).max(220), // ≤25 words enforced by prompt; chars as backstop
  source_hint: z.string().min(1).max(120),
  theme: z.enum(EVIDENCE_THEMES),
});

export const ExtractedProfileSchema = z.object({
  identity: z.object({
    current_role: z.string().nullish(),
    current_org: z.string().nullish(),
    years_experience: z.number().min(0).max(60).nullish(),
    location: z.string().nullish(),
    languages: z.array(z.string()).nullish(),
    seniority: z.enum(SENIORITIES).nullish(),
  }),
  career_history: z.array(
    z.object({
      org: z.string(),
      role: z.string(),
      start: z.string().nullish(),
      end: z.string().nullish(),
      scope: z.string().nullish(),
      achievements: z.array(z.string()).default([]),
    }),
  ),
  education: z.array(
    z.object({ school: z.string(), program: z.string(), year: z.string().nullish() }),
  ),
  green_economy: z.object({
    sectors: z.array(z.string()).default([]), // taxonomy slugs — validated softly in code
    functions: z.array(z.string()).default([]),
    domains: z.array(z.string()).default([]),
    free_text: z.array(z.string()).default([]),
    depth: z.enum(GREEN_DEPTHS),
  }),
  credentials: z.array(z.string()).default([]),
  evidence_assets: z.array(EvidenceAssetSchema).default([]),
  commercial_signals: z.object({
    // Prompt may omit these when absent; normalize omitted/null → null.
    revenue_or_budget_ownership: z.boolean().nullish().transform((v) => v ?? null),
    client_facing: z.boolean().nullish().transform((v) => v ?? null),
    quantified_results: z.array(z.string()).default([]),
  }),
  intent: z.object({
    mba_intent: z.enum(MBA_INTENTS),
    target_move: z.string().nullish(),
    timeline: z.enum(TIMELINES).default('unknown'),
    geography: z.string().nullish(),
  }),
  story_signals: z.object({
    differentiators: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
  }),
  confidence: z.object({
    identity: confidenceLax,
    career_history: confidenceLax,
    green_economy: confidenceLax,
    commercial: confidenceLax,
    intent: confidenceLax,
    overall: confidenceLax,
  }),
  missing_fields: z.array(z.enum(QUESTION_IDS)).default([]),
});
export type ExtractedProfile = z.infer<typeof ExtractedProfileSchema>;

/* -------------------------------- Dimension scores --------------------------- */

export const DimensionScoreSchema = z.object({
  score: score15,
  confidence,
  evidence: z.string().min(1).max(400),
});

export const DimensionScoresSchema = z.object(
  Object.fromEntries(DIMENSIONS.map((d) => [d, DimensionScoreSchema])) as Record<
    Dimension,
    typeof DimensionScoreSchema
  >,
);
export type DimensionScores = z.infer<typeof DimensionScoresSchema>;

/* --------------------------------- Report sections --------------------------- */

export const ReportSectionSchema = z.object({
  body: z.string().min(1),
  evidence_ref: z.string().min(1), // specificity contract: must cite the user's material
});

export const ReportSectionsSchema = z.object({
  sections: z.object(
    Object.fromEntries(REPORT_SECTION_KEYS.map((k) => [k, ReportSectionSchema])) as Record<
      ReportSectionKey,
      typeof ReportSectionSchema
    >,
  ),
});
export type ReportSections = z.infer<typeof ReportSectionsSchema>;

/* ------------------------------- Derived/stored types ------------------------ */

export const WeightedSummarySchema = z.object({
  story_index: z.number(),
  mba_index: z.number(),
  climate_index: z.number(),
  avg_score: z.number(),
  avg_top5: z.number(),
});
export type WeightedSummary = z.infer<typeof WeightedSummarySchema>;

export const ClassificationSchema = z.object({
  category: z.enum(RESULT_CATEGORIES),
  primary_offer: z.enum(OFFER_IDS),
  secondary_offer: z.enum(OFFER_IDS).nullable(),
  lead_grade: z.enum(LEAD_GRADES),
  degraded: z.boolean().default(false),
});
export type Classification = z.infer<typeof ClassificationSchema>;

export const BandsSchema = z.object({
  story_index: z.enum(BANDS),
  mba_index: z.enum(BANDS),
  climate_index: z.enum(BANDS),
  commercial_credibility: z.enum(BANDS),
  international_positioning: z.enum(BANDS),
  interview_readiness: z.enum(BANDS).nullable(), // null in limited-data mode
  cv_readiness: z.enum(BANDS).nullable(),
  green_economy_fit: z.enum(BANDS),
  mba_readiness: z.enum(BANDS),
});
export type Bands = z.infer<typeof BandsSchema>;

/* --------------------------------- Admin artifacts --------------------------- */

export const AdminSummarySchema = z.object({
  summary_en: z.string().min(1).max(1200), // ~6 lines
});
export type AdminSummary = z.infer<typeof AdminSummarySchema>;

export const MemoDraftSchema = z.object({
  read: z.string(),
  gaps: z.string(),
  angle: z.string(),
  talking_points: z.array(z.string()).min(1),
  questions_to_ask: z.array(z.string()).min(1),
});
export type MemoDraft = z.infer<typeof MemoDraftSchema>;

export const EmailDraftSchema = z.object({
  personal_line: z.string().min(1).max(600),
  category_note: z.string().min(1).max(600),
});
export type EmailDraft = z.infer<typeof EmailDraftSchema>;

export const TranslationSchema = z.object({ text: z.string().min(1) });

/* ------------------------------- API request bodies -------------------------- */

export const UserEditsSchema = z
  .object({
    current_role: z.string().max(200).optional(),
    current_org: z.string().max(200).optional(),
    career_summary: z.string().max(2000).optional(),
    sectors_note: z.string().max(500).optional(),
    domains_note: z.string().max(500).optional(),
    intent_note: z.string().max(800).optional(),
  })
  .strict();
export type UserEdits = z.infer<typeof UserEditsSchema>;

export const AnswerSchema = z.object({
  question_id: z.enum(QUESTION_IDS),
  answer: z.string().min(1).max(2000),
});
export type Answer = z.infer<typeof AnswerSchema>;
