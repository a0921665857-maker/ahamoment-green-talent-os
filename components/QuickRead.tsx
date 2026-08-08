'use client';

import type { Locale, ResultCategory } from '@/lib/constants';
import { getQuickBand } from '@/lib/salaryBands';
import type { FlowContent, ShareContent } from '@/content/schema';
import { LineActions } from './LineActions';
import { SaveForLater } from './SaveForLater';
import { ShareableTypeCard } from './ShareableTypeCard';

/**
 * The 60-second, zero-typing quick read — five taps to a screenshot-worthy card.
 *
 * Extracted verbatim out of `MriIntakeFlow` (2026-08 conversion audit) so it can
 * also be mounted on a route of its own. Rendering and behaviour are unchanged;
 * the only API concession to standalone use is that the three wayfinding
 * callbacks (`onBack`, `onFull`, `onEditAnswers`) are optional — a host that has
 * nowhere to go back to simply omits them and the corresponding control is not
 * rendered. `/mri` passes all three, so its behaviour is byte-identical.
 *
 * Answer state stays with the host on purpose: inside `/mri` it must survive
 * stepping out to the full flow and back, which an internal `useState` could not.
 */

/** Deterministic four-answer → category read. Rough by design — the quick read
 * trades precision for zero typing; the full pipeline stays the honest one. */
export function mapQuick(a: Record<string, string>): ResultCategory {
  const senior = a.q2 === 'y3' || a.q2 === 'y6' || a.q2 === 'y8';
  if (a.q3 === 'mba_q' || a.q1 === 'mba')
    return senior ? 'ready_for_mba_story_sprint' : 'career_positioning_before_mba';
  if (a.q1 === 'student' || a.q2 === 'y0') return 'profile_building_needed';
  if (a.q1 === 'non_sus')
    return senior ? 'high_potential_low_commercial_clarity' : 'profile_building_needed';
  if (a.q3 === 'interview') return 'interview_ready_positioning_weak';
  if (a.q3 === 'no_reply')
    return a.q2 === 'y6' ? 'cv_strong_narrative_weak' : 'strong_profile_weak_story';
  if (a.q3 === 'abroad') return 'climate_career_builder';
  if (a.q3 === 'value')
    return senior ? 'high_potential_low_commercial_clarity' : 'strong_profile_weak_story';
  return 'strong_profile_weak_story';
}

/**
 * Quick-read wayfinding strings: how far along you are, and the way out.
 *
 * These live here rather than in `content/` only because `FlowContent.quick`
 * has no keys for them yet; they are chrome, not claims, and none of them
 * touches a number, a promise or a price. Move them into the schema the next
 * time the content contract is opened.
 */
export const QUICK_UI: Record<Locale, { progress: string; back: string; edit: string; needMore: string }> = {
  'zh-TW': {
    progress: '已完成 {done}／{total} 題',
    back: '回上一步',
    edit: '回上一步改答案',
    needMore: '還有 {left} 題沒選，{total} 題都選完就能拿速讀卡。',
  },
  en: {
    progress: '{done} of {total} answered',
    back: 'Back',
    edit: 'Back to change an answer',
    needMore: '{left} of {total} still to answer before your card unlocks.',
  },
};

export interface QuickReadProps {
  locale: Locale;
  flow: FlowContent;
  share: ShareContent;
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  showResult: boolean;
  onShowResult: () => void;
  /** Omit on a standalone route with no full-MRI step to hand off to. */
  onFull?: () => void;
  /** Omit when the quick read is the whole page (nothing to go back to). */
  onBack?: () => void;
  /** Omit to hide the "change an answer" link on the result card. */
  onEditAnswers?: () => void;
}

export function QuickRead(p: QuickReadProps) {
  const q = p.flow.quick;
  const ui = QUICK_UI[p.locale];
  const qs = [
    { id: 'q1', ...q.q1 },
    { id: 'q2', ...q.q2 },
    { id: 'q3', ...q.q3 },
    { id: 'q4', ...q.q4 },
    { id: 'q5', ...q.q5 },
  ];
  const answered = qs.filter((x) => p.answers[x.id]).length; // derived, not state
  const allAnswered = answered === qs.length;

  if (p.showResult) {
    const category = mapQuick(p.answers);
    const type = p.share.types[category];
    const qb = getQuickBand(p.answers.q5 ?? '', p.answers.q2 ?? '', p.locale);
    const stuckLine = (q.stuck as Record<string, string>)[p.answers.q3 ?? ''];
    return (
      <div className="mt-8">
        {/* Screenshot-worthy mini report card — the quick read's actual value.
            Every claim echoes results.ts; every number comes from the
            drift-guarded salary dataset. No LLM, fully deterministic. */}
        <div className="rounded-xl border-2 border-pine bg-paper p-6 sm:p-7">
          <p className="text-xs uppercase tracking-eyebrow text-pine">{q.resultEyebrow}</p>
          <h1 className="mt-2 text-3xl font-semibold">{type.label}</h1>

          <p className="mt-5 text-xs uppercase tracking-eyebrow text-ink-soft">
            {q.card.misreadLabel}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">{q.misread[category]}</p>

          {stuckLine && (
            <>
              <p className="mt-4 text-xs uppercase tracking-eyebrow text-ink-soft">
                {q.card.stuckLabel}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{stuckLine}</p>
            </>
          )}

          <div className="mt-4 border-l-2 border-pine pl-4">
            <p className="text-xs uppercase tracking-eyebrow text-ink-soft">
              {q.card.verdictLabel}
            </p>
            <p className="mt-1.5 text-sm font-medium leading-relaxed">{q.verdict[category]}</p>
          </div>

          {qb && (
            <div className="mt-5 rounded-xl bg-mist/40 px-4 py-3.5">
              <p className="text-xs uppercase tracking-eyebrow text-ink-soft">
                {q.card.salaryLabel}
              </p>
              {qb.band && (
                /* Separators follow the locale, not the data: the en card was
                   rendering "SingaporeSustainable finance・4–8 yrs：S$100k" —
                   no space after the market label, and CJK punctuation in an
                   English sentence. */
                <p className="mt-1.5 text-sm">
                  {p.locale === 'zh-TW' ? (
                    <>
                      {q.card.salaryLabelSg}
                      {qb.band.functionLabel}・{qb.band.expLabel}：
                    </>
                  ) : (
                    <>
                      {q.card.salaryLabelSg} {qb.band.functionLabel} · {qb.band.expLabel}:{' '}
                    </>
                  )}
                  <span className="font-semibold">{qb.band.sgBand}</span>
                </p>
              )}
              <p className="mt-1 text-sm">{qb.twAnchor}</p>
              <p className="mt-1 text-sm">
                {q.card.salaryLabelMultiple} {qb.nominal}
                {qb.disposable ? `${q.card.salaryDisposableSuffix}${qb.disposable}` : ''}
              </p>
              <p className="mt-2 text-xs text-ink-soft">{q.card.salarySource}</p>
            </div>
          )}

          <p className="mt-5 text-right text-xs text-ink-soft">{q.card.brandFooter}</p>
        </div>

        <p className="mt-5 max-w-[37rem] rounded-xl border border-line bg-mist/30 px-5 py-4 text-sm text-ink-soft">
          {q.resultNote}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {p.onFull && (
            <button
              type="button"
              onClick={p.onFull}
              className="rounded-lg bg-pine px-6 py-3 text-paper"
            >
              {q.fullCta}
            </button>
          )}
          <a
            href={`/${p.locale}/types/${category}?utm_source=quick_read`}
            className="text-sm font-medium text-pine underline-offset-2 hover:underline"
          >
            {q.typeDetailCta} →
          </a>
          {/* The card is a read of five taps, so mistyping one used to mean
              reloading the page. The answers are still in state; go change one. */}
          {p.onEditAnswers && (
            <button
              type="button"
              onClick={p.onEditAnswers}
              className="text-sm text-ink-soft underline-offset-2 hover:text-pine hover:underline"
            >
              ← {ui.edit}
            </button>
          )}
        </div>
        {/* email unlock — capture the quick-read taker as a reachable lead */}
        <SaveForLater locale={p.locale} copy={p.flow.saveLater} />
        <LineActions
          title={p.flow.line.endTitle}
          body={p.flow.line.endBody}
          addLabel={p.flow.line.addCta}
          context="quick_result"
        />
        {/* viral loop — the quick result is itself shareable back to Threads */}
        <ShareableTypeCard
          locale={p.locale}
          category={category}
          content={p.share}
          shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${p.locale}/types/${category}`}
        />
      </div>
    );
  }

  return (
    <div className="mt-8">
      {/* The quick read used to be a one-way door with no odometer: five
          questions, no sense of how far along you were, and no way back out to
          the full MRI once you had tapped in. Both are pure reads of the
          answers already in state. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {p.onBack ? (
          <button
            type="button"
            onClick={p.onBack}
            className="-ml-2 inline-flex min-h-[44px] items-center rounded-lg px-2 text-sm text-ink-soft underline-offset-2 hover:text-pine hover:underline"
          >
            ← {ui.back}
          </button>
        ) : (
          <span />
        )}
        <p aria-live="polite" className="text-sm text-ink-soft">
          {ui.progress.replace('{done}', String(answered)).replace('{total}', String(qs.length))}
        </p>
      </div>
      <div className="mt-2 h-1 w-full overflow-hidden rounded-lg bg-mist" aria-hidden="true">
        <div
          className="h-full rounded-lg bg-pine transition-[width] duration-300"
          style={{ width: `${(answered / qs.length) * 100}%` }}
        />
      </div>

      <h1 className="mt-6 text-3xl font-semibold leading-tight text-balance sm:text-4xl">{q.title}</h1>
      <p className="mt-2 text-ink-soft">{q.intro}</p>
      <div className="mt-6 space-y-6">
        {qs.map((x) => (
          <div key={x.id}>
            {/* same shape as QuestionsStep: a heading-ish <p> plus a labelled group */}
            <p id={`quick-${x.id}-label`} className="block text-sm font-medium">
              {x.label}
            </p>
            <div
              role="group"
              aria-labelledby={`quick-${x.id}-label`}
              className="mt-2 flex flex-wrap gap-2"
            >
              {x.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={p.answers[x.id] === o.value}
                  onClick={() => p.setAnswers({ ...p.answers, [x.id]: o.value })}
                  className={
                    p.answers[x.id] === o.value
                      ? 'inline-flex min-h-[44px] items-center rounded-full bg-pine px-4 py-2.5 text-sm text-paper'
                      : 'inline-flex min-h-[44px] items-center rounded-full border border-line px-4 py-2.5 text-sm text-ink-soft hover:border-pine'
                  }
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        disabled={!allAnswered}
        onClick={p.onShowResult}
        className="mt-8 rounded-lg bg-pine px-6 py-3 text-paper disabled:opacity-40"
      >
        {q.showResult}
      </button>
      {/* Same fix the full material step already carries (`flow.submitHint`): a
          dimmed button that says nothing is the rageclick pattern. Name the
          blocker under the button. */}
      {!allAnswered && (
        <p className="mt-2 text-xs text-ink-soft">
          {ui.needMore
            .replace('{left}', String(qs.length - answered))
            .replace('{total}', String(qs.length))}
        </p>
      )}
    </div>
  );
}
