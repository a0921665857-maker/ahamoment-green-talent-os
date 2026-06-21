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
