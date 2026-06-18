import { ExtractedProfileSchema } from '@/lib/types';
import { MODELS, QUESTION_IDS, type InputType } from '@/lib/constants';
import { slugListsForPrompt } from '@/lib/taxonomy';
import type { PromptDef } from './types';

export interface ExtractionInput {
  inputType: InputType;
  /** Raw text for paste/transcript inputs. Omit when a PDF is sent as a document block. */
  rawText?: string;
  locale: 'en' | 'zh-TW';
}

const system = `You extract a structured career profile from one person's materials for a green-economy career diagnostic. You output JSON only — no prose, no markdown fences.

Hard rules:
1. NEVER invent facts. If something is absent, omit it or use null, lower that group's confidence, and add the relevant question-bank ID to missing_fields. A hallucinated fact shown back to the user destroys trust permanently.
2. PII minimization: never copy phone numbers, street addresses, or personal email addresses into the profile.
3. evidence_assets are near-verbatim excerpts of at most 25 words each, every one tagged with a theme. Aim for 5–10. Never quote filler or disfluencies.
4. Map green-economy experience to the provided taxonomy SLUGS only. Terms you cannot map go into green_economy.free_text — never drop them.
5. Give an honest 0–1 confidence per group and overall. Confidence reflects how strongly the MATERIAL supports each field, not how plausible it sounds.
5b. intent.mba_intent — distinguish APPLYING from ALREADY HAVING one. If the person is currently enrolled in an MBA, is an MBA candidate/student, or already holds an MBA degree, set mba_intent to 'current' (they are a job-seeker, NOT an applicant). Only use 'active' for someone actively applying TO an MBA they do not yet have. 'considering'/'later' = thinking about applying; 'no' = no MBA interest and none held.
6. missing_fields may only contain these question-bank IDs: ${QUESTION_IDS.join(', ')}.

Input-type guidance:
- cv_pdf: strongest for history and achievements; ignore header contact details.
- linkedin_paste: watch for duplicated headlines and truncated "…see more".
- notes_paste: richest for intent and story signals. If the text is a conversation with an AI assistant, extract the PERSON's situation and words, never the assistant's advice.
- voice_transcript: good for motivation and self-narrative; do not quote filler ("um", "you know") into evidence_assets.

Output must conform exactly to the ExtractedProfile schema you are given by the caller.`;

export const profileExtractionPrompt: PromptDef<ExtractionInput, typeof ExtractedProfileSchema> = {
  id: 'profile_extraction',
  version: 'v1',
  model: MODELS.cheap, // Haiku — extraction is structured (tool-use schema-enforced); cuts COGS
  temperature: 0.2,
  maxTokens: 4096,
  system,
  build: (input) =>
    [
      `Input type: ${input.inputType}.`,
      `Report locale: ${input.locale} (extraction language-agnostic; preserve original-language quotes in evidence_assets).`,
      '',
      'Taxonomy slugs (use these exact slugs; unmapped → free_text):',
      slugListsForPrompt(),
      '',
      input.rawText
        ? `Person's material:\n"""\n${input.rawText}\n"""`
        : "The person's material is the attached PDF document.",
      '',
      'Return one ExtractedProfile JSON object. JSON only.',
    ].join('\n'),
  outputSchema: ExtractedProfileSchema,
};
