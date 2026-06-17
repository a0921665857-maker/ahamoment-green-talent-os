/**
 * Rubric anchors v0.1 (SCORING_MODEL.md). These are the product IP — Michael
 * refines wording over time. Bump RUBRIC_VERSION on any change and rerun
 * golden tests (LOW_TOKEN_UPDATE_GUIDE.md).
 */
import type { Dimension } from '@/lib/constants';

export const RUBRIC_VERSION = '0.1';

export interface RubricAnchor {
  /** What a 1 looks like. */
  low: string;
  /** What a 5 looks like. */
  high: string;
  /** Note for the scoring model, where a dimension needs special handling. */
  note?: string;
}

export const rubrics: Record<Dimension, RubricAnchor> = {
  career_clarity: {
    low: 'Cannot state what they want next; goals are absent, generic, or contradictory.',
    high: 'Can state target role, sector, and timeline in one internally consistent sentence.',
  },
  green_economy_fit: {
    low: 'Aspiring only — interest expressed, no green-economy exposure in the record.',
    high: 'Core operator in a taxonomy sector with named domain work (e.g., SBTi, CBAM, VCM engagements).',
  },
  mba_readiness: {
    low: 'Under 2 years of experience, no leadership or impact evidence, vague reasons for wanting an MBA.',
    high: '4–8 years with clear progression, a credible why-now, and a profile an admissions committee can place.',
    note: 'If mba_intent is "no", score the underlying readiness anyway; the classifier decides relevance.',
  },
  climate_career_fit: {
    low: 'Interest in climate only; no demonstrated transferable skills toward it.',
    high: 'Demonstrated transferable skills plus a realistic, named target lane in climate.',
  },
  leadership_proof: {
    low: 'No evidence of leading anything — people, projects, or initiatives.',
    high: 'Led teams or initiatives with stated scope and named outcomes.',
  },
  impact_evidence: {
    low: 'Activity described with no outcomes attached.',
    high: 'Quantified outcomes (tCO2e, currency, %, scale) credibly attributable to them.',
  },
  commercial_credibility: {
    low: 'Impact framed purely as compliance or virtue; no commercial vocabulary.',
    high: 'Speaks in revenue, cost, risk, and client terms; has owned a number.',
  },
  differentiation: {
    low: 'Interchangeable with any ESG consultant CV in the same market.',
    high: 'A combination (sector × geography × skill) few others have, with evidence for each element.',
  },
  role_fit: {
    low: 'Target role is mismatched to the evidence presented.',
    high: 'Evidence maps cleanly onto the stated target role\u2019s hiring bar.',
    note: 'If no target is stated, score against the most plausible adjacent role and lower confidence.',
  },
  school_fit: {
    low: 'No realistic school logic for the stated profile and goals.',
    high: 'Target program matches profile strength and goal logic.',
    note: 'Only meaningful when mba_intent ≠ "no"; if "no" or no schools mentioned, score 3 with confidence ≤ 0.3.',
  },
  international_positioning: {
    low: 'Experience reads local-only; nothing suggests it travels.',
    high: 'Cross-border work, clients, or markets; the profile travels well to global employers.',
  },
  story_risk: {
    low: 'Gaps, jumps, or contradictions left unexplained.',
    high: 'Trajectory coheres; every transition has a stated reason.',
    note: 'Inverted dimension: 5 means LOW risk.',
  },
  interview_readiness: {
    low: 'Could not narrate their own CV; stories absent or shapeless.',
    high: 'Crisp, STAR-able stories clearly available on demand.',
    note: 'From written material this is an inference; keep confidence honest (often < 0.6).',
  },
  cv_readiness: {
    low: 'Walls of duties, no structure, no numbers.',
    high: 'Achievement-led, quantified, scannable, right length.',
    note: 'Only scorable with confidence when the input is an actual CV or detailed LinkedIn; otherwise confidence < 0.4.',
  },
};

/** Rubric block injected into the scoring prompt. */
export function rubricsForPrompt(): string {
  return (Object.entries(rubrics) as [Dimension, RubricAnchor][])
    .map(([dim, a]) => `- ${dim}: 1 = ${a.low} | 5 = ${a.high}${a.note ? ` | NOTE: ${a.note}` : ''}`)
    .join('\n');
}
