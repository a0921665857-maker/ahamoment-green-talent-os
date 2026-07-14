'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/constants';
import { JD_LIMITS, type JdTranslatorCopy } from '@/content/jdTranslator';
import type { JdAnalysis } from '@/lib/prompts/jdTranslate';
import { phCapture } from '@/components/PostHogProvider';
import { ProgressStages } from './ProgressStages';

type Phase = 'input' | 'analyzing' | 'result';

/** API error code → the copy key that explains it. Anything else falls back to generic. */
const ERROR_KEY: Record<string, keyof JdTranslatorCopy['errors']> = {
  rate_limited: 'rateLimited',
  too_short: 'tooShort',
  too_long: 'tooLong',
  not_a_jd: 'notAJd',
};

export interface JdTranslatorProps {
  locale: Locale;
  copy: JdTranslatorCopy;
  mriHref: string;
}

/**
 * JD 翻譯器 — paste a JD, get a practitioner's read. Posts to /api/jd/translate,
 * which never stores the JD (the privacy line on the page is a real promise).
 */
export function JdTranslator({ locale, copy, mriHref }: JdTranslatorProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [jd, setJd] = useState('');
  const [analysis, setAnalysis] = useState<JdAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const count = jd.trim().length;
  const ready = count >= JD_LIMITS.minChars && count <= JD_LIMITS.maxChars;

  async function handleSubmit() {
    if (!ready) {
      setError(count > JD_LIMITS.maxChars ? copy.errors.tooLong : copy.errors.tooShort);
      return;
    }
    setError(null);
    setPhase('analyzing');
    phCapture('jd_translate_submitted', { locale, chars: count });

    try {
      const res = await fetch('/api/jd/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ locale, jd: jd.trim() }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        const key = ERROR_KEY[body.error ?? ''] ?? 'generic';
        setError(copy.errors[key]);
        setPhase('input');
        return;
      }
      const data = (await res.json()) as { analysis: JdAnalysis };
      setAnalysis(data.analysis);
      setPhase('result');
      phCapture('jd_translate_succeeded', { locale });
    } catch {
      setError(copy.errors.generic);
      setPhase('input');
    }
  }

  function reset() {
    setAnalysis(null);
    setError(null);
    setJd('');
    setPhase('input');
  }

  if (phase === 'analyzing') {
    return (
      <ProgressStages
        title={copy.progress.title}
        stages={copy.progress.stages}
        note={copy.progress.note}
      />
    );
  }

  if (phase === 'result' && analysis) {
    return (
      <Result analysis={analysis} copy={copy} locale={locale} mriHref={mriHref} onReset={reset} />
    );
  }

  return (
    <div className="mt-8">
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-line bg-mist px-4 py-3 text-sm text-ink"
        >
          {error}
        </p>
      )}

      <label htmlFor="jd-input" className="block text-sm font-medium">
        {copy.form.label}
      </label>
      <textarea
        id="jd-input"
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder={copy.form.placeholder}
        rows={12}
        className="mt-2 w-full resize-y rounded-lg border border-line bg-paper px-4 py-3 text-ink outline-none focus:border-pine"
      />
      <p className="mt-1 text-right text-xs text-ink-soft">
        {copy.form.charCount.replace('{count}', String(count))}
      </p>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!ready}
        className="mt-4 rounded-lg bg-pine px-6 py-3 font-semibold text-paper transition-opacity disabled:opacity-40"
      >
        {copy.form.submit}
      </button>
      {!ready && <p className="mt-2 text-xs text-ink-soft">{copy.form.hint}</p>}

      <p className="mt-6 rounded-xl border border-line bg-mist/40 px-5 py-4 text-sm text-ink-soft">
        {copy.privacyNote}
      </p>
    </div>
  );
}

/* --------------------------------- result --------------------------------- */

function Result({
  analysis,
  copy,
  locale,
  mriHref,
  onReset,
}: {
  analysis: JdAnalysis;
  copy: JdTranslatorCopy;
  locale: Locale;
  mriHref: string;
  onReset: () => void;
}) {
  const r = copy.result;
  const a = analysis;
  // Quote marks follow the locale — 「」 in zh-TW, curly quotes in English.
  const [openQ, closeQ] = locale === 'zh-TW' ? ['「', '」'] : ['“', '”'];

  return (
    <div className="mt-8">
      {/* what this role actually is */}
      <section className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{r.roleReadTitle}</p>
        <h2 className="mt-3 text-xl font-semibold leading-snug sm:text-2xl">
          {a.role_read.plain_title}
        </h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <Meta label={r.seniorityLabel} value={r.seniorityNames[a.role_read.seniority]} />
          <Meta label={r.laneLabel} value={a.role_read.real_lane} />
          <Meta label={r.marketLabel} value={a.role_read.market} />
        </dl>
      </section>

      {/* 1. hard skills */}
      <Section title={r.skillsTitle} note={r.skillsNote}>
        <ul className="space-y-5">
          {a.hard_skills.map((s, i) => (
            <li key={i} className="border-l-2 border-pine pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-semibold">{s.skill}</h4>
                <span
                  className={
                    s.must_have
                      ? 'rounded-full bg-pine px-2.5 py-0.5 text-[11px] font-medium text-paper'
                      : 'rounded-full border border-line px-2.5 py-0.5 text-[11px] font-medium text-ink-soft'
                  }
                >
                  {s.must_have ? r.mustHave : r.niceToHave}
                </span>
              </div>
              {s.jd_phrase && (
                <p className="mt-1.5 text-xs text-ink-soft">
                  <span className="uppercase tracking-eyebrow">{r.jdSaysLabel}</span>{' '}
                  <span className="italic">
                    {openQ}
                    {s.jd_phrase}
                    {closeQ}
                  </span>
                </p>
              )}
              <p className="mt-2 text-[15px] leading-[1.8] text-ink">{s.bar}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 2. what it isn't saying */}
      <Section title={r.unspokenTitle} note={r.unspokenNote}>
        <ul className="space-y-5">
          {a.unspoken.map((u, i) => (
            <li key={i} className="rounded-xl bg-mist/50 px-5 py-4">
              <p className="text-xs text-ink-soft">
                <span className="uppercase tracking-eyebrow text-pine">{r.signalLabel}</span>{' '}
                {u.signal}
              </p>
              <p className="mt-2 text-[15px] leading-[1.8] text-ink">
                <span className="text-xs uppercase tracking-eyebrow text-pine">
                  {r.readingLabel}
                </span>{' '}
                {u.reading}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 3. evidence to prepare */}
      <Section title={r.evidenceTitle} note={r.evidenceNote}>
        <ul className="space-y-5">
          {a.evidence.map((e, i) => (
            <li key={i} className="border-l-2 border-sage pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-[15px] font-semibold">{e.item}</h4>
                <span className="rounded-full border border-sage bg-sage-soft px-2.5 py-0.5 text-[11px] font-medium text-pine-deep">
                  {r.whereNames[e.where]}
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-[1.8] text-ink">{e.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4. salary — always a flagged range */}
      <Section title={r.salaryTitle}>
        <div className="rounded-xl bg-mist/50 px-5 py-5">
          <p className="text-lg font-semibold tabular-nums text-pine">{a.salary.range}</p>
          <p className="mt-3 text-sm leading-[1.8] text-ink">
            <span className="text-xs uppercase tracking-eyebrow text-ink-soft">
              {r.salaryBasisLabel}
            </span>{' '}
            {a.salary.basis}
          </p>
          <p className="mt-3 text-xs text-ink-soft">
            <span className="uppercase tracking-eyebrow">{r.salaryConfidenceLabel}</span>{' '}
            {r.confidenceNames[a.salary.confidence]}
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-ink-soft">{r.salaryDisclaimer}</p>
      </Section>

      {/* 5. who fits, who misfires */}
      <Section title={r.fitTitle}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border border-line bg-paper p-5">
            <p className="text-xs uppercase tracking-eyebrow text-pine">{r.goodFitLabel}</p>
            <ul className="mt-3 space-y-2.5">
              {a.fit.good_fit.map((f, i) => (
                <li key={i} className="text-[15px] leading-[1.8] text-ink">
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-mist/50 p-5">
            <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{r.misfireLabel}</p>
            <ul className="mt-3 space-y-2.5">
              {a.fit.misfire.map((f, i) => (
                <li key={i} className="text-[15px] leading-[1.8] text-ink">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 border-l-2 border-line pl-4">
          <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{r.misfireWhyLabel}</p>
          <p className="mt-2 text-[15px] leading-[1.8] text-ink">{a.fit.misfire_why}</p>
        </div>
      </Section>

      {/* where it sits on the green map */}
      <Section title={r.greenAngleTitle}>
        <p className="text-[15px] leading-[1.8] text-ink">{a.green_angle}</p>
      </Section>

      {/* the point of the whole tool */}
      <section className="mt-12 rounded-2xl bg-pine px-7 py-9 text-paper">
        <h2 className="text-2xl font-semibold leading-snug">{r.ctaTitle}</h2>
        <p className="mt-3 max-w-xl text-paper/90">{r.ctaBody}</p>
        <a
          href={mriHref}
          onClick={() => phCapture('cta_clicked', { locale, source: 'jd_translator_result' })}
          className="mt-6 inline-block rounded-lg bg-paper px-6 py-3 font-semibold text-pine"
        >
          {r.ctaButton}
        </a>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-pine hover:text-pine"
        >
          {copy.form.reset}
        </button>
        <p className="text-xs text-ink-soft">{copy.privacyNote}</p>
      </div>
    </div>
  );
}

/* --------------------------------- pieces --------------------------------- */

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h3 className="border-b border-line pb-3 text-xl font-semibold tracking-tight">{title}</h3>
      {note && <p className="mt-3 text-sm text-ink-soft">{note}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-eyebrow text-ink-soft">{label}</dt>
      <dd className="mt-1.5 text-sm leading-relaxed text-ink">{value}</dd>
    </div>
  );
}
