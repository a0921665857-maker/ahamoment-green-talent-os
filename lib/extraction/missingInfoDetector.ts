/**
 * Deterministic question selection (PROFILE_EXTRACTION_MODEL.md) — no LLM.
 * (1) q_target_move and q_timeline whenever intent is not confidently extracted
 *     (qualification doubles as product input);
 * (2) q_mba_intent whenever mba intent is unknown;
 * (3) remaining slots filled from the lowest-confidence groups, priority order
 *     intent > commercial > green_economy > career_history for ties.
 * Ask 3 normally, 5 when overall confidence < 0.5. A question is skipped when
 * the profile already answers it.
 */
import {
  LOW_GROUP_CONFIDENCE,
  LOW_OVERALL_CONFIDENCE,
  QUESTION_COUNT,
  type QuestionId,
} from '@/lib/constants';
import type { ExtractedProfile } from '@/lib/types';

type Group = 'intent' | 'commercial' | 'green_economy' | 'career_history';

const GROUP_PRIORITY: Group[] = ['intent', 'commercial', 'green_economy', 'career_history'];

const GROUP_QUESTIONS: Record<Group, QuestionId[]> = {
  intent: ['q_target_move', 'q_timeline', 'q_mba_intent', 'q_geography'],
  commercial: ['q_commercial_ownership', 'q_quantified_result'],
  green_economy: ['q_green_focus'],
  career_history: ['q_recent_achievement'],
};

function groupConfidence(p: ExtractedProfile, g: Group): number {
  switch (g) {
    case 'intent':
      return p.confidence.intent;
    case 'commercial':
      return p.confidence.commercial;
    case 'green_economy':
      return p.confidence.green_economy;
    case 'career_history':
      return p.confidence.career_history;
  }
}

/** True when the profile already answers the question well enough to skip it. */
export function alreadyAnswered(p: ExtractedProfile, q: QuestionId): boolean {
  const intentConfident = p.confidence.intent >= LOW_GROUP_CONFIDENCE;
  switch (q) {
    case 'q_target_move':
      return Boolean(p.intent.target_move && p.intent.target_move.trim()) && intentConfident;
    case 'q_timeline':
      return p.intent.timeline !== 'unknown' && intentConfident;
    case 'q_mba_intent':
      return p.intent.mba_intent !== 'unknown';
    case 'q_geography':
      return Boolean(p.intent.geography && p.intent.geography.trim());
    case 'q_commercial_ownership':
      return p.commercial_signals.revenue_or_budget_ownership !== null;
    case 'q_quantified_result':
      return p.commercial_signals.quantified_results.length > 0;
    case 'q_green_focus':
      return (
        p.green_economy.sectors.length + p.green_economy.domains.length > 0 &&
        p.confidence.green_economy >= LOW_GROUP_CONFIDENCE
      );
    case 'q_recent_achievement':
      return (
        p.career_history.some((r) => r.achievements.length > 0) &&
        p.confidence.career_history >= LOW_GROUP_CONFIDENCE
      );
  }
}

export function selectQuestions(profile: ExtractedProfile): QuestionId[] {
  const cap =
    profile.confidence.overall < LOW_OVERALL_CONFIDENCE
      ? QUESTION_COUNT.lowConfidence
      : QUESTION_COUNT.normal;

  const picked: QuestionId[] = [];
  const push = (q: QuestionId) => {
    if (picked.length < cap && !picked.includes(q) && !alreadyAnswered(profile, q)) picked.push(q);
  };

  // (1) mandatory qualification questions when not confidently extracted
  push('q_target_move');
  push('q_timeline');
  // (2) mba intent when unknown
  push('q_mba_intent');

  // (3) fill from lowest-confidence groups (stable sort; priority breaks ties)
  const groups = [...GROUP_PRIORITY]
    .map((g, i) => ({ g, conf: groupConfidence(profile, g), prio: i }))
    .sort((a, b) => a.conf - b.conf || a.prio - b.prio);

  // The LLM's own missing_fields suggestions get first claim within each group's slot order.
  const suggested = new Set(profile.missing_fields);
  for (const { g } of groups) {
    const qs = GROUP_QUESTIONS[g];
    for (const q of qs) if (suggested.has(q)) push(q);
    for (const q of qs) push(q);
    if (picked.length >= cap) break;
  }

  return picked;
}
