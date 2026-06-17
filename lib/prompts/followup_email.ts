import { EmailDraftSchema, type ExtractedProfile } from '@/lib/types';
import { MODELS, type ResultCategory } from '@/lib/constants';
import { LOCALE_STYLE_NOTES } from '@/content';
import type { PromptDef } from './types';

export interface FollowupEmailInput {
  locale: 'en' | 'zh-TW';
  profile: ExtractedProfile;
  category: ResultCategory;
}

/**
 * Personalizes ONLY the two variable lines that slot into the locale email
 * templates (emails.ts). The skeleton is never regenerated (PROMPT_LIBRARY rule).
 */
export const followupEmailPrompt: PromptDef<FollowupEmailInput, typeof EmailDraftSchema> = {
  id: 'followup_email',
  version: 'v1',
  model: MODELS.cheap,
  temperature: 0.5,
  maxTokens: 600,
  system: `You write two short personalized lines that will be slotted into a pre-written follow-up email template. Output JSON only — no prose, no markdown fences. Write natively in the requested locale; do not translate. Each line is at most ~2 sentences. Reference one concrete detail from the person's material. Warm, specific, never pushy. Never promise outcomes.

Return: { "personal_line": one observation specific to this person, "category_note": one line tying their result category to a sensible next step }.`,
  build: ({ locale, profile, category }) =>
    [
      `Locale: ${locale}. Style: ${LOCALE_STYLE_NOTES[locale]}`,
      `Result category: ${category}.`,
      `Profile highlights: ${JSON.stringify(profile.identity)} | ${JSON.stringify(
        profile.green_economy,
      )} | evidence: ${JSON.stringify(profile.evidence_assets.slice(0, 4))}`,
      '',
      'Return the EmailDraft JSON. JSON only.',
    ].join('\n'),
  outputSchema: EmailDraftSchema,
};
