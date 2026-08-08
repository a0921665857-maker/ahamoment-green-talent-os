import type { Band } from '@/lib/constants';
import raw from '@/content/judgment/data.json';

/**
 * 綠領判斷力 — the competency graph, its explainers and its judgement reps.
 *
 * The JSON is authored elsewhere (research pipeline) and is treated as read-only
 * data here. `resolveJsonModule` gives us a structurally inferred type that is
 * both enormous and too loose in the places that matter (`verdict` widens to
 * `string`), so we assert once, here, against hand-written interfaces and let
 * every consumer read a real type.
 *
 * The data itself is zh-TW: 26 competencies, 26 explainers, 12 reps. Per
 * UX_PRINCIPLES rule 10 it is never machine-translated — the `en` route renders
 * English chrome around Chinese content and says so out loud.
 */

export interface JudgmentJobFamily {
  id: string;
  name_zh: string;
  name_en?: string;
  what_you_do: string;
  typical_titles_zh?: string[];
  core_competencies: string[];
}

export interface JudgmentLevel {
  level: number;
  can_do: string;
  evidence: string;
}

export interface JudgmentSource {
  title: string;
  url: string;
  as_of?: string;
}

export interface JudgmentCompetency {
  id: string;
  name_zh: string;
  name_en?: string;
  family: string;
  one_liner: string;
  why_it_pays: string;
  prerequisites: string[];
  finance_bridge: boolean;
  cv_signals?: { strong: string[]; weak: string[]; anti: string[] };
  levels: JudgmentLevel[];
  time_to_level_1?: string;
  sources: JudgmentSource[];
  reps?: string[];
  volatile?: boolean;
  as_of?: string;
}

export type Confidence = 'high' | 'medium' | 'low';

export interface JudgmentDomain {
  domain_slug: string;
  label_zh: string;
  competencies: { id: string; confidence: Confidence }[];
  note?: string;
}

export interface JudgmentFunctionSignal {
  function_slug: string;
  label_zh: string;
  grants?: string[];
  gap_hint?: string[];
  confidence?: Confidence;
  note?: string;
}

export interface JudgmentExplainer {
  meta: { id: string; title: string; as_of?: string };
  sections: { h: string; body: string }[];
}

export type Verdict = 'best' | 'defensible' | 'wrong';

export interface JudgmentOption {
  key: string;
  text: string;
  verdict: Verdict;
  why: string;
  why_tempting: string | null;
}

export interface JudgmentRep {
  id: string;
  competencies: string[];
  minutes?: number;
  scenario: string;
  question: string;
  options: JudgmentOption[];
  reasoning: string;
  takeaway: string;
  common_failure?: string;
  sources?: JudgmentSource[];
}

export interface JudgmentData {
  graph: {
    version?: string;
    as_of?: string;
    job_families: JudgmentJobFamily[];
    competencies: JudgmentCompetency[];
  };
  map: {
    domain_to_competencies: JudgmentDomain[];
    function_signals: JudgmentFunctionSignal[];
    unmapped_competencies?: { note?: string; ids: string[]; observation?: string };
  };
  explainers: Record<string, JudgmentExplainer | undefined>;
  reps: JudgmentRep[];
  identity: { name?: string; line?: string; email?: string; url?: string };
  counts: { competencies: number; explainers: number; reps: number };
}

export const judgmentData = raw as unknown as JudgmentData;

/** Stable values — labels live in `content/{locale}/judgment.ts`, never here. */
export const BACKGROUND_KEYS = ['eng', 'csr', 'fin', 'other'] as const;
export type BackgroundKey = (typeof BACKGROUND_KEYS)[number];

/** Which `map.function_signals` row a background unlocks (null = no signal). */
export const FUNCTION_OF_BACKGROUND: Record<BackgroundKey, string | null> = {
  eng: 'engineering-technical',
  csr: null,
  fin: 'finance-investment',
  other: null,
};

export function isBackgroundKey(v: string): v is BackgroundKey {
  return (BACKGROUND_KEYS as readonly string[]).includes(v);
}

export function competency(id: string): JudgmentCompetency | undefined {
  return judgmentData.graph.competencies.find((c) => c.id === id);
}

/**
 * When a drill's underlying regulations were last checked.
 *
 * The OLDEST source date, not the newest: a drill is only as current as its
 * weakest citation, and quoting the newest would let one freshly re-checked link
 * vouch for five that were not. Returns null when nothing carries a date, and
 * the caller then shows no claim at all rather than an invented one.
 */
export function repAsOf(rep: JudgmentRep): string | null {
  const dates = (rep.sources ?? [])
    .map((s) => s.as_of)
    .filter((d): d is string => Boolean(d))
    .sort();
  return dates[0] ?? null;
}

export function familyName(id: string): string {
  return judgmentData.graph.job_families.find((f) => f.id === id)?.name_zh ?? id;
}

export interface Assessment {
  /** competency id → the topic that evidences it (high confidence). */
  have: Map<string, string>;
  /** competency id → the topic that hints at it (medium/low confidence). */
  maybe: Map<string, string>;
  gaps: string[];
}

/**
 * Turn "topics this person has actually done" into "competencies they probably
 * have, might have, or clearly lack". The confidence grading is the whole point:
 * a résumé keyword is evidence of the easiest competency behind it, not of all
 * of them, so `low` signals are surfaced with an explicit weak-signal marker.
 */
export function assess(
  background: BackgroundKey | null,
  domains: Set<string>,
  weakSignalNote: string,
  backgroundBasis: (label: string) => string,
): Assessment {
  const have = new Map<string, string>();
  const maybe = new Map<string, string>();

  for (const d of judgmentData.map.domain_to_competencies) {
    if (!domains.has(d.domain_slug)) continue;
    for (const c of d.competencies) {
      if (c.confidence === 'high') have.set(c.id, d.label_zh);
      else if (!have.has(c.id)) {
        maybe.set(c.id, c.confidence === 'low' ? `${d.label_zh}${weakSignalNote}` : d.label_zh);
      }
    }
  }

  const fn = background ? FUNCTION_OF_BACKGROUND[background] : null;
  if (fn) {
    for (const f of judgmentData.map.function_signals) {
      if (f.function_slug !== fn) continue;
      for (const id of f.grants ?? []) {
        if (!have.has(id)) maybe.set(id, backgroundBasis(f.label_zh));
      }
    }
  }

  const gaps = judgmentData.graph.competencies
    .filter((c) => !have.has(c.id) && !maybe.has(c.id))
    .map((c) => c.id);

  return { have, maybe, gaps };
}

/**
 * Order gaps so nobody is sent at something whose prerequisite they lack, and so
 * the finance-bridge nodes (the differentiated half) come first among equals.
 */
export function orderGaps(gaps: string[], have: Map<string, string>, maybe: Map<string, string>): string[] {
  const known = new Set([...have.keys(), ...maybe.keys()]);
  const ready = (id: string) =>
    (competency(id)?.prerequisites ?? []).every((p) => known.has(p) || !gaps.includes(p));
  return gaps.slice().sort((a, b) => {
    const ra = ready(a);
    const rb = ready(b);
    if (ra !== rb) return ra ? -1 : 1;
    const fa = competency(a)?.finance_bridge ?? false;
    const fb = competency(b)?.finance_bridge ?? false;
    if (fa !== fb) return fa ? -1 : 1;
    return (competency(a)?.prerequisites ?? []).length - (competency(b)?.prerequisites ?? []).length;
  });
}

/**
 * Depth = how many prerequisites deep a competency sits. It is what turns a list
 * into a map: depth 0 can be started today, deeper nodes have a road to them.
 * Computed rather than hand-assigned so it cannot drift from the graph.
 */
export function depthOf(id: string, seen: Set<string> = new Set()): number {
  if (seen.has(id)) return 0; // defensive: the graph is authored acyclic
  seen.add(id);
  const pres = competency(id)?.prerequisites ?? [];
  if (!pres.length) return 0;
  return 1 + Math.max(...pres.map((p) => (competency(p) ? depthOf(p, new Set(seen)) : 0)));
}

/**
 * UX_PRINCIPLES rule 6 — bands, not numbers. The reader never sees a count or a
 * percentage of themselves; they see where they stand on the same three-word
 * ramp the reports use. Thresholds are deliberately coarse: a band is a
 * conversation starter, and pretending to more resolution than the evidence
 * supports would be the dishonest part.
 */
export function coverageBand(have: number, maybe: number, total: number): Band | null {
  if (total === 0 || (have === 0 && maybe === 0)) return null;
  const ratio = have / total;
  if (ratio < 0.15) return 'emerging';
  if (ratio < 0.4) return 'developing';
  return 'strong';
}

/** Same ramp for practice: named state, never "3 / 12". */
export function practiceBand(done: number, total: number): Band | null {
  if (total === 0 || done === 0) return null;
  const ratio = done / total;
  if (ratio < 0.25) return 'emerging';
  if (ratio < 0.67) return 'developing';
  return 'strong';
}
