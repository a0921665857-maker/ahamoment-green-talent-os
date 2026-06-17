import {
  MemoDraftSchema,
  type Answer,
  type DimensionScores,
  type ExtractedProfile,
} from '@/lib/types';
import { MODELS, type ResultCategory } from '@/lib/constants';
import type { PromptDef } from './types';

export interface TeardownMemoInput {
  profile: ExtractedProfile;
  scores: DimensionScores;
  answers: Answer[];
  category: ResultCategory;
}

/** Drafted FOR Michael ahead of a paid call — candid, may include what the free report withheld. English. */
export const teardownMemoPrompt: PromptDef<TeardownMemoInput, typeof MemoDraftSchema> = {
  id: 'teardown_memo',
  version: 'v1',
  model: MODELS.quality,
  temperature: 0.4,
  maxTokens: 2000,
  system: `You draft a candid private prep memo for the founder (a senior ESG/MBA coach) before a paid teardown call with a client. Output JSON only — no prose, no markdown fences. This is internal: be direct, include the honest read the free report deliberately held back, and make it immediately useful in a live session. Never fabricate facts about the client. Never promise outcomes.

Return: { "read": one-paragraph candid assessment, "gaps": the real gaps to probe, "angle": the positioning angle most likely to work, "talking_points": [3–6 specific points], "questions_to_ask": [3–6 sharp questions for the call] }.`,
  build: ({ profile, scores, answers, category }) =>
    [
      `Result category: ${category}.`,
      `Profile: ${JSON.stringify(profile)}`,
      `Scores (with evidence): ${JSON.stringify(scores)}`,
      answers.length ? `Answers: ${JSON.stringify(answers)}` : 'No follow-up answers.',
      '',
      'Return the MemoDraft JSON. JSON only.',
    ].join('\n'),
  outputSchema: MemoDraftSchema,
};
