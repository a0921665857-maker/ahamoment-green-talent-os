import type { Locale } from '@/lib/constants';
import {
  anyRenderedSourceStale,
  isSgOfficialFresh,
  sgOfficial,
  type SgOfficialSource,
} from '@/content/sgOfficial';
import {
  fillSgOfficial,
  sgOfficialCopy,
  sgOfficialPeriodLabel,
  sgOfficialVars,
} from '@/content/sgOfficialCopy';

/**
 * The official data.gov.sg block on /[locale]/cost-of-living. It sits between the
 * Singapore estimate table and the Taipei section, and it is a SEPARATE section
 * on purpose. The estimate table above is one person's monthly budget; this is a
 * whole-flat median plus three macro series. Different units, different
 * provenance, so they are never merged into one table.
 *
 * WHY A RANKING, NOT A TABLE. Twenty-five rows in a table would need horizontal
 * scrolling on a 375px screen, on a page that already has three of those. A
 * vertical ranking is a normal block flow, so it costs nothing on mobile. The
 * bars are decoration and carry aria-hidden; every value is also printed as text,
 * so nothing here is conveyed by colour or length alone.
 *
 * STALENESS. Per dataset, checked at render, and it DEGRADES rather than hides:
 * marketPulse disappears when stale because a dead job link misleads, but an
 * official statistic does not become false by ageing, and every figure here
 * carries a link the reader can check. The banner only fires on the four
 * datasets actually rendered, so the discontinued foreign-workforce series
 * cannot poison it. This needs `export const revalidate` on the page, otherwise
 * the check freezes at build time and the banner never fires.
 */

const RENT_ROWS_VISIBLE = 10;

function SourceLine({
  source,
  locale,
  t,
  now,
}: {
  source: SgOfficialSource;
  locale: Locale;
  t: (typeof sgOfficialCopy)[Locale];
  now: Date;
}) {
  const fresh = isSgOfficialFresh(source.fetchedAt, now);
  return (
    <p className="mt-2 text-xs leading-relaxed text-ink-soft">
      {t.sourceLinePrefix}
      <a
        href={source.datasetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pine underline-offset-2 hover:underline"
      >
        {source.agency} · {source.datasetName} ↗
      </a>
      <span className="ml-2">
        {t.periodLabel} {source.latestPeriod} · {t.fetchedLabel} {source.fetchedAt.slice(0, 10)}
      </span>
      {!fresh && <span className="ml-2 font-medium">({locale === 'zh-TW' ? '逾期未重抓' : 'not refreshed'})</span>}
    </p>
  );
}

export function SgOfficialDataSection({ locale }: { locale: Locale }) {
  const t = sgOfficialCopy[locale];
  const vars = sgOfficialVars(locale);
  const f = (s: string) => fillSgOfficial(s, vars);

  const now = new Date();
  const stale = anyRenderedSourceStale(now);

  const { rent, cpi, income, unemployment } = sgOfficial;
  const top = rent.byTown.slice(0, RENT_ROWS_VISIBLE);
  const rest = rent.byTown.slice(RENT_ROWS_VISIBLE);

  const statSource: Record<string, SgOfficialSource> = {
    cpi: cpi.source,
    income: income.source,
    unemployment: unemployment.source,
  };

  const row = (town: (typeof rent.byTown)[number], rank: number) => (
    <li key={town.town} className="flex items-baseline gap-3 border-t border-line py-2.5">
      <span className="w-6 shrink-0 text-xs tabular-nums text-ink-soft">{rank}</span>
      <span className="min-w-0 flex-1">
        <span className="text-sm font-medium">{locale === 'zh-TW' ? town.townZh : town.town}</span>
        {locale === 'zh-TW' && <span className="ml-2 text-xs text-ink-soft">{town.town}</span>}
        <span
          aria-hidden="true"
          className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-mist"
        >
          <span
            className="block h-full rounded-full bg-pine/70"
            style={{ width: `${(town.medianRent / rent.highest) * 100}%` }}
          />
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums">
        S${town.medianRent.toLocaleString('en-US')}
      </span>
    </li>
  );

  return (
    <section className="mt-14 rounded-2xl border border-pine/30 px-5 py-7 sm:px-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-pine px-2.5 py-1 text-[11px] font-semibold uppercase tracking-eyebrow text-paper">
          {t.badgeOfficial}
        </span>
        <p className="text-xs uppercase tracking-eyebrow text-pine">{f(t.eyebrow)}</p>
      </div>

      <h2 className="mt-3 text-2xl font-semibold">{t.title}</h2>

      {stale && (
        <p className="mt-4 rounded-xl border border-line bg-mist/60 px-5 py-4 text-sm text-ink-soft">
          {f(t.staleNote)}
        </p>
      )}

      <p className="mt-4 text-ink-soft">{f(t.intro)}</p>

      {/* The unit trap, shown before the numbers so it cannot be skimmed past. */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-line bg-paper px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-ink-soft">
            {t.badgeEstimate}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{f(t.compareEstimateLabel)}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{f(t.compareEstimateValue)}</p>
          <p className="mt-1 text-xs text-ink-soft">{f(t.compareEstimateDetail)}</p>
        </div>
        <div className="rounded-lg border border-pine/40 bg-paper px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-eyebrow text-pine">
            {t.badgeOfficial}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{f(t.compareOfficialLabel)}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-pine">
            {f(t.compareOfficialValue)}
          </p>
          <p className="mt-1 text-xs text-ink-soft">{f(t.compareOfficialDetail)}</p>
        </div>
      </div>
      <p className="mt-4 text-ink-soft">{f(t.caliberWarning)}</p>

      {/* 25 towns, highest first. Vertical flow: no horizontal scroll on mobile. */}
      <p className="mt-8 text-xs uppercase tracking-eyebrow text-pine">{f(t.rentListLabel)}</p>
      <p className="mt-1 text-xs text-ink-soft">{f(t.rentUnit)}</p>
      <ol className="mt-3">{top.map((town, i) => row(town, i + 1))}</ol>
      <details className="border-t border-line">
        <summary className="cursor-pointer py-2.5 text-xs uppercase tracking-eyebrow text-pine">
          {f(t.expandLabel)}
        </summary>
        <ol>{rest.map((town, i) => row(town, i + 1 + RENT_ROWS_VISIBLE))}</ol>
      </details>
      <p className="mt-3 border-t border-line pt-3 text-xs text-ink-soft">{f(t.rentCaption)}</p>
      <SourceLine source={rent.source} locale={locale} t={t} now={now} />

      <p className="mt-6 text-ink-soft">
        <span className="mr-2 rounded bg-mist px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-eyebrow text-ink-soft">
          {t.derivedTag}
        </span>
        {f(t.reconcile)}
      </p>
      <p className="mt-4 text-ink-soft">{f(t.trendNote)}</p>

      {/* Three macro anchors. Stacked, not columned: three columns crush at max-w-3xl. */}
      <h3 className="mt-10 text-lg font-semibold">{t.statsTitle}</h3>
      <div className="mt-4 grid gap-3">
        {t.stats.map((s) => {
          const source = statSource[s.key];
          return (
            <div key={s.key} className="rounded-lg border border-line bg-paper px-4 py-4">
              <p className="text-xs text-ink-soft">{f(s.label)}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-pine">{f(s.value)}</p>
              <p className="mt-1 text-xs text-ink-soft">
                {sgOfficialPeriodLabel(source.latestPeriod, locale)} · {source.agency}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{f(s.reading)}</p>
              <SourceLine source={source} locale={locale} t={t} now={now} />
              {s.key === 'income' && (
                <a
                  href={`/${locale}/salary-report`}
                  className="mt-3 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
                >
                  {t.salaryReportLink}
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Licence attribution and non-affiliation. Required by the licence: never collapse or remove. */}
      <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
        {f(t.licenceNote)}
      </p>
    </section>
  );
}
