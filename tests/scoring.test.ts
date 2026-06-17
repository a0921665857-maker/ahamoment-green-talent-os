import { describe, expect, it } from 'vitest';
import { indexWeights, MIN_DIMENSION_CONFIDENCE } from '@/lib/scoring/scoreWeights';
import {
  computeBands,
  computeIndex,
  computeWeightedSummary,
} from '@/lib/scoring/resultClassifier';
import { mkScores } from './fixtures/scoreVectors';

describe('scoreWeights config invariants', () => {
  it.each(Object.entries(indexWeights))('%s weights sum to 1', (_name, weights) => {
    const sum = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);
    expect(sum).toBeCloseTo(1, 10);
  });
});

describe('computeIndex', () => {
  it('is the plain weighted mean when all components are confident', () => {
    const scores = mkScores({
      career_clarity: { score: 4 },
      differentiation: { score: 3 },
      story_risk: { score: 2 },
      commercial_credibility: { score: 5 },
    });
    // .3*4 + .25*3 + .25*2 + .2*5 = 1.2 + .75 + .5 + 1 = 3.45
    expect(computeIndex(scores, indexWeights.story_index)).toBeCloseTo(3.45, 2);
  });

  it('excludes low-confidence dimensions and renormalizes the rest', () => {
    const scores = mkScores({
      career_clarity: { score: 5, confidence: 0.2 }, // excluded
      differentiation: { score: 3 },
      story_risk: { score: 3 },
      commercial_credibility: { score: 3 },
    });
    // remaining weights .25/.25/.2 renormalized; all scores 3 → exactly 3
    expect(computeIndex(scores, indexWeights.story_index)).toBeCloseTo(3, 2);
    expect(MIN_DIMENSION_CONFIDENCE).toBeGreaterThan(0.2);
  });

  it('falls back to the unweighted mean when every component is low-confidence', () => {
    const scores = mkScores(
      {
        career_clarity: { score: 2, confidence: 0.1 },
        differentiation: { score: 4, confidence: 0.1 },
        story_risk: { score: 2, confidence: 0.1 },
        commercial_credibility: { score: 4, confidence: 0.1 },
      },
    );
    expect(computeIndex(scores, indexWeights.story_index)).toBeCloseTo(3, 2);
  });
});

describe('computeWeightedSummary', () => {
  it('avg excludes low-confidence dims; avg_top5 takes the best five', () => {
    const scores = mkScores({
      green_economy_fit: { score: 5 },
      climate_career_fit: { score: 5 },
      impact_evidence: { score: 5 },
      leadership_proof: { score: 5 },
      international_positioning: { score: 5 },
      cv_readiness: { score: 1, confidence: 0.1 }, // excluded from avg
    });
    const s = computeWeightedSummary(scores);
    expect(s.avg_top5).toBeCloseTo(5, 2);
    // 13 confident dims: 5×5 + 8×3 = 49 → 3.77
    expect(s.avg_score).toBeCloseTo(49 / 13, 2);
  });
});

describe('computeBands', () => {
  it('limited-data mode nulls interview and cv bands only', () => {
    const scores = mkScores({ interview_readiness: { score: 4.5 }, cv_readiness: { score: 4.5 } });
    const summary = computeWeightedSummary(scores);
    const bands = computeBands(scores, summary, true);
    expect(bands.interview_readiness).toBeNull();
    expect(bands.cv_readiness).toBeNull();
    expect(bands.green_economy_fit).toBe('developing');
  });

  it('low-confidence interview/cv read as "not enough signal" (null) even outside limited-data mode', () => {
    const scores = mkScores({ interview_readiness: { score: 4.5, confidence: 0.2 } });
    const bands = computeBands(scores, computeWeightedSummary(scores), false);
    expect(bands.interview_readiness).toBeNull();
    expect(bands.cv_readiness).toBe('developing');
  });
});
