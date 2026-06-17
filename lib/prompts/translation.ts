import { TranslationSchema } from '@/lib/types';
import { MODELS, type Locale } from '@/lib/constants';
import type { PromptDef } from './types';

export interface TranslationInput {
  text: string;
  target: Locale;
}

/** Ad-hoc admin translation only — never used in the user-facing native generation path. */
export const translationPrompt: PromptDef<TranslationInput, typeof TranslationSchema> = {
  id: 'translation',
  version: 'v1',
  model: MODELS.cheap,
  temperature: 0.2,
  maxTokens: 2000,
  system: `You translate text faithfully for internal admin use. Output JSON only — no prose, no markdown fences. Preserve meaning and tone; for Traditional Chinese use full-width punctuation and half-width spaces around Latin/numbers. Return { "text": "..." }.`,
  build: ({ text, target }) =>
    `Target locale: ${target}.\nText:\n"""\n${text}\n"""\nReturn { "text": "..." }. JSON only.`,
  outputSchema: TranslationSchema,
};
