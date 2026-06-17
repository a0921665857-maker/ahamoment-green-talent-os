/**
 * Fixture builders + golden score vectors for the 8 ROADMAP seed profiles.
 * The golden vectors are the deterministic half of the Phase 4 matrix: they
 * encode what the scoring LLM is EXPECTED to return for each seed, so the
 * classifier's verdicts stay pinned while prompts/weights evolve.
 */
import { DIMENSIONS, type Dimension, type ResultCategory } from '@/lib/constants';
import type { DimensionScores, ExtractedProfile } from '@/lib/types';
import type { ClassifierInput } from '@/lib/scoring/resultClassifier';
import { computeWeightedSummary } from '@/lib/scoring/resultClassifier';

type ScoreOverride = Partial<Record<Dimension, { score: number; confidence?: number }>>;

export function mkScores(overrides: ScoreOverride = {}, base = 3, conf = 0.8): DimensionScores {
  const out = {} as DimensionScores;
  for (const d of DIMENSIONS) {
    const o = overrides[d];
    out[d] = {
      score: o?.score ?? base,
      confidence: o?.confidence ?? conf,
      evidence: 'fixture evidence',
    };
  }
  return out;
}

export function mkInput(
  overrides: ScoreOverride,
  opts: Partial<Omit<ClassifierInput, 'scores' | 'summary'>> & { base?: number; conf?: number } = {},
): ClassifierInput {
  const scores = mkScores(overrides, opts.base ?? 3, opts.conf ?? 0.8);
  return {
    scores,
    summary: computeWeightedSummary(scores),
    mba_intent: opts.mba_intent ?? 'unknown',
    timeline: opts.timeline ?? 'unknown',
    overall_confidence: opts.overall_confidence ?? 0.8,
    seniority: opts.seniority ?? 'mid',
    degraded: opts.degraded,
  };
}

export function mkProfile(overrides: DeepPartial<ExtractedProfile> = {}): ExtractedProfile {
  const base: ExtractedProfile = {
    identity: {
      current_role: 'Sustainability Consultant',
      current_org: 'Acme Advisory',
      years_experience: 6,
      location: 'Singapore',
      languages: ['English'],
      seniority: 'mid',
    },
    career_history: [
      {
        org: 'Acme Advisory',
        role: 'Consultant',
        start: '2020',
        end: null,
        scope: 'APAC clients',
        achievements: ['Led SBTi target setting for 8 clients'],
      },
    ],
    education: [{ school: 'NUS', program: 'BBA', year: '2018' }],
    green_economy: {
      sectors: ['esg-advisory'],
      functions: ['consulting'],
      domains: ['sbti'],
      free_text: [],
      depth: 'core',
    },
    credentials: [],
    evidence_assets: [
      { quote: 'Led SBTi target setting for 8 clients', source_hint: 'CV, Acme role', theme: 'impact' },
    ],
    commercial_signals: {
      revenue_or_budget_ownership: null,
      client_facing: true,
      quantified_results: [],
    },
    intent: { mba_intent: 'unknown', target_move: null, timeline: 'unknown', geography: null },
    story_signals: { differentiators: [], risks: [] },
    confidence: {
      identity: 0.9,
      career_history: 0.8,
      green_economy: 0.8,
      commercial: 0.6,
      intent: 0.4,
      overall: 0.7,
    },
    missing_fields: [],
  };
  return deepMerge(base, overrides);
}

/* ----------------------- golden seeds (ROADMAP Phase 4) ---------------------- */

export interface GoldenSeed {
  id: number;
  name: string;
  input: ClassifierInput;
  expect: ResultCategory | ResultCategory[];
}

export const goldenSeeds: GoldenSeed[] = [
  {
    id: 1,
    name: 'EN CV, strong carbon-markets profile, MBA-ready',
    input: mkInput(
      {
        mba_readiness: { score: 4.5 },
        leadership_proof: { score: 4 },
        impact_evidence: { score: 4 },
        international_positioning: { score: 4 },
        career_clarity: { score: 4 },
        differentiation: { score: 4 },
        story_risk: { score: 3.5 },
        commercial_credibility: { score: 4 },
        green_economy_fit: { score: 5 },
      },
      { base: 3.5, mba_intent: 'active', timeline: '<6m', seniority: 'senior' },
    ),
    expect: 'ready_for_mba_story_sprint',
  },
  {
    id: 2,
    name: 'zh-TW CV, Big-4 ESG consultant, vague goals',
    input: mkInput(
      {
        mba_readiness: { score: 3.5 },
        leadership_proof: { score: 3.5 },
        impact_evidence: { score: 3.5 },
        career_clarity: { score: 2 },
        differentiation: { score: 2.5 },
        story_risk: { score: 3 },
        commercial_credibility: { score: 3 },
      },
      { base: 3, mba_intent: 'considering', timeline: '6-12m' },
    ),
    expect: 'career_positioning_before_mba',
  },
  {
    id: 3,
    name: 'LinkedIn paste, climate-tech CS, no MBA intent',
    input: mkInput(
      {
        green_economy_fit: { score: 4 },
        climate_career_fit: { score: 4 },
        role_fit: { score: 3.5 },
        mba_readiness: { score: 2.5 },
      },
      { base: 3, mba_intent: 'later', timeline: '12m+' },
    ),
    expect: 'climate_career_first_mba_later',
  },
  {
    id: 4,
    name: 'AI-chat paste, direction-confused sustainability analyst',
    input: mkInput(
      {
        green_economy_fit: { score: 4 },
        climate_career_fit: { score: 3.5 },
        role_fit: { score: 3 },
        career_clarity: { score: 1.5 },
        mba_readiness: { score: 2.5 },
        commercial_credibility: { score: 2 },
        impact_evidence: { score: 4 },
        leadership_proof: { score: 3.5 },
        differentiation: { score: 3.5 },
      },
      { base: 3, mba_intent: 'considering', timeline: 'unknown' },
    ),
    expect: ['climate_career_first_mba_later', 'high_potential_low_commercial_clarity'],
  },
  {
    id: 5,
    name: 'Weak/incomplete 200-word note',
    input: mkInput({}, { base: 1.8, conf: 0.5, overall_confidence: 0.35 }),
    expect: 'profile_building_needed',
  },
  {
    id: 6,
    name: 'Strong profile, rambling narrative',
    input: mkInput(
      {
        career_clarity: { score: 2.5 },
        differentiation: { score: 3 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 3 },
        cv_readiness: { score: 3 },
        interview_readiness: { score: 3 },
        mba_readiness: { score: 3, confidence: 0.5 },
      },
      { base: 4, mba_intent: 'no', timeline: '6-12m' },
    ),
    expect: 'strong_profile_weak_story',
  },
  {
    id: 7,
    name: 'Polished CV, no through-line',
    input: mkInput(
      {
        cv_readiness: { score: 4.5 },
        career_clarity: { score: 2.5 },
        differentiation: { score: 2.5 },
        story_risk: { score: 2.5 },
        commercial_credibility: { score: 3 },
        mba_readiness: { score: 2.5 },
        green_economy_fit: { score: 3 },
        climate_career_fit: { score: 3 },
      },
      { base: 3, mba_intent: 'no', timeline: '6-12m' },
    ),
    expect: 'cv_strong_narrative_weak',
  },
  {
    id: 8,
    name: 'zh-TW voice transcript, senior, commercial blind spot',
    input: mkInput(
      {
        green_economy_fit: { score: 4.5 },
        climate_career_fit: { score: 4 },
        impact_evidence: { score: 4 },
        leadership_proof: { score: 4.5 },
        international_positioning: { score: 4 },
        commercial_credibility: { score: 2 },
        career_clarity: { score: 3.5 },
        differentiation: { score: 4 },
        story_risk: { score: 3.5 },
        mba_readiness: { score: 3, confidence: 0.35 },
        role_fit: { score: 3.5 },
      },
      { base: 3.5, mba_intent: 'no', timeline: '6-12m', seniority: 'senior' },
    ),
    expect: 'high_potential_low_commercial_clarity',
  },
];

/* ----------------------------------- utils ----------------------------------- */

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function deepMerge<T>(base: T, patch: DeepPartial<T>): T {
  if (patch === undefined) return base;
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return (patch as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
    const cur = (base as Record<string, unknown>)[k];
    out[k] =
      v !== null && typeof v === 'object' && !Array.isArray(v) && cur !== null && typeof cur === 'object' && !Array.isArray(cur)
        ? deepMerge(cur, v as DeepPartial<unknown>)
        : v;
  }
  return out as T;
}
