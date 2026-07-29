import { describe, expect, it } from 'vitest';
import {
  classify,
  ctaOffers,
  offersFor,
  pickCategory,
  toBand,
} from '@/lib/scoring/resultClassifier';
import { RESULT_CATEGORIES } from '@/lib/constants';
import { isArchivedOffer } from '@/lib/services';
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

  it('R3: later + climate_index ≥ 3.3 + mba_index < 3.3 → climate_career_builder', () => {
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
    expect(pickCategory(input)).toBe('climate_career_builder');
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

  it('R8 fallback: no MBA intent → climate_career_builder', () => {
    expect(pickCategory(mkInput({}, { base: 3, mba_intent: 'no' }))).toBe(
      'climate_career_builder',
    );
  });
});

describe('offer mapping — two-service catalogue (Gate 8)', () => {
  it('MBA-intent categories route to the MBA story teardown', () => {
    for (const cat of ['ready_for_mba_story_sprint', 'career_positioning_before_mba'] as const) {
      expect(offersFor(cat)).toEqual({
        primary: 'mba_story_teardown',
        secondary: 'offer_path_read',
      });
    }
  });

  it('every other category routes to the offer/path read', () => {
    for (const cat of [
      'strong_profile_weak_story',
      'climate_career_builder',
      'profile_building_needed',
      'high_potential_low_commercial_clarity',
      'interview_ready_positioning_weak',
      'cv_strong_narrative_weak',
    ] as const) {
      expect(offersFor(cat)).toEqual({
        primary: 'offer_path_read',
        secondary: 'mba_story_teardown',
      });
    }
  });

  it('never returns an archived offer for any category or timeline', () => {
    for (const cat of RESULT_CATEGORIES) {
      const { primary, secondary } = offersFor(cat);
      expect(isArchivedOffer(primary)).toBe(false);
      if (secondary) expect(isArchivedOffer(secondary)).toBe(false);
    }
  });
});

describe('current-MBA holders are job-seekers, not applicants', () => {
  it('never routes a current MBA holder to an MBA-application/MBA-later category', () => {
    const input = mkInput({}, { base: 4, mba_intent: 'current' });
    const cat = pickCategory(input);
    expect([
      'ready_for_mba_story_sprint',
      'career_positioning_before_mba',
      'climate_career_builder',
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

describe('ctaOffers — two public slots, no archived offer can reach a report', () => {
  it('recommended service first, the other public service second', () => {
    expect(
      ctaOffers({
        category: 'ready_for_mba_story_sprint',
        primary_offer: 'mba_story_teardown',
        secondary_offer: 'offer_path_read',
      }),
    ).toEqual([
      { offer: 'mba_story_teardown', role: 'primary' },
      { offer: 'offer_path_read', role: 'entry' },
    ]);
  });

  it('never more than 2, never duplicates', () => {
    const out = ctaOffers({
      category: 'cv_strong_narrative_weak',
      primary_offer: 'offer_path_read',
      secondary_offer: 'offer_path_read',
    });
    expect(out.length).toBeLessThanOrEqual(2);
    expect(new Set(out.map((o) => o.offer)).size).toBe(out.length);
  });

  /**
   * Rows written before Gate 8 still hold ids like `teardown_90`. Rendering one
   * would show a price the buyer cannot pay, so the catalogue must take over.
   */
  it('falls back to the live catalogue when a stored classification is archived', () => {
    const out = ctaOffers({
      category: 'strong_profile_weak_story',
      primary_offer: 'teardown_90',
      secondary_offer: 'cv_linkedin_review',
    });
    expect(out.map((s) => s.offer)).toEqual(['offer_path_read', 'mba_story_teardown']);
    expect(out.every((s) => !isArchivedOffer(s.offer))).toBe(true);
  });

  it('classify() end-to-end never surfaces an archived offer', () => {
    for (const seed of goldenSeeds) {
      const c = classify(seed.input);
      expect(isArchivedOffer(c.primary_offer)).toBe(false);
      for (const slot of ctaOffers(c)) expect(isArchivedOffer(slot.offer)).toBe(false);
    }
  });
});

describe('golden seeds (ROADMAP Phase 4 matrix — deterministic half)', () => {
  it.each(goldenSeeds.map((s) => [s.id, s.name, s] as const))('seed %i: %s', (_id, _name, seed) => {
    const got = classify(seed.input).category;
    const expected = Array.isArray(seed.expect) ? seed.expect : [seed.expect];
    expect(expected).toContain(got);
  });
});
