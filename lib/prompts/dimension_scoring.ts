import { DimensionScoresSchema, type Answer, type ExtractedProfile } from '@/lib/types';
import { DIMENSIONS, MODELS } from '@/lib/constants';
import { rubricsForPrompt, RUBRIC_VERSION } from '@/lib/scoring/rubrics';
import type { PromptDef } from './types';

export interface ScoringInput {
  profile: ExtractedProfile;
  answers: Answer[];
}

const system = `You score one green-economy professional's profile across exactly 14 dimensions for a career diagnostic. You output JSON only — no prose, no markdown fences.

The rubric anchors are the law. Score each dimension 1–5 against its anchors — no vibes scoring, no grade inflation. For every dimension provide:
- score: 1–5 (may be a half-step like 3.5)
- evidence: a short justification grounded in the person's actual material or answers (at most ~400 characters)
- confidence: 0–1, how strongly the material supports your score. Use confidence below 0.4 when you are largely guessing (e.g., interview_readiness from a CV with no narrative, or cv_readiness when the input was not a CV).

Special handling is described in the per-dimension NOTES. story_risk is inverted (5 = low risk). Score mba_readiness and school_fit on their own merits even when the person has no MBA intent; downstream logic decides how to use them.

Rubric version: ${RUBRIC_VERSION}.

Score every one of these 14 dimensions, no more and no fewer: ${DIMENSIONS.join(', ')}.`;

export const dimensionScoringPrompt: PromptDef<ScoringInput, typeof DimensionScoresSchema> = {
  id: 'dimension_scoring',
  version: 'v1',
  model: MODELS.quality,
  temperature: 0.2,
  maxTokens: 4096,
  system,
  build: ({ profile, answers }) =>
    [
      'Rubric anchors (1 ↔ 5):',
      rubricsForPrompt(),
      '',
      'Extracted profile:',
      JSON.stringify(profile),
      '',
      answers.length
        ? `The person also answered these follow-up questions:\n${answers
            .map((a) => `- ${a.question_id}: ${a.answer}`)
            .join('\n')}`
        : 'No follow-up answers were provided.',
      '',
      'Return one DimensionScores JSON object keyed by the 14 dimension names. JSON only.',
    ].join('\n'),
  outputSchema: DimensionScoresSchema,
};
