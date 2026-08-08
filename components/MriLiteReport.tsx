import type { ReactNode } from 'react';
import { REPORT_SECTION_KEYS, type Band, type Locale, type MbaIntent, type ReportSectionKey } from '@/lib/constants';
import type { Bands, ReportSections } from '@/lib/types';
import type { ReportTemplatesContent } from '@/content/schema';
import { isNonApplicantIntent } from '@/lib/reportView';

/** Which sections carry a band chip, and which band drives each (FREE_REPORT_STRATEGY.md). */
const SECTION_BAND: Partial<Record<ReportSectionKey, keyof Bands>> = {
  green_career_fit: 'green_economy_fit',
  mba_readiness: 'mba_index',
  commercial_clarity: 'commercial_credibility',
  international_positioning: 'international_positioning',
  interview_readiness: 'interview_readiness',
  cv_readiness: 'cv_readiness',
};

const BAND_CLASS: Record<Band, string> = {
  emerging: 'bg-band-emerging text-pine-deep',
  developing: 'bg-band-developing text-paper',
  strong: 'bg-band-strong text-paper',
};

export function MriLiteReport(props: {
  locale: Locale;
  name: string | null;
  sections: ReportSections['sections'];
  bands: Bands;
  limitedData: boolean;
  templates: ReportTemplatesContent;
  dateLabel: string;
  mbaIntent?: MbaIntent;
  /** Optional CTA card injected after the second section (placement experiment). */
  inlineCta?: ReactNode;
  /**
   * The answer, on screen one (UX audit 2026-08-08). The result type used to
   * appear for the first time on screen 10.4 of 13.3 — after the conversion
   * zone — so readers were asked to decide before they had been told anything
   * about themselves. `fact` is a deterministic restatement of the reader's own
   * material (see profileFacts.ts); it is deliberately NOT the share-card line,
   * which is identical for everyone with the same type.
   */
  typeSummary?: { eyebrow: string; label: string; fact: string | null };
  /** Slot after the first section — used for the mobile save-this-link rail, so
   * it stops occupying the first screen above the report's own title. */
  afterFirstSection?: ReactNode;
}) {
  const t = props.templates;
  const nonApplicant = isNonApplicantIntent(props.mbaIntent);
  const titleFor = (key: ReportSectionKey) =>
    key === 'mba_readiness' && nonApplicant ? t.nextMoveReadinessTitle : t.sections[key].title;

  return (
    <article className="mx-auto max-w-2xl">
      <header className="border-b border-line pb-8">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{t.reportTitle}</p>
        <h1 className="mt-3 text-3xl font-semibold">{t.reportSubtitle}</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {props.name ? `${t.preparedFor.replace('{name}', props.name)} · ` : ''}
          {t.generatedOn.replace('{date}', props.dateLabel)}
        </p>
        {props.typeSummary && (
          /* No emoji here on purpose: UX_PRINCIPLES #7 bans emoji in product UI.
             The motif on the shareable card at the foot of the page is the one
             exception (it is a screenshot leaving the site), not a precedent. */
          <div className="mt-5 rounded-xl border border-pine/40 bg-sage-soft/25 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-eyebrow text-pine">
              {props.typeSummary.eyebrow}
            </p>
            <p className="mt-2 text-2xl font-semibold leading-snug">{props.typeSummary.label}</p>
            {props.typeSummary.fact && (
              <p className="mt-3 max-w-[35rem] text-[15px] leading-relaxed text-ink">
                {props.typeSummary.fact}
              </p>
            )}
          </div>
        )}
        {props.limitedData && (
          <p className="mt-5 rounded border border-line bg-mist px-4 py-3 text-sm text-ink-soft">
            {t.limitedDataNote}
          </p>
        )}
      </header>

      <div className="divide-y divide-line">
        {REPORT_SECTION_KEYS.map((key, i) => {
          const section = props.sections[key];
          if (!section) return null;
          const bandKey = SECTION_BAND[key];
          const band = bandKey ? props.bands[bandKey] : undefined;
          return (
            <section key={key} className="py-7">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3">
                  <span className="text-sm tabular-nums text-pine">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-xl font-semibold sm:text-2xl">{titleFor(key)}</h2>
                </div>
                {bandKey &&
                  (band ? (
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${BAND_CLASS[band]}`}
                    >
                      {t.bandLabels[band]}
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs text-ink-soft">
                      {t.notEnoughSignal}
                    </span>
                  ))}
              </div>
              <p className="mt-3 leading-relaxed text-ink">{section.body}</p>
              {i === 0 && props.afterFirstSection}
              {i === 1 && props.inlineCta}
            </section>
          );
        })}
      </div>

      <footer className="mt-10 max-w-[35rem] border-t border-line pt-6 text-sm text-ink-soft">
        <p>{t.footer.returnNote}</p>
        <p className="mt-2">{t.footer.confidentiality}</p>
        <p className="mt-2">{t.footer.deleteLine}</p>
      </footer>
    </article>
  );
}
