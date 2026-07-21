import { FocusAreaSchema, type ExtractedProfile } from '@/lib/types';
import { MODELS, type ResultCategory } from '@/lib/constants';
import { LOCALE_STYLE_NOTES } from '@/content';
import type { PromptDef } from './types';

export interface OutcomeEmailInput {
  locale: 'en' | 'zh-TW';
  profile: ExtractedProfile;
  category: ResultCategory;
}

/**
 * Personalizes ONLY the one variable phrase that slots into the outcome-loop
 * (d30/d90) email templates (content/{locale}/emails.ts): the thing the report told
 * this person to fix first. Same "never regenerate the skeleton" rule as
 * followup_email.ts (PROMPT_LIBRARY.md).
 */
export const outcomeEmailPrompt: PromptDef<OutcomeEmailInput, typeof FocusAreaSchema> = {
  id: 'outcome_email',
  version: 'v1',
  model: MODELS.cheap,
  temperature: 0.4,
  maxTokens: 200,
  system: `You write one short noun-phrase (not a full sentence) naming the single thing this person's report told them to fix or build first. It will be quoted inside a template as: 最該先補的是「___」 (zh-TW) or "the one thing worth shoring up first was ___" (en). Output JSON only — no prose, no markdown fences. Write natively in the requested locale. 6-20 words. Concrete, not abstract ("量化你在 X 專案的商業成果", not "加強自我行銷"). Never promise outcomes.

Return: { "focus_area": the noun-phrase }.`,
  build: ({ locale, profile, category }) =>
    [
      `Locale: ${locale}. Style: ${LOCALE_STYLE_NOTES[locale]}`,
      `Result category: ${category}.`,
      `Profile highlights: ${JSON.stringify(profile.identity)} | ${JSON.stringify(
        profile.green_economy,
      )} | evidence: ${JSON.stringify(profile.evidence_assets.slice(0, 4))}`,
      '',
      'Return the focus_area JSON. JSON only.',
    ].join('\n'),
  outputSchema: FocusAreaSchema,
};
