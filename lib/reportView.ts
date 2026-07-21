import type { Locale, MbaIntent } from '@/lib/constants';

/**
 * Pure, UI-agnostic helpers for the result/report views. Extracted so the
 * non-applicant framing and the locale-redirect rule can be unit-tested without
 * a React/Next harness. Behavior is identical to the inline versions they replace.
 */

/**
 * Non-applicants get next-move framing, not MBA-applicant framing. Only the three
 * applicant intents (active/considering/later) are applicants; everything else —
 * no, current, unknown, or missing — is a non-applicant (safe default: never assume
 * someone is applying to an MBA). Matches the report prompt's `applicant` definition.
 */
export function isNonApplicantIntent(mbaIntent: MbaIntent | undefined): boolean {
  return !(mbaIntent === 'active' || mbaIntent === 'considering' || mbaIntent === 'later');
}

/**
 * A report is written in a single locale. If the URL locale differs, return the
 * path to redirect to so the body and UI never end up in mixed languages; else null.
 */
export function localeRedirectPath(
  reportLocale: Locale,
  urlLocale: Locale,
  token: string,
): string | null {
  return reportLocale === urlLocale ? null : `/${reportLocale}/result/${token}`;
}

/* -------------------------- international_positioning QA -------------------------- */

/**
 * Structural contract for the international_positioning section (08), added after a
 * user test (Wendy) flagged that "which market you read strongest in" landed with no
 * follow-through on HOW to say it or WHAT to do next (fix/report-s08-depth). The
 * prompt in lib/prompts/mri_report.ts now requires the body to weave three layers
 * into one flowing paragraph:
 *   1. which market the profile reads strongest in + the one marker why (free text)
 *   2. a drafted self-description line for that market, cued by "你可以這樣說：" /
 *      "You could put it this way:" — never quotation-marked, since it is a rewrite,
 *      not something the person already said
 *   3. one doable-now strengthening move, cued by "下一步：" / "One move:"
 * zod (ReportSectionSchema) only checks the body is a non-empty string, so this
 * catches a regression zod cannot: a shallow single-observation body still validates
 * against the schema.
 */
const SAY_IT_CUES = ['你可以這樣說：', 'You could put it this way:'] as const;
const NEXT_MOVE_CUES = ['下一步：', 'One move:'] as const;
const EM_DASH = '—'; // —, forbidden in zh-TW output (content/index.ts LOCALE_STYLE_NOTES)
const QUOTED_SPAN = /「([^」]+)」|"([^"]+)"/g;

export interface SectionValidation {
  ok: boolean;
  issues: string[];
}

/**
 * Verifies the three-layer contract, the zh-TW no-em-dash rule, and quotation
 * integrity (any quoted span must appear verbatim in the supplied source snippets —
 * evidence_assets quotes or other original material — never a fabricated quote
 * dressed up as something the person said).
 */
export function validateInternationalPositioningBody(
  body: string,
  sourceSnippets: string[] = [],
): SectionValidation {
  const issues: string[] = [];

  const sayItCue = SAY_IT_CUES.find((c) => body.includes(c));
  const nextMoveCue = NEXT_MOVE_CUES.find((c) => body.includes(c));
  if (!sayItCue) issues.push('missing layer 2 cue ("你可以這樣說：" / "You could put it this way:")');
  if (!nextMoveCue) issues.push('missing layer 3 cue ("下一步：" / "One move:")');

  if (sayItCue && body.indexOf(sayItCue) <= 0) {
    issues.push('layer 1 (the market read) is missing or empty before the layer-2 cue');
  }
  if (sayItCue && nextMoveCue && body.indexOf(nextMoveCue) <= body.indexOf(sayItCue)) {
    issues.push('layer 3 (next move) must come after layer 2 (say-it-this-way)');
  }

  if (body.includes(EM_DASH)) {
    issues.push('contains an em dash (—), forbidden by the zh-TW style rules');
  }

  for (const match of body.matchAll(QUOTED_SPAN)) {
    const quoted = (match[1] ?? match[2] ?? '').trim();
    if (quoted && !sourceSnippets.some((s) => s.includes(quoted))) {
      issues.push(`quoted span not found verbatim in source material: "${quoted}"`);
    }
  }

  return { ok: issues.length === 0, issues };
}
