import { describe, expect, it } from 'vitest';
import {
  classify,
  ctaOffers,
  offersFor,
  pickCategory,
  toBand,
} from '@/lib/scoring/resultClassifier';
import { goldenSeeds, mkInput } from './fixtures/scoreVectors';

describe('toBand boundaries (1.0–2.4 / 2.5–3.7 / 3.8–5.0)', () => {
  it.each([
    [1.0, 'emerging'],
    [2.4, 'emerging'],
    [2.5, 'developing'],
    [3.7, 'developing'],
    [3.8, 'strong'],
    [5.0, 'strong'],
  ] as const)('%f → %s', (v, band) => {
    expect(toBand(v)).toBe(band);
  });
});

describe('classifier rules R0–R8 (first match wins)', () => {
  it('R0: low overall confidence → profile_building_needed', () => {
    expect(pickCategory(mkInput({}, { overall_confidence: 0.4 }))).toBe('profile_building_needed');
  });

  it('R0: avg score below 2.0 → profile_building_needed', () => {
    expect(pickCategory(mkInput({}, { base: 1.5 }))).toBe('profile_building_needed');
  });

  it('R1: active + mba_index ≥ 3.8 + story_index ≥ 3.3 → ready_for_mba_story_sprint', () => {
    const input = mkInput(
      {
        mba_readiness: { score: 4 },
        leadership_proof: { score: 4 },
        impact_evidence: { score: 4 },
        international_positioning: { score: 4 },
        career_clarity: { score: 3.5 },
        differentiation: { score: 3.5 },
        story_risk: { score: 3.5 },
        commercial_credibility: { score: 3.5 },
      },
      { mba_intent: 'active' },
    );
    expect(pickCategory(input)).toBe('ready_for_mba_story_sprint');
  });

  it('R2: considering + mba_index ≥ 3.3 + story_index < 3.0 → career_positioning_before_mba', () => {
    const input = mkInput(
      {
        mba_readiness: { score: 3.5 },
        leadership_proof: { score: 3.5 },
        impact_evidence: { score: 3.5 },
        international_positioning: { score: 3.5 },
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 2.6 },
      },
      { mba_intent: 'considering' },
    );
    expect(pickCategory(input)).toBe('career_positioning_before_mba');
  });

  it('R3: later + climate_index ≥ 3.3 + mba_index < 3.3 → climate_career_first_mba_later', () => {
    const input = mkInput(
      {
        green_economy_fit: { score: 4 },
        climate_career_fit: { score: 4 },
        role_fit: { score: 3.5 },
        mba_readiness: { score: 2.5 },
        leadership_proof: { score: 3 },
        impact_evidence: { score: 3 },
        international_positioning: { score: 3 },
      },
      { mba_intent: 'later' },
    );
    expect(pickCategory(input)).toBe('climate_career_first_mba_later');
  });

  it('R4: cv_readiness ≥ 4 + story_index < 3.0 → cv_strong_narrative_weak', () => {
    const input = mkInput(
      {
        cv_readiness: { score: 4.5 },
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 2.6 },
      },
      { mba_intent: 'no' },
    );
    expect(pickCategory(input)).toBe('cv_strong_narrative_weak');
  });

  it('R5: interview_readiness ≥ 4 + story_index < 3.0 → interview_ready_positioning_weak', () => {
    const input = mkInput(
      {
        interview_readiness: { score: 4.5 },
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 2.6 },
      },
      { mba_intent: 'no' },
    );
    expect(pickCategory(input)).toBe('interview_ready_positioning_weak');
  });

  it('R6: avg_top5 ≥ 3.5 + commercial ≤ 2.5 → high_potential_low_commercial_clarity', () => {
    const input = mkInput(
      {
        green_economy_fit: { score: 4.5 },
        climate_career_fit: { score: 4.5 },
        impact_evidence: { score: 4.5 },
        leadership_proof: { score: 4.5 },
        international_positioning: { score: 4 },
        commercial_credibility: { score: 2 },
      },
      { mba_intent: 'no' },
    );
    expect(pickCategory(input)).toBe('high_potential_low_commercial_clarity');
  });

  it('R7: avg ≥ 3.3 + story_index < 3.0 (and R4–R6 misses) → strong_profile_weak_story', () => {
    const input = mkInput(
      {
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 3 },
      },
      { base: 3.8, mba_intent: 'no' },
    );
    expect(pickCategory(input)).toBe('strong_profile_weak_story');
  });

  it('R8 fallback: considering → career_positioning_before_mba', () => {
    expect(pickCategory(mkInput({}, { base: 3, mba_intent: 'considering' }))).toBe(
      'career_positioning_before_mba',
    );
  });

  it('R8 fallback: no MBA intent → climate_career_first_mba_later', () => {
    expect(pickCategory(mkInput({}, { base: 3, mba_intent: 'no' }))).toBe(
      'climate_career_first_mba_later',
    );
  });
});

describe('offer mapping + secondary overlays', () => {
  it('strong_profile_weak_story gains cv_linkedin_review when cv_readiness ≤ 2', () => {
    const input = mkInput(
      {
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 3 },
        cv_readiness: { score: 2 },
      },
      { base: 3.8, mba_intent: 'no' },
    );
    const cat = pickCategory(input);
    expect(cat).toBe('strong_profile_weak_story');
    expect(offersFor(cat, input.scores, input.timeline)).toEqual({
      primary: 'teardown_90',
      secondary: 'cv_linkedin_review',
    });
  });

  it('mock-pack overlay fires only with interview ≤ 2 AND timeline <6m, into an empty slot', () => {
    const base = {
      cv_readiness: { score: 4.5 },
      career_clarity: { score: 2.5 },
      differentiation: { score: 2.5 },
      story_risk: { score: 2.5 },
      commercial_credibility: { score: 2.6 },
      interview_readiness: { score: 2 },
    };
    const urgent = mkInput(base, { mba_intent: 'no', timeline: '<6m' });
    expect(offersFor('cv_strong_narrative_weak', urgent.scores, '<6m').secondary).toBe(
      'mock_interview_pack',
    );
    expect(offersFor('cv_strong_narrative_weak', urgent.scores, '6-12m').secondary).toBeNull();
  });

  it('overlay never overrides a category-specific secondary', () => {
    const input = mkInput({ interview_readiness: { score: 1.5 } }, { timeline: '<6m' });
    expect(offersFor('career_positioning_before_mba', input.scores, '<6m').secondary).toBe(
      'teardown_90',
    );
  });
});

describe('current-MBA holders are job-seekers, not applicants', () => {
  it('never routes a current MBA holder to an MBA-application/MBA-later category', () => {
    const input = mkInput({}, { base: 4, mba_intent: 'current' });
    const cat = pickCategory(input);
    expect([
      'ready_for_mba_story_sprint',
      'career_positioning_before_mba',
      'climate_career_first_mba_later',
    ]).not.toContain(cat);
  });
});

describe('lead grading', () => {
  it('A: <6m + mid+ seniority + eligible category', () => {
    const c = classify(goldenSeeds[0].input); // seed 1: <6m, senior, R1
    expect(c.lead_grade).toBe('A');
  });

  it('B: timeline ≤ 12 months without full A conditions', () => {
    const input = mkInput(
      {
        mba_readiness: { score: 3.5 },
        leadership_proof: { score: 3.5 },
        impact_evidence: { score: 3.5 },
        international_positioning: { score: 3.5 },
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 2.6 },
      },
      { mba_intent: 'considering', timeline: '6-12m', seniority: 'junior' },
    );
    expect(classify(input).lead_grade).toBe('B');
  });

  it('B: strong scores with vague timeline', () => {
    const input = mkInput({}, { base: 4, mba_intent: 'no', timeline: 'unknown', seniority: 'junior' });
    expect(classify(input).lead_grade).toBe('B');
  });

  it('C: weak scores, distant timeline', () => {
    const input = mkInput({}, { base: 2.5, mba_intent: 'no', timeline: '12m+', seniority: 'junior' });
    expect(classify(input).lead_grade).toBe('C');
  });
});

describe('ctaOffers — exactly the binding 3-slot rule', () => {
  it('no category secondary → entry leads with the cheapest yes (deep_read)', () => {
    expect(
      ctaOffers({ category: 'ready_for_mba_story_sprint', primary_offer: 'mba_story_sprint', secondary_offer: null }),
    ).toEqual([
      { offer: 'mba_story_sprint', role: 'primary' },
      { offer: 'deep_read', role: 'entry' },
      { offer: 'full_package', role: 'anchor' },
    ]);
  });

  it('category secondary takes precedence in the entry slot', () => {
    expect(
      ctaOffers({
        category: 'interview_ready_positioning_weak',
        primary_offer: 'teardown_90',
        secondary_offer: 'mock_interview_pack',
      }),
    ).toEqual([
      { offer: 'teardown_90', role: 'primary' },
      { offer: 'mock_interview_pack', role: 'entry' },
      { offer: 'full_package', role: 'anchor' },
    ]);
  });

  it('teardown primary with no secondary → deep_read entry, anchor last', () => {
    expect(
      ctaOffers({ category: 'cv_strong_narrative_weak', primary_offer: 'teardown_90', secondary_offer: null }),
    ).toEqual([
      { offer: 'teardown_90', role: 'primary' },
      { offer: 'deep_read', role: 'entry' },
      { offer: 'full_package', role: 'anchor' },
    ]);
  });

  it('never more than 3, never duplicates', () => {
    const out = ctaOffers({
      category: 'career_positioning_before_mba',
      primary_offer: 'climate_positioning_sprint',
      secondary_offer: 'teardown_90',
    });
    expect(out.length).toBeLessThanOrEqual(3);
    expect(new Set(out.map((o) => o.offer)).size).toBe(out.length);
    expect(out[out.length - 1].offer).toBe('full_package');
  });
});

describe('golden seeds (ROADMAP Phase 4 matrix — deterministic half)', () => {
  it.each(goldenSeeds.map((s) => [s.id, s.name, s] as const))('seed %i: %s', (_id, _name, seed) => {
    const got = classify(seed.input).category;
    const expected = Array.isArray(seed.expect) ? seed.expect : [seed.expect];
    expect(expected).toContain(got);
  });
});
