import { REPORT_SECTION_KEYS, type Band, type Locale, type MbaIntent, type ReportSectionKey } from '@/lib/constants';
import type { Bands, ReportSections } from '@/lib/types';
import type { ReportTemplatesContent } from '@/content/schema';

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
}) {
  const t = props.templates;
  const nonApplicant = props.mbaIntent === 'no' || props.mbaIntent === 'current';
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
                  <h2 className="text-lg font-semibold">{titleFor(key)}</h2>
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
            </section>
          );
        })}
      </div>

      <footer className="mt-10 border-t border-line pt-6 text-sm text-ink-soft">
        <p>{t.footer.returnNote}</p>
        <p className="mt-2">{t.footer.confidentiality}</p>
        <p className="mt-2">{t.footer.deleteLine}</p>
      </footer>
    </article>
  );
}
