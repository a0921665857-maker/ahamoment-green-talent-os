import type { FlowContent } from '@/content/schema';

/**
 * The quick read's URL contract — the single source of truth for what a
 * `/[locale]/quick` address means.
 *
 * The standalone route keeps its whole state in the query string rather than in
 * React state alone, and that one decision buys all three things the audit
 * asked for at once:
 *
 *   - **Back means "change an answer".** Every new answer is a history entry, so
 *     the browser's back gesture walks the questions instead of ejecting the
 *     reader off the site. This is the whole point on a route whose traffic
 *     arrives from a LINE broadcast or a Threads post: back is the most-pressed
 *     control on mobile, and it used to be an exit.
 *   - **The result is shareable.** A finished card is a plain URL that renders
 *     the same card for whoever opens it — no token, no storage, no account.
 *   - **A reload does not lose the answers.** The server reads the same params
 *     and renders the same step, so a refresh, a restored tab or a link pasted
 *     into another browser all land where the reader left off.
 *
 * Option values are declared stable across locales in `content/schema.ts`
 * (`QuestionOption.value`), so a zh-TW reader can send their result link to an
 * English reader and it still resolves.
 *
 * Everything here is validated against the option lists in content: an unknown
 * value is dropped rather than trusted, so a hand-edited URL cannot push a
 * value into `mapQuick` that no button could produce.
 */

export const QUICK_QUESTION_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;
export type QuickQuestionId = (typeof QUICK_QUESTION_IDS)[number];

/** Present (and `1`) only on a finished card. */
export const RESULT_PARAM = 'r';

type QuickContent = FlowContent['quick'];

/** value -> allowed set, read from the content the buttons are rendered from. */
function allowedValues(quick: QuickContent): Record<QuickQuestionId, Set<string>> {
  return Object.fromEntries(
    QUICK_QUESTION_IDS.map((id) => [id, new Set(quick[id].options.map((o) => o.value))]),
  ) as Record<QuickQuestionId, Set<string>>;
}

export interface QuickState {
  answers: Record<string, string>;
  showResult: boolean;
}

/**
 * Read a query string into quick-read state, dropping anything the buttons
 * could not have produced.
 *
 * `showResult` is only honoured once all five answers are present: a link with
 * `?r=1` and three answers is a truncated share, and showing a card built from
 * `mapQuick`'s fallbacks would be a made-up read.
 */
export function parseQuickParams(search: URLSearchParams, quick: QuickContent): QuickState {
  const allowed = allowedValues(quick);
  const answers: Record<string, string> = {};
  for (const id of QUICK_QUESTION_IDS) {
    const raw = search.get(id);
    if (raw && allowed[id].has(raw)) answers[id] = raw;
  }
  const complete = QUICK_QUESTION_IDS.every((id) => answers[id]);
  return { answers, showResult: complete && search.get(RESULT_PARAM) === '1' };
}

/** Same parse, from the shape a Next server page receives. */
export function parseQuickSearchParams(
  raw: Record<string, string | string[] | undefined>,
  quick: QuickContent,
): QuickState {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') search.set(k, v);
    else if (Array.isArray(v) && v.length > 0) search.set(k, v[0]);
  }
  return parseQuickParams(search, quick);
}

/**
 * State -> query string, in a fixed key order so the same set of answers is
 * always the same URL. Two readers who tapped the same five buttons get a
 * byte-identical link, which is what makes the card worth sharing.
 */
export function buildQuickQuery(state: QuickState): string {
  const search = new URLSearchParams();
  for (const id of QUICK_QUESTION_IDS) {
    if (state.answers[id]) search.set(id, state.answers[id]);
  }
  if (state.showResult) search.set(RESULT_PARAM, '1');
  const s = search.toString();
  return s ? `?${s}` : '';
}
