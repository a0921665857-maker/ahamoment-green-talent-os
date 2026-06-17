import { AdminSummarySchema, type DimensionScores, type ExtractedProfile } from '@/lib/types';
import { MODELS, type ResultCategory } from '@/lib/constants';
import type { PromptDef } from './types';

export interface AdminSummaryInput {
  profile: ExtractedProfile;
  scores: DimensionScores;
  category: ResultCategory;
}

/** Always English — Michael scans the admin queue in one language (BILINGUAL_CONTENT_SYSTEM.md). */
export const adminSummaryPrompt: PromptDef<AdminSummaryInput, typeof AdminSummarySchema> = {
  id: 'admin_summary',
  version: 'v1',
  model: MODELS.cheap,
  temperature: 0.3,
  maxTokens: 700,
  system: `You write a tight internal English summary of one diagnostic session for the founder's admin queue. Output JSON only — no prose, no markdown fences. At most ~6 short lines in summary_en, candid and scannable: who they are, their standout strength, their main gap, the result category, and whether they look worth a personal follow-up. No flattery, no hedging.`,
  build: ({ profile, scores, category }) =>
    [
      `Result category: ${category}.`,
      `Profile: ${JSON.stringify(profile.identity)} | intent: ${JSON.stringify(profile.intent)} | green: ${JSON.stringify(profile.green_economy)}`,
      `Dimension scores: ${JSON.stringify(
        Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, v.score])),
      )}`,
      '',
      'Return { "summary_en": "..." }. JSON only.',
    ].join('\n'),
  outputSchema: AdminSummarySchema,
};
