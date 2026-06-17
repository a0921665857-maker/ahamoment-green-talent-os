import { describe, expect, it } from 'vitest';
import { alreadyAnswered, selectQuestions } from '@/lib/extraction/missingInfoDetector';
import { mkProfile } from './fixtures/scoreVectors';

describe('selectQuestions — mandatory qualification first', () => {
  it('asks target_move, timeline, mba_intent when intent is unreadable (cap 3)', () => {
    const p = mkProfile(); // intent unknown, confidence.intent 0.4, overall 0.7
    expect(selectQuestions(p)).toEqual(['q_target_move', 'q_timeline', 'q_mba_intent']);
  });

  it('skips mandatory questions the profile already answers confidently', () => {
    const p = mkProfile({
      intent: { mba_intent: 'active', target_move: 'carbon markets BD', timeline: '<6m', geography: 'SG' },
      confidence: { intent: 0.9 },
    });
    const qs = selectQuestions(p);
    expect(qs).not.toContain('q_target_move');
    expect(qs).not.toContain('q_timeline');
    expect(qs).not.toContain('q_mba_intent');
    // commercial is now the lowest unanswered group
    expect(qs).toEqual(['q_commercial_ownership', 'q_quantified_result']);
  });
});

describe('selectQuestions — caps', () => {
  it('caps at 5 when overall confidence < 0.5, filling by lowest-confidence group', () => {
    const p = mkProfile({
      confidence: { overall: 0.3, intent: 0.2, commercial: 0.3, green_economy: 0.45, career_history: 0.45 },
    });
    const qs = selectQuestions(p);
    expect(qs).toHaveLength(5);
    expect(qs.slice(0, 3)).toEqual(['q_target_move', 'q_timeline', 'q_mba_intent']);
    // intent (0.2) is the lowest group → its remaining question comes next
    expect(qs[3]).toBe('q_geography');
    expect(qs[4]).toBe('q_commercial_ownership');
  });

  it('returns fewer than the cap when nothing else is genuinely missing', () => {
    const p = mkProfile({
      intent: { mba_intent: 'no', target_move: 'stay in CS', timeline: '12m+', geography: 'APAC' },
      confidence: { intent: 0.9, commercial: 0.9, green_economy: 0.9, career_history: 0.9 },
      commercial_signals: { revenue_or_budget_ownership: true, quantified_results: ['US$1.2m renewals'] },
    });
    expect(selectQuestions(p)).toEqual([]);
  });
});

describe('selectQuestions — LLM missing_fields suggestions', () => {
  it('suggested questions get first claim within their group', () => {
    const p = mkProfile({
      intent: { mba_intent: 'later', target_move: 'in-house sustainability', timeline: '6-12m', geography: 'TW' },
      confidence: { intent: 0.9, commercial: 0.3 },
      missing_fields: ['q_quantified_result'],
    });
    const qs = selectQuestions(p);
    expect(qs[0]).toBe('q_quantified_result');
    expect(qs[1]).toBe('q_commercial_ownership');
  });
});

describe('alreadyAnswered predicates', () => {
  it('green focus counts as answered only with taxonomy hits AND group confidence', () => {
    const confident = mkProfile();
    expect(alreadyAnswered(confident, 'q_green_focus')).toBe(true);
    const vague = mkProfile({ confidence: { green_economy: 0.3 } });
    expect(alreadyAnswered(vague, 'q_green_focus')).toBe(false);
    const empty = mkProfile({ green_economy: { sectors: [], domains: [] } });
    expect(alreadyAnswered(empty, 'q_green_focus')).toBe(false);
  });

  it('commercial ownership answered only when the boolean is non-null', () => {
    expect(alreadyAnswered(mkProfile(), 'q_commercial_ownership')).toBe(false);
    expect(
      alreadyAnswered(
        mkProfile({ commercial_signals: { revenue_or_budget_ownership: false } }),
        'q_commercial_ownership',
      ),
    ).toBe(true);
  });
});
