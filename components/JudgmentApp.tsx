'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { phCapture } from '@/components/PostHogProvider';
import { JudgmentMap } from '@/components/JudgmentMap';
import type { Band } from '@/lib/constants';
import type { JudgmentContent } from '@/content/schema';
import { JudgmentMarkdown } from '@/components/JudgmentMarkdown';
import {
  BACKGROUND_KEYS,
  assess,
  competency,
  coverageBand,
  depthOf,
  familyName,
  isBackgroundKey,
  judgmentData,
  orderGaps,
  practiceBand,
  repAsOf,
  type BackgroundKey,
  type JudgmentCompetency,
  type JudgmentRep,
  type JudgmentSource,
  type Verdict,
} from '@/lib/judgment';

/**
 * 綠領判斷力 — the interactive half of /[locale]/judgment.
 *
 * Two rules shape everything below and neither is negotiable:
 *
 * 1. Commit-first. The moment an option is chosen, the ONLY thing that appears
 *    is "why did you pick that". The takeaway, the reasoning and every
 *    why_tempting stay out of the DOM entirely — not hidden with CSS, not
 *    collapsed in a <details>, simply not rendered — until the reader has
 *    written a reason or explicitly declined. Rendering the answer next to the
 *    prompt destroys the effect as surely as never asking.
 *
 * 2. One green ramp, never traffic lights (UX_PRINCIPLES). Verdicts are carried
 *    by their word — 最佳解 / 可行，但有代價 / 會出事 — plus depth of green and
 *    solid-versus-dashed edges. No red, no amber: a wrong option here is not an
 *    error state, it is a thing experienced people genuinely reach for.
 *
 * State (background, ticked topics, answers, written reasons) lives only in this
 * browser's localStorage. Nothing is sent anywhere, and the page says so.
 */

const TABS = ['start', 'gaps', 'reps', 'map'] as const;
type Tab = (typeof TABS)[number];

const STORAGE_KEY = 'gc_state';

interface SavedState {
  bg: BackgroundKey | null;
  domains: string[];
  answers: Record<string, string>;
  /** Presence of a key IS the commitment: '' means "asked, declined to write". */
  why: Record<string, string>;
}

const EMPTY_STATE: SavedState = { bg: null, domains: [], answers: {}, why: {} };

/** Anything in storage is untrusted: an old shape or hand-edited JSON must not crash the page. */
function parseSaved(raw: string): SavedState {
  const s = JSON.parse(raw) as Partial<SavedState>;
  return {
    bg: typeof s.bg === 'string' && isBackgroundKey(s.bg) ? s.bg : null,
    domains: Array.isArray(s.domains) ? s.domains.filter((d) => typeof d === 'string') : [],
    answers: s.answers && typeof s.answers === 'object' ? s.answers : {},
    why: s.why && typeof s.why === 'object' ? s.why : {},
  };
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
}

const BAND_ORDER: Band[] = ['emerging', 'developing', 'strong'];
const BAND_SWATCH: Record<Band, string> = {
  emerging: 'bg-band-emerging',
  developing: 'bg-band-developing',
  strong: 'bg-band-strong',
};

/** Bands, not numbers (rule 6): the reader's state is three words on a ramp. */
function BandRamp({ current, labels }: { current: Band | null; labels: Record<Band, string> }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {BAND_ORDER.map((b) => {
        const on = b === current;
        return (
          <span
            key={b}
            aria-current={on ? 'true' : undefined}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${
              on ? 'border-pine bg-sage-soft font-medium text-pine-deep' : 'border-line text-ink-soft'
            }`}
          >
            <span aria-hidden className={`size-2.5 rounded-full ${BAND_SWATCH[b]} ${on ? '' : 'opacity-40'}`} />
            {labels[b]}
          </span>
        );
      })}
    </div>
  );
}

const VERDICT_CHIP: Record<Verdict, string> = {
  best: 'border-pine bg-pine text-paper',
  defensible: 'border-band-developing bg-mist text-pine-deep',
  wrong: 'border-dashed border-band-emerging bg-paper text-ink-soft',
};

const VERDICT_BLOCK: Record<Verdict, string> = {
  best: 'border-l-2 border-pine bg-sage-soft/40',
  defensible: 'border-l-2 border-band-developing bg-mist/50',
  wrong: 'border-l-2 border-dashed border-band-emerging bg-paper',
};

function VerdictChip({ verdict, label }: { verdict: Verdict; label: string }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-xs font-semibold ${VERDICT_CHIP[verdict]}`}
    >
      {label}
    </span>
  );
}

/** The single exit: placed where trust peaks, phrased as a question about THEIR situation. */
function ExitCard({ t, where }: { t: JudgmentContent; where: string }) {
  const email = judgmentData.identity.email;
  if (!email) return null;
  const href = `mailto:${email}?subject=${encodeURIComponent(t.exit.mailSubject + where)}`;
  return (
    <div className="mt-6 rounded-xl border border-line bg-mist/40 p-5">
      <p className="font-semibold">{t.exit.title}</p>
      <p className="mt-2 text-sm text-ink-soft">{t.exit.body}</p>
      <p className="mt-2 text-sm text-ink-soft">{t.exit.betaNote}</p>
      <p className="mt-3 text-sm">
        <a href={href} className="font-medium text-pine underline underline-offset-2 break-words">
          {email}
        </a>
      </p>
    </div>
  );
}

/**
 * When this material was last checked against the rules it describes.
 *
 * Every explainer in the corpus has carried `meta.as_of` since it was written and
 * nothing rendered it, so 26 pieces of hard regulatory teaching (金管會 announcement
 * dates, the 170-company first phase, the 8/31 filing deadline) read as timeless
 * fact. This is the smallest honest fix: the date the author checked, next to what
 * they checked. It renders nothing at all when there is no date, because a missing
 * date must never be filled in with today's.
 */
function AsOfNote({ template, date, className = '' }: { template: string; date?: string; className?: string }) {
  if (!date) return null;
  return (
    <p className={`text-xs text-ink-soft ${className}`}>{fill(template, { date })}</p>
  );
}

function SourceList({
  label,
  checkedOn,
  sources,
}: {
  label: string;
  checkedOn: string;
  sources: JudgmentSource[];
}) {
  if (!sources.length) return null;
  return (
    <div className="mt-6 border-t border-line pt-4">
      <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{label}</p>
      <ul className="mt-2 space-y-1.5 text-sm text-ink-soft">
        {sources.map((s, i) => (
          <li key={i} className="break-words">
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pine underline decoration-line underline-offset-2 hover:decoration-pine"
            >
              {s.title}
            </a>
            {s.as_of && <span className="text-xs">（{fill(checkedOn, { date: s.as_of })}）</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JudgmentApp({
  t,
  bandLabels,
}: {
  t: JudgmentContent;
  bandLabels: Record<Band, string>;
}) {
  const [tab, setTab] = useState<Tab>('start');
  // One object rather than four pieces of state: the restore below then needs a
  // single write, and the save effect has a single dependency.
  const [saved, setSaved] = useState<SavedState>(EMPTY_STATE);
  const { bg, domains, answers, why } = saved;
  const [openRep, setOpenRep] = useState<string | null>(null);
  /** Competency id whose map tile launched the current drill, so we can go back. */
  const [cameFromMap, setCameFromMap] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage is client-only; reading it in an effect (not during render)
      // is the SSR-safe pattern — server and first client paint render the blank
      // state, then this fills it in.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setSaved(parseSaved(raw));
    } catch {
      // Private mode, blocked storage, corrupted value: the page still works.
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return; // never overwrite storage with the pre-load blank
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Non-fatal: progress simply will not survive the session.
    }
  }, [saved]);

  const domainSet = useMemo(() => new Set(domains), [domains]);

  const assessment = useMemo(
    () =>
      assess(bg, domainSet, t.gaps.weakSignalNote, (label) => fill(t.gaps.backgroundBasis, { label })),
    [bg, domainSet, t.gaps.weakSignalNote, t.gaps.backgroundBasis],
  );

  const ordered = useMemo(
    () => orderGaps(assessment.gaps, assessment.have, assessment.maybe),
    [assessment],
  );

  const reps = judgmentData.reps;
  const total = judgmentData.graph.competencies.length;
  const answeredCount = reps.filter((r) => answers[r.id]).length;

  /**
   * The judgment module shipped with zero instrumentation — 898 lines and not a
   * single event, so "does anyone finish it" has never been answerable. These
   * five calls are the whole funnel: opened, gaps read, practice opened, each
   * answer, and completion. No answer text and no free-text reasoning is ever
   * sent: `verdict` is one of three fixed values and `rep` is a question id.
   */
  /**
   * `rep` matters: this used to unconditionally clear openRep, so the drill CTA
   * on a map tile ("去做判斷練習") landed the reader on the 12-question list with
   * nothing open — they asked for one question and got a menu. The caller now
   * says which question, if any, it means.
   */
  function goTab(next: Tab, rep: string | null = null) {
    phCapture('judgment_tab_viewed', { tab: next, answered: answeredCount });
    setTab(next);
    setOpenRep(rep);
    window.scrollTo(0, 0);
  }

  /**
   * Back to the tile the reader launched the drill from. Without this the CTA is
   * a one-way door: it takes them out of the map and gives them no way in again.
   */
  function backToMapTile(competencyId: string) {
    setCameFromMap(null);
    goTab('map');
    // The map mounts on a later React commit, and under concurrent rendering that
    // is not a fixed number of frames away, so retry until the tile exists.
    // setTimeout rather than requestAnimationFrame on purpose: rAF does not fire
    // while the page is not compositing (a background tab, or a preview pane that
    // is hidden), and then the reader comes back to a map that quietly did nothing.
    let tries = 0;
    const reveal = () => {
      const el = document.getElementById(`map-${competencyId}`);
      if (!(el instanceof HTMLDetailsElement)) {
        if (tries++ < 30) setTimeout(reveal, 16);
        return;
      }
      el.open = true;
      el.scrollIntoView({ block: 'center' });
      el.querySelector('summary')?.focus();
    };
    setTimeout(reveal, 0);
  }

  function toggleDomain(slug: string) {
    setSaved((p) => ({
      ...p,
      domains: p.domains.includes(slug)
        ? p.domains.filter((d) => d !== slug)
        : [...p.domains, slug],
    }));
  }

  function choose(repId: string, key: string) {
    if (answers[repId]) return; // commit-first: the choice is final, so it counts
    const rep = reps.find((r) => r.id === repId);
    const verdict = rep?.options.find((o) => o.key === key)?.verdict ?? 'unknown';
    const nextCount = answeredCount + 1;
    phCapture('judgment_answered', { rep: repId, verdict, answered: nextCount });
    if (nextCount === reps.length) {
      phCapture('judgment_completed', { total: reps.length });
    }
    setSaved((p) => ({ ...p, answers: { ...p.answers, [repId]: key } }));
    setDraft('');
  }

  function commitReason(repId: string, text: string) {
    setSaved((p) => ({ ...p, why: { ...p.why, [repId]: text } }));
    window.scrollTo(0, 0);
  }

  const pillOn = 'border-pine bg-sage-soft font-medium text-pine-deep';
  const pillOff = 'border-line bg-paper text-ink-soft hover:border-pine hover:text-pine';

  return (
    <div>
      <nav
        role="group"
        aria-label={t.title}
        className="sticky top-0 z-10 -mx-6 border-b border-line bg-paper px-6 py-3"
      >
        <div className="flex flex-wrap gap-2">
          {TABS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => goTab(k)}
              aria-pressed={tab === k}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                tab === k ? pillOn : pillOff
              }`}
            >
              {t.tabs[k]}
            </button>
          ))}
        </div>
      </nav>

      {tab === 'start' && (
        <section className="pt-8">
          <h2 className="text-2xl font-semibold">{t.start.backgroundTitle}</h2>
          <p className="mt-2 text-ink-soft">{t.start.backgroundHint}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {BACKGROUND_KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setSaved((p) => ({ ...p, bg: k }))}
                aria-pressed={bg === k}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  bg === k ? pillOn : pillOff
                }`}
              >
                {t.start.backgrounds[k].label}
              </button>
            ))}
          </div>
          {bg && (
            <p className="mt-3 border-l-2 border-pine pl-4 text-sm text-ink-soft">
              {t.start.backgrounds[bg].hint}
            </p>
          )}

          <h2 className="mt-12 text-2xl font-semibold">{t.start.domainTitle}</h2>
          <p className="mt-2 text-ink-soft">{t.start.domainHint}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {judgmentData.map.domain_to_competencies.map((d) => (
              <button
                key={d.domain_slug}
                type="button"
                onClick={() => toggleDomain(d.domain_slug)}
                aria-pressed={domainSet.has(d.domain_slug)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  domainSet.has(d.domain_slug) ? pillOn : pillOff
                }`}
              >
                {d.label_zh}
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs text-ink-soft">{t.reps.storageNote}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => goTab('gaps')}
              disabled={!bg}
              className="rounded-lg bg-pine px-6 py-3 font-semibold text-paper transition-opacity disabled:opacity-40"
            >
              {t.start.cta}
            </button>
            {!bg && <span className="text-sm text-ink-soft">{t.start.ctaBlocked}</span>}
          </div>
        </section>
      )}

      {tab === 'gaps' && (
        <section className="pt-8">
          {!bg ? (
            <p className="text-ink-soft">{t.gaps.needBackground}</p>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">{t.gaps.stateTitle}</h2>
              {(() => {
                const band = coverageBand(assessment.have.size, assessment.maybe.size, total);
                return (
                  <>
                    <BandRamp current={band} labels={bandLabels} />
                    <p className="mt-3 text-ink-soft">
                      {band ? fill(t.bandLead, { band: bandLabels[band] }) : t.bandNone}
                    </p>
                  </>
                );
              })()}
              <p className="mt-1 text-sm text-ink-soft">{t.gaps.stateNote}</p>

              {assessment.have.size > 0 && (
                <>
                  <h3 className="mt-10 text-lg font-semibold">{t.gaps.haveTitle}</h3>
                  <ul className="mt-3 space-y-3 border-l-2 border-pine pl-4">
                    {[...assessment.have].map(([id, basis]) => (
                      <li key={id}>
                        <span className="font-medium">{competency(id)?.name_zh ?? id}</span>
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {t.gaps.basisLabel}
                          {basis}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {assessment.maybe.size > 0 && (
                <>
                  <h3 className="mt-10 text-lg font-semibold">{t.gaps.maybeTitle}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{t.gaps.maybeHint}</p>
                  <ul className="mt-3 space-y-3 border-l-2 border-dashed border-band-developing pl-4">
                    {[...assessment.maybe].map(([id, basis]) => (
                      <li key={id}>
                        <span className="font-medium">{competency(id)?.name_zh ?? id}</span>
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {t.gaps.basisLabel}
                          {basis}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h3 className="mt-12 text-lg font-semibold">{t.gaps.gapTitle}</h3>
              <p className="mt-2 text-sm text-ink-soft">{t.gaps.gapRule}</p>
              <div className="mt-5 grid gap-5">
                {ordered.slice(0, 5).map((id) => (
                  <GapCard key={id} id={id} t={t} />
                ))}
              </div>
              {ordered.length > 5 && (
                <details className="mt-6">
                  <summary className="cursor-pointer text-sm font-medium text-pine">
                    {fill(t.gaps.moreLabel, { n: ordered.length - 5 })}
                  </summary>
                  <div className="mt-5 grid gap-5">
                    {ordered.slice(5).map((id) => (
                      <GapCard key={id} id={id} t={t} />
                    ))}
                  </div>
                </details>
              )}

              <div className="mt-10">
                <button
                  type="button"
                  onClick={() => goTab('reps')}
                  className="rounded-lg bg-pine px-6 py-3 font-semibold text-paper"
                >
                  {t.gaps.cta}
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'reps' && (
        <section className="pt-8">
          <h2 className="text-2xl font-semibold">{t.reps.title}</h2>
          {reps.length === 0 ? (
            <p className="mt-3 text-ink-soft">{t.reps.empty}</p>
          ) : openRep ? (
            (() => {
              const rep = reps.find((r) => r.id === openRep);
              if (!rep) return null;
              return (
                <>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenRep(null);
                        window.scrollTo(0, 0);
                      }}
                      className="rounded-lg border border-line px-4 py-2 text-sm hover:border-pine"
                    >
                      ← {t.reps.backToList}
                    </button>
                    {cameFromMap && (
                      <button
                        type="button"
                        onClick={() => backToMapTile(cameFromMap)}
                        className="rounded-lg border border-pine/40 px-4 py-2 text-sm font-medium text-pine hover:border-pine"
                      >
                        ← {t.reps.backToMap}
                      </button>
                    )}
                  </div>
                  <RepDetail
                    rep={rep}
                    t={t}
                    chosen={answers[rep.id]}
                    committed={why[rep.id] !== undefined}
                    reason={why[rep.id] ?? ''}
                    draft={draft}
                    onDraft={setDraft}
                    onChoose={(key) => choose(rep.id, key)}
                    onCommit={(text) => commitReason(rep.id, text)}
                    onClose={() => {
                      setOpenRep(null);
                      window.scrollTo(0, 0);
                    }}
                  />
                </>
              );
            })()
          ) : (
            <>
              <p className="mt-3 text-ink-soft">{t.reps.rule}</p>
              <h3 className="mt-8 text-sm uppercase tracking-eyebrow text-ink-soft">
                {t.reps.stateTitle}
              </h3>
              <BandRamp current={practiceBand(answeredCount, reps.length)} labels={bandLabels} />
              <p className="mt-3 text-xs text-ink-soft">{t.reps.storageNote}</p>
              <div className="mt-6 grid gap-4">
                {reps.map((r) => {
                  const chosen = answers[r.id];
                  const revealed = why[r.id] !== undefined;
                  const names = r.competencies.map((id) => competency(id)?.name_zh ?? id);
                  const verdict = chosen
                    ? r.options.find((o) => o.key === chosen)?.verdict
                    : undefined;
                  return (
                    <div key={r.id} className="min-w-0 rounded-xl border border-line bg-paper p-5">
                      <p className="text-xs text-ink-soft">
                        {names.join('・')}
                        {r.minutes ? ` · ${fill(t.reps.minutes, { n: r.minutes })}` : ''}
                      </p>
                      <p className="mt-2">{r.question}</p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenRep(r.id);
                            setDraft('');
                            window.scrollTo(0, 0);
                          }}
                          className={
                            chosen
                              ? 'rounded-lg border border-line px-4 py-2 text-sm hover:border-pine'
                              : 'rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-paper'
                          }
                        >
                          {chosen ? t.reps.again : t.reps.start}
                        </button>
                        {chosen && (
                          <span className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                            {fill(t.reps.answeredWith, { key: chosen })}
                            {/* The verdict is withheld until the gate has been passed:
                                showing it in the list would leak the answer. */}
                            {revealed && verdict ? (
                              <VerdictChip verdict={verdict} label={t.reps.verdicts[verdict]} />
                            ) : (
                              <span>{t.reps.answeredPending}</span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'map' && (
        <KnowledgeMap
          t={t}
          bg={bg}
          assessment={assessment}
          onOpenRep={(repId, fromCompetencyId) => {
            setCameFromMap(fromCompetencyId);
            goTab('reps', repId);
          }}
        />
      )}
    </div>
  );
}

function GapCard({ id, t }: { id: string; t: JudgmentContent }) {
  const c = competency(id);
  if (!c) return null;
  const ex = judgmentData.explainers[id];
  return (
    // min-w-0: a grid item defaults to min-width:auto, which would let a wide
    // explainer table push the whole page sideways instead of scrolling itself.
    <article className="min-w-0 rounded-xl border border-line bg-paper p-5">
      <h4 className="text-lg font-semibold leading-snug">{c.name_zh}</h4>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        <SideTag t={t} finance={c.finance_bridge} />
        <span className="text-ink-soft">{familyName(c.family)}</span>
        {c.time_to_level_1 && (
          <span className="text-ink-soft">
            {t.gaps.timeLabel}
            {c.time_to_level_1}
          </span>
        )}
      </p>
      <p className="mt-3">{c.one_liner}</p>
      <p className="mt-3 text-sm text-ink-soft">
        {t.gaps.whyPaysLabel}
        {c.why_it_pays}
      </p>
      {/* The corpus marks its own moving parts. Say so on the card, before the
          reader opens anything, because the volatile ones are exactly the ones
          somebody might act on. */}
      {c.volatile && <AsOfNote template={t.gaps.volatileAsOf} date={c.as_of} className="mt-2" />}
      {ex ? (
        <details className="mt-4 border-t border-line pt-4">
          <summary className="cursor-pointer text-sm font-medium text-pine">
            {t.gaps.explainerSummary}
          </summary>
          <div className="mt-4">
            <AsOfNote
              template={t.gaps.explainerAsOf}
              date={ex.meta.as_of}
              className="mb-4 border-l-2 border-line pl-3"
            />
            {ex.sections.map((s, i) => (
              <div key={i} className="mt-6 first:mt-0">
                {s.h && <h5 className="font-semibold text-pine-deep">{s.h}</h5>}
                <JudgmentMarkdown text={s.body} className="mt-2" />
              </div>
            ))}
            <ExitCard t={t} where={c.name_zh} />
          </div>
        </details>
      ) : (
        <p className="mt-4 text-xs text-ink-soft">{t.gaps.explainerPending}</p>
      )}
      {c.reps && c.reps.length > 0 && (
        <p className="mt-4 text-xs text-ink-soft">{fill(t.gaps.repsAttached, { n: c.reps.length })}</p>
      )}
    </article>
  );
}

/**
 * The product sits on a seam: sustainability on one side, finance on the other.
 * The old standalone page carried that with a second accent hue; the site's
 * palette is one green ramp, so the seam is carried by a word instead.
 */
function SideTag({ t, finance }: { t: JudgmentContent; finance: boolean }) {
  return finance ? (
    <span className="rounded bg-sage-soft px-2 py-0.5 font-medium text-pine-deep">
      {t.gaps.financeTag}
    </span>
  ) : (
    <span className="rounded border border-line px-2 py-0.5 text-ink-soft">
      {t.gaps.sustainabilityTag}
    </span>
  );
}

function RepDetail({
  rep,
  t,
  chosen,
  committed,
  reason,
  draft,
  onDraft,
  onChoose,
  onCommit,
  onClose,
}: {
  rep: JudgmentRep;
  t: JudgmentContent;
  chosen: string | undefined;
  committed: boolean;
  reason: string;
  draft: string;
  onDraft: (v: string) => void;
  onChoose: (key: string) => void;
  onCommit: (text: string) => void;
  onClose: () => void;
}) {
  const names = rep.competencies.map((id) => competency(id)?.name_zh ?? id);
  const best = rep.options.find((o) => o.verdict === 'best');
  const mine = chosen ? rep.options.find((o) => o.key === chosen) : undefined;

  return (
    <div className="mt-5 rounded-xl border border-line bg-paper p-5 sm:p-6">
      <p className="text-xs text-ink-soft">
        {names.join('・')}
        {rep.minutes ? ` · ${fill(t.reps.minutes, { n: rep.minutes })}` : ''}
      </p>
      {/* Above the scenario, not down in the sources: a drill built on a rule that
          has since changed is misleading from the first sentence, and the reader
          decides how much to trust the numbers before they answer, not after. */}
      <AsOfNote template={t.reps.asOf} date={repAsOf(rep) ?? undefined} className="mt-1.5" />

      <JudgmentMarkdown text={rep.scenario} className="mt-4" />

      <p className="mt-6 text-lg font-semibold leading-snug">{rep.question}</p>

      <div className="mt-4 grid gap-2">
        {rep.options.map((o) => {
          const picked = chosen === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChoose(o.key)}
              aria-pressed={picked}
              aria-disabled={chosen ? true : undefined}
              className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                picked
                  ? 'border-pine bg-sage-soft'
                  : chosen
                    ? 'cursor-default border-line bg-paper text-ink-soft'
                    : 'border-line bg-paper hover:border-pine'
              }`}
            >
              <span className="font-semibold">{o.key}.</span> {o.text}
            </button>
          );
        })}
      </div>

      {/* Nothing of the answer exists below this line until the gate is passed. */}
      {!chosen && <p className="mt-5 text-sm text-ink-soft">{t.reps.rule}</p>}

      {chosen && !committed && (
        <div className="mt-6 rounded-xl border border-pine bg-sage-soft/40 p-5">
          <h3 className="font-semibold">{fill(t.reps.gate.title, { key: chosen })}</h3>
          <p className="mt-2 text-sm text-ink-soft">{t.reps.gate.hint}</p>
          <textarea
            value={draft}
            onChange={(e) => onDraft(e.target.value)}
            placeholder={t.reps.gate.placeholder}
            rows={3}
            className="mt-3 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onCommit(draft.trim())}
              className="rounded-lg bg-pine px-5 py-2.5 text-sm font-semibold text-paper"
            >
              {t.reps.gate.submit}
            </button>
            <button
              type="button"
              onClick={() => onCommit('')}
              className="rounded-lg border border-line px-5 py-2.5 text-sm hover:border-pine"
            >
              {t.reps.gate.skip}
            </button>
          </div>
        </div>
      )}

      {chosen && committed && mine && (
        <div className="mt-8">
          {/* 1. Replay what the reader committed to, before anything else. */}
          <div className="rounded-xl border border-line bg-mist/50 p-5">
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <VerdictChip verdict={mine.verdict} label={t.reps.verdicts[mine.verdict]} />
              <span>
                {fill(t.reps.reveal.choiceLine, { key: chosen })}
                {mine.verdict !== 'best' && best
                  ? fill(t.reps.reveal.bestIs, { key: best.key })
                  : ''}
              </span>
            </p>
            {reason ? (
              <>
                <p className="mt-4 text-xs uppercase tracking-eyebrow text-ink-soft">
                  {t.reps.reveal.yourReasonLabel}
                </p>
                <p className="mt-1.5 border-l-2 border-pine pl-4">{reason}</p>
              </>
            ) : (
              <>
                <p className="mt-4 text-sm text-ink-soft">{t.reps.reveal.skippedLabel}</p>
                <textarea
                  value={draft}
                  onChange={(e) => onDraft(e.target.value)}
                  onBlur={() => draft.trim() && onCommit(draft.trim())}
                  placeholder={t.reps.reveal.addReasonPlaceholder}
                  rows={2}
                  className="mt-2 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink"
                />
              </>
            )}
          </div>

          {/* 2. The one sentence worth keeping, before the long reasoning. */}
          <div className="mt-6 rounded-xl border-l-2 border-pine bg-sage-soft/50 px-5 py-5">
            <p className="text-xs uppercase tracking-eyebrow text-pine">
              {t.reps.reveal.takeawayLabel}
            </p>
            <p className="mt-2 text-lg font-medium leading-relaxed">{rep.takeaway}</p>
          </div>

          {/* 3. The full reasoning. */}
          <h3 className="mt-10 text-lg font-semibold">{t.reps.reveal.reasoningTitle}</h3>
          <JudgmentMarkdown text={rep.reasoning} className="mt-3" />

          {/* 4. Option-by-option, collapsed — it must not bury the takeaway. */}
          <details className="mt-8 rounded-xl border border-line p-5">
            <summary className="cursor-pointer font-medium text-pine">
              {t.reps.reveal.breakdownSummary}
            </summary>
            <div className="mt-5 grid gap-5">
              {rep.options.map((o) => (
                <div
                  key={o.key}
                  className={`min-w-0 rounded-r-lg py-1 pl-4 ${VERDICT_BLOCK[o.verdict]}`}
                >
                  <p className="flex flex-wrap items-center gap-2">
                    <VerdictChip verdict={o.verdict} label={t.reps.verdicts[o.verdict]} />
                    <span className="font-semibold">{o.key}.</span>
                  </p>
                  <p className="mt-2">{o.text}</p>
                  {/* why_tempting always precedes the explanation: the reason a
                      wrong answer attracts is the part worth reading first. */}
                  {o.why_tempting && (
                    <div className="mt-3 border-l-2 border-band-developing bg-mist/60 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-eyebrow text-pine-deep">
                        {t.reps.reveal.temptingLabel}
                      </p>
                      <JudgmentMarkdown text={o.why_tempting} className="mt-1.5 text-sm" />
                    </div>
                  )}
                  <JudgmentMarkdown text={o.why} className="mt-3 text-sm text-ink-soft" />
                </div>
              ))}
            </div>
          </details>

          {/* 5. How it actually goes wrong in the field. */}
          {rep.common_failure && (
            <>
              <h3 className="mt-10 text-lg font-semibold">{t.reps.reveal.failureTitle}</h3>
              <JudgmentMarkdown text={rep.common_failure} className="mt-3" />
            </>
          )}

          {/* 6. The exit. */}
          <ExitCard t={t} where={rep.question} />

          <SourceList
            label={t.reps.reveal.sourcesLabel}
            checkedOn={t.reps.reveal.checkedOn}
            sources={rep.sources ?? []}
          />

          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-lg border border-line px-4 py-2 text-sm hover:border-pine"
          >
            ← {t.reps.backToList}
          </button>
        </div>
      )}
    </div>
  );
}

const STATUS_EDGE = {
  have: 'border-l-2 border-pine bg-sage-soft/40',
  maybe: 'border-l-2 border-dashed border-band-developing bg-mist/50',
  gap: 'border-l-2 border-dotted border-band-emerging bg-paper',
  none: 'border-l-2 border-line bg-paper',
} as const;

/**
 * The next action on a map card: read the three-minute explainer in place, or
 * jump into the drill. The explainer opens inline rather than navigating,
 * because the detail cards live on a different tab and only the assessed subset
 * of competencies is rendered there — a link would sometimes land nowhere.
 */
function MapCardActions({
  t,
  c,
  onOpenRep,
}: {
  t: JudgmentContent;
  c: JudgmentCompetency;
  onOpenRep: (repId: string, fromCompetencyId: string) => void;
}) {
  const ex = judgmentData.explainers[c.id];
  const reps = c.reps ?? [];
  if (!ex && reps.length === 0) return null;
  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* The drill sits ABOVE the explainer, not beside it. Before, the explainer
          was a w-full <details> first in a flex-wrap row, so opening 三分鐘搞懂
          expanded a full article and shoved the drill button off the screen —
          the reader lost the action by taking the first step toward it. */}
      {reps.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {reps.map((repId, i) => (
            <button
              key={repId}
              type="button"
              onClick={() => onOpenRep(repId, c.id)}
              className="inline-flex min-h-11 items-center rounded-lg bg-pine px-3.5 text-xs font-semibold text-paper transition-colors hover:bg-pine-deep"
            >
              {reps.length > 1 ? `${t.gaps.cta}（第 ${i + 1} 題）` : t.gaps.cta} →
            </button>
          ))}
        </div>
      )}
      {ex && (
        <details>
          {/* Solid only when there is no drill to outrank it: one filled button per card. */}
          <summary
            className={`inline-flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3.5 text-xs transition-colors ${
              reps.length > 0
                ? 'border border-pine/40 font-medium text-pine hover:border-pine'
                : 'bg-pine font-semibold text-paper hover:bg-pine-deep'
            }`}
          >
            {t.gaps.explainerSummary}
          </summary>
          <div className="mt-3 border-t border-line pt-3">
            <AsOfNote template={t.gaps.explainerAsOf} date={ex.meta.as_of} className="mb-3" />
            {ex.sections.map((sec, i) => (
              <div key={i} className="mt-4 first:mt-0">
                {sec.h && <h5 className="text-sm font-semibold text-pine-deep">{sec.h}</h5>}
                <JudgmentMarkdown text={sec.body} className="mt-1.5" />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function KnowledgeMap({
  t,
  bg,
  assessment,
  onOpenRep,
}: {
  t: JudgmentContent;
  bg: BackgroundKey | null;
  assessment: ReturnType<typeof assess>;
  /** Jump straight into the drill that exercises this competency. */
  onOpenRep: (repId: string, fromCompetencyId: string) => void;
}) {
  const families = judgmentData.graph.job_families;
  const byFamily = new Map<string, JudgmentCompetency[]>(families.map((f) => [f.id, []]));
  for (const c of judgmentData.graph.competencies) {
    if (!byFamily.has(c.family)) byFamily.set(c.family, []);
    byFamily.get(c.family)!.push(c);
  }
  const financeCount = judgmentData.graph.competencies.filter((c) => c.finance_bridge).length;

  const statusOf = (id: string): keyof typeof STATUS_EDGE => {
    if (!bg) return 'none';
    if (assessment.have.has(id)) return 'have';
    if (assessment.maybe.has(id)) return 'maybe';
    return 'gap';
  };

  return (
    <section className="pt-8">
      <h2 className="text-2xl font-semibold">{t.map.title}</h2>
      <p className="mt-3 text-ink-soft">{t.map.intro}</p>

      <div className="mt-5 rounded-xl border border-line bg-mist/40 p-5">
        <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{t.map.legendTitle}</p>
        <p className="mt-2 text-sm">{fill(t.map.legendBody, { n: financeCount })}</p>
        {bg && (
          <ul className="mt-3 flex flex-wrap gap-2 text-xs">
            {(['have', 'maybe', 'gap'] as const).map((s) => (
              <li key={s} className={`rounded-r px-3 py-1 ${STATUS_EDGE[s]}`}>
                {t.map.statuses[s]}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* The route view. Bands come from `prerequisites`, so this is the same
          data as the cards below, arranged by what has to come first. */}
      <div className="mt-8">
        <JudgmentMap
          competencies={judgmentData.graph.competencies}
          statusOf={statusOf}
          showStatus={Boolean(bg)}
          onOpenRep={onOpenRep}
          cardHrefFor={(id) => `#${id}`}
          labels={{
            depths: t.map.depths,
            statuses: t.map.statuses,
            tierCount: t.map.tierCount,
            readyNow: t.map.readyNow,
            needFirst: t.map.needFirst,
            prereqsMet: t.map.prereqsMet,
            unlocks: t.map.unlocks,
            openCard: t.map.openCard,
            cartographicNote: t.map.cartographicNote,
            overviewTitle: t.map.overviewTitle,
            overviewHint: t.map.overviewHint,
            legendHub: t.map.legendHub,
            legendTerminus: t.map.legendTerminus,
            legendFinance: t.map.legendFinance,
            isolatedNote: t.map.isolatedNote,
            startTitle: t.map.startTitle,
            opensN: t.map.opensN,
            opensNone: t.map.opensNone,
            routeTitle: t.map.routeTitle,
            routeCount: t.map.routeCount,
            roleUp: t.map.roleUp,
            roleFocus: t.map.roleFocus,
            roleDown: t.map.roleDown,
            financeTag: t.gaps.financeTag,
            sustainabilityTag: t.gaps.sustainabilityTag,
            drill: t.gaps.cta,
          }}
        />
      </div>

      {families.map((f) => {
        const list = (byFamily.get(f.id) ?? []).slice().sort((a, b) => depthOf(a.id) - depthOf(b.id));
        if (!list.length) return null;
        return (
          <div key={f.id} className="mt-8">
            <h3 className="text-lg font-semibold">{f.name_zh}</h3>
            <p className="mt-1.5 text-sm text-ink-soft">{f.what_you_do}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {list.map((c) => {
                // Was Math.min(depthOf(c.id), 2), which collapsed the deepest tier
                // into the one above it: GC-031/032/033 read 「需要兩塊」 with the
                // same ●●● as depth 2, so the card list contradicted the map.
                const d = depthOf(c.id);
                return (
                  <div
                    key={c.id}
                    id={c.id}
                    className={`min-w-0 scroll-mt-20 rounded-r-lg px-3 py-2.5 transition-shadow [&:target]:ring-2 [&:target]:ring-pine ${STATUS_EDGE[statusOf(c.id)]}`}
                  >
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
                      <span aria-hidden className="tracking-widest">
                        {'●'.repeat(d + 1)}
                        {'○'.repeat(Math.max(0, t.map.depths.length - 1 - d))}
                      </span>
                      <span>
                        {t.map.depthLabel}
                        {t.map.depths[d]}
                      </span>
                      <SideTag t={t} finance={c.finance_bridge} />
                      {bg && <span>{t.map.statuses[statusOf(c.id) as 'have' | 'maybe' | 'gap']}</span>}
                    </p>
                    <p className="mt-1.5 text-sm">{c.name_zh}</p>
                    {/* Every card ends in a next action. The map used to state a
                        status and stop there, which told a reader they had a gap
                        without telling them where to start on it. */}
                    <MapCardActions t={t} c={c} onOpenRep={onOpenRep} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
