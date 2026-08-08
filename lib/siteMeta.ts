/**
 * Dates that must never be typed into a sentence.
 *
 * WHY (2026-08-08 freshness audit). Three long-form pages ended their footer with
 * a hand-typed `© 2026`. Every one of them would have read as a year out of date
 * from 1 January onwards, on the pages whose entire pitch is "every figure here
 * carries a date you can check" — the cheapest possible way to look abandoned.
 *
 * The copy now carries the `{year}` token and the page fills it at render time.
 * That is deliberately not a module-level constant: a constant is evaluated once
 * when the server process (or the build) starts, so it would freeze exactly the
 * same way. Rendering it means the answer is only ever as stale as the page's own
 * `revalidate`, and the three pages that use it all set one.
 */

export const YEAR_TOKEN = '{year}';

/** Replace `{year}` with the current year. `now` is injectable for tests. */
export function fillYear(text: string, now: Date = new Date()): string {
  return text.split(YEAR_TOKEN).join(String(now.getFullYear()));
}
