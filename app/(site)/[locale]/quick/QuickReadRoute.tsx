'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QuickRead, mapQuick } from '@/components/QuickRead';
import { phCapture } from '@/components/PostHogProvider';
import type { FlowContent, ShareContent } from '@/content/schema';
import type { Locale } from '@/lib/constants';
import { buildQuickQuery, parseQuickParams, type QuickState } from './params';

/**
 * The quick read as a route of its own, with the browser's own back gesture
 * wired to "change an answer".
 *
 * Inside `/mri` the quick read is a phase of a bigger flow, so its state lives
 * in the flow component and the address never changes. On this route the
 * address *is* the state (see `params.ts` for why), and this component is the
 * piece that keeps the two in step in both directions:
 *
 *   state -> URL   every answer writes a history entry
 *   URL   -> state a popstate (back, forward, or a gesture) reads it back
 *
 * ## Why a first answer pushes and a correction replaces
 *
 * Pushing an entry on *every* tap would mean six back presses to leave a page
 * a reader arrived at from a LINE broadcast, and re-tapping one question would
 * silently deepen the pile. So a question answered for the first time pushes
 * (back = un-answer it, which is the behaviour the audit asked for) and
 * overwriting an existing answer replaces (back still means "the question
 * before this one"). History depth is therefore bounded at six entries, and
 * every one of them is a step a reader actually took.
 *
 * ## How "do we have an entry of our own to go back to" is known
 *
 * A reader who opens somebody else's finished card has no entries of ours
 * behind them, so `history.back()` would throw them off the site — the exact
 * failure this route exists to remove. That depth is *derived*, not stored:
 * because a push happens once per first answer and once for the card, and
 * corrections only replace, the number of entries this page has added is
 * exactly `steps(now) - steps(on arrival)`. That stays correct through back and
 * forward without anything being persisted. A reload resets the baseline, so
 * the in-page back control hides until the next answer — the browser's own back
 * gesture is unaffected, and the failure is in the safe direction.
 *
 * Storing it in `history.state` was tried first and does not work: the App
 * Router rewrites `history.state` on popstate, keeping only its own `__NA` and
 * `__PRIVATE_NEXTJS_INTERNALS_TREE` fields, so a custom key survives a push but
 * is gone the first time the reader presses back — measured, not assumed.
 */

export interface QuickReadRouteProps {
  locale: Locale;
  flow: FlowContent;
  share: ShareContent;
  /** Parsed on the server from the query string, so a shared link renders the
   *  right step in the HTML document rather than flashing the questions first. */
  initial: QuickState;
}

/**
 * One step = one history entry this page adds. Answering a question for the
 * first time is a step; so is turning the answers into a card. Correcting an
 * answer is not, because a correction replaces its entry instead of stacking a
 * new one.
 */
function steps(s: QuickState): number {
  return Object.keys(s.answers).length + (s.showResult ? 1 : 0);
}

export function QuickReadRoute({ locale, flow, share, initial }: QuickReadRouteProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(initial.answers);
  const [showResult, setShowResult] = useState(initial.showResult);
  /**
   * Where this reader came in, frozen at the first render.
   *
   * The lazy initialiser runs once, so a later re-render with different
   * server-parsed props (the App Router does re-render this page as the query
   * string changes) cannot move the baseline out from under the subtraction
   * below. If the component were ever rebuilt from scratch, the baseline would
   * equal the current URL and the depth would read 0 — which fails in the safe
   * direction: the in-page back control hides rather than pointing off-site.
   */
  const [baseline, setBaseline] = useState(() => steps(initial));
  /** History entries this page owns. Derived, never stored. */
  const depth = steps({ answers, showResult }) - baseline;

  /**
   * One view event per arrival, tagged with how the reader got here.
   *
   * Deliberately *not* the `quick_started` / `quick_completed` names the `/mri`
   * phase fires: those are the denominators of an existing funnel, and mixing a
   * second surface into them would silently change numbers Michael already
   * reads. Same shape, different names, so the two surfaces can be compared
   * without either one being corrupted.
   */
  const viewed = useRef(false);
  useEffect(() => {
    if (viewed.current) return;
    viewed.current = true;
    phCapture('quick_route_viewed', {
      locale,
      entry: initial.showResult
        ? 'shared_result'
        : Object.keys(initial.answers).length > 0
          ? 'shared_partial'
          : 'fresh',
    });
  }, [locale, initial.showResult, initial.answers]);

  // URL -> state. Covers back, forward, and a restored session.
  useEffect(() => {
    function onPop() {
      const next = parseQuickParams(new URLSearchParams(window.location.search), flow.quick);
      setAnswers(next.answers);
      setShowResult(next.showResult);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [flow.quick]);

  // state -> URL.
  function write(next: QuickState, mode: 'push' | 'replace') {
    const url = `${window.location.pathname}${buildQuickQuery(next)}`;
    if (mode === 'push') {
      window.history.pushState({}, '', url);
    } else {
      // A replace can also *shrink* the current entry — stepping off a shared
      // card back to the questions is the one case. The baseline is therefore
      // the shallowest state this entry has ever stood for, so the subtraction
      // keeps counting entries rather than answers.
      window.history.replaceState({}, '', url);
      setBaseline((b) => Math.min(b, steps(next)));
    }
    setAnswers(next.answers);
    setShowResult(next.showResult);
  }

  const answered = Object.keys(answers).length;

  return (
    <QuickRead
      locale={locale}
      flow={flow}
      share={share}
      answers={answers}
      setAnswers={(a) => {
        // QuickRead only ever adds or overwrites one key, so the map growing is
        // an exact test for "this question had no answer before".
        const isFirstAnswer = Object.keys(a).length > answered;
        write({ answers: a, showResult: false }, isFirstAnswer ? 'push' : 'replace');
      }}
      showResult={showResult}
      onShowResult={() => {
        const category = mapQuick(answers);
        phCapture('quick_route_completed', {
          locale,
          category,
          market: answers.q4 ?? '',
          sector: answers.q5 ?? '',
        });
        // A push, so the card gets its own shareable address and back returns
        // to the questions with every answer still in place.
        write({ answers, showResult: true }, 'push');
      }}
      onFull={() => {
        phCapture('quick_route_to_full_clicked', { locale });
        router.push(`/${locale}/mri?utm_source=quick_route&utm_medium=cross_link`);
      }}
      // Only offered once there is an entry of ours to go back to; a reader who
      // landed here from a link has nothing behind them but the referrer.
      onBack={depth > 0 ? () => window.history.back() : undefined}
      onEditAnswers={() => {
        if (depth > 0) {
          window.history.back();
          return;
        }
        // Opened somebody else's card: there is no "before" to return to, so
        // rewrite this entry into the question list rather than ejecting them.
        // A replace, not a push, because an entry that only undoes the arrival
        // would make the back gesture a no-op-looking loop.
        write({ answers, showResult: false }, 'replace');
      }}
    />
  );
}
