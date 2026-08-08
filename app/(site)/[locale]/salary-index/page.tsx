import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { LINE_OA_URL, LOCALES, type Locale } from '@/lib/constants';
import {
  fnLabels,
  marketLabels,
  MIN_N,
  publishable,
  salaryCells,
  salaryIndexMeta,
  seniorityLabels,
  type Market,
} from '@/content/salaryIndex';
import { salaryIndexCopy } from '@/content/salaryIndexCopy';
import { PageViewPing } from '@/components/PageViewPing';
import { ScrollDepth } from '@/components/ScrollDepth';
import { alternatesFor } from '@/lib/seoAlternates';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = salaryIndexCopy[locale];
  return {
    title: t.title,
    description: t.intro.slice(0, 155),
    alternates: alternatesFor(locale as Locale, '/salary-index'),
  };
}

function money(n: number, currency: string): string {
  return `${currency} ${n.toLocaleString('en-US')}`;
}

export default async function SalaryIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const t = salaryIndexCopy[L];
  const markets: Market[] = ['SG', 'HK', 'UK'];
  const published = salaryCells.filter(publishable).length;

  return (
    <div className="min-h-screen">
      <PageViewPing name="salary_index_viewed" props={{ locale: L, published }} />
      <ScrollDepth surface="salary_index" extra={{ locale: L }} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">{t.title}</h1>
        <p className="mt-4 max-w-2xl text-ink-soft">{t.intro}</p>

        {/* The honesty numbers, above the table rather than in a footnote. */}
        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { k: L === 'zh-TW' ? '總觀測' : 'Observations', v: salaryIndexMeta.totalObservations },
            { k: L === 'zh-TW' ? '進到格子裡' : 'In cells', v: salaryIndexMeta.postingsInCells },
            { k: L === 'zh-TW' ? '已達門檻格' : `Cells at n≥${MIN_N}`, v: published },
            {
              k: L === 'zh-TW' ? '排除（年資不明／實習／重複）' : 'Excluded',
              v:
                salaryIndexMeta.excludedUnknownSeniority +
                salaryIndexMeta.excludedInternship +
                salaryIndexMeta.excludedDuplicate,
            },
          ].map((s) => (
            <div key={s.k} className="rounded-xl border border-line bg-paper px-4 py-3">
              <dd className="text-2xl font-semibold tabular-nums">{s.v}</dd>
              <dt className="mt-1 text-xs text-ink-soft">{s.k}</dt>
            </div>
          ))}
        </dl>
        {/* The freshness claim and the date that proves it, in one line. The
            eyebrow used to promise 「每週更新」 with nothing beside it to check
            the promise against, and the promise outlived the fact by a week. */}
        <p className="mt-3 max-w-[35rem] text-xs text-ink-soft">
          {t.updatedLine.replace('{date}', salaryIndexMeta.exportedOn)}
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          {L === 'zh-TW' ? '職缺刊登日期範圍' : 'Postings seen between'} {salaryIndexMeta.firstSeen} →{' '}
          {salaryIndexMeta.lastSeen}
        </p>

        <section className="mt-12">
          {/* All seven of this page's section headings are siblings of each
              other — same DOM level, same job: they open a top-level block of
              the page. They shipped at three different sizes (20 / 18 / 16px),
              which made the reader guess at a hierarchy that does not exist,
              and the last one was the same size as body copy. They are now all
              at the house section size, 24px (cost-of-living, levelup,
              salary-report and jobs already ship it). The h1 above stays 36px,
              so the page still has a clear top. */}
          <h2 className="text-2xl font-semibold">{t.methodTitle}</h2>
          {/* Same 35rem ruler the prose on this page already uses. Unconstrained,
              these numbered items ran the full 720px column — 32 zh characters a
              line against the 20-ish the paragraphs beside them were holding. */}
          <ol className="mt-4 max-w-[35rem] space-y-3">
            {t.method.map((m, i) => (
              <li key={m} className="flex gap-3 text-sm">
                <span className="shrink-0 font-medium text-pine tabular-nums">{i + 1}.</span>
                <span className="text-ink-soft">{m}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 max-w-[35rem] border-l-2 border-pine pl-4 text-sm text-ink-soft">
            {t.methodExtra}
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{t.tableTitle}</h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">{t.tableNote}</p>

          {markets.map((m) => {
            const rows = salaryCells.filter((c) => c.market === m);
            if (rows.length === 0) return null;
            return (
              <div key={m} className="mt-8">
                <h3 className="text-sm font-semibold">
                  {marketLabels[L][m]}
                  <span className="ml-2 font-normal text-ink-soft">
                    n={salaryIndexMeta.byMarket[m]}
                  </span>
                </h3>
                <div className="mt-3 overflow-x-auto rounded-xl border border-line">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="bg-mist/40 text-left text-xs uppercase tracking-eyebrow text-ink-soft">
                        <th className="px-4 py-2 font-medium">{t.colFunction}</th>
                        <th className="px-4 py-2 font-medium">{t.colSeniority}</th>
                        <th className="px-4 py-2 text-right font-medium">{t.colN}</th>
                        <th className="px-4 py-2 font-medium">{t.colBand}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((c) => {
                        const ok = publishable(c);
                        return (
                          <tr key={`${c.fn}-${c.seniority}`} className="border-t border-line">
                            <td className="px-4 py-2.5">{fnLabels[L][c.fn]}</td>
                            <td className="px-4 py-2.5 text-ink-soft">{seniorityLabels[L][c.seniority]}</td>
                            <td className="px-4 py-2.5 text-right tabular-nums">{c.n}</td>
                            <td className="px-4 py-2.5">
                              {ok ? (
                                <span className="tabular-nums">
                                  <span className="font-medium">
                                    {money(c.p25!, c.currency)} – {money(c.p75!, c.currency)}
                                  </span>
                                  <span className="ml-1 text-xs font-normal text-ink-soft">
                                    /{c.period === 'monthly' ? (L === 'zh-TW' ? '月' : 'mo') : L === 'zh-TW' ? '年' : 'yr'}
                                  </span>
                                  <span className="ml-2 block text-xs font-normal text-ink-soft">
                                    {L === 'zh-TW' ? '中位數' : 'median'} {money(c.median!, c.currency)}
                                  </span>
                                </span>
                              ) : (
                                <span className="text-ink-soft">
                                  {t.notEnough.replace('{n}', String(MIN_N - c.n))}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </section>

        <section className="mt-12 rounded-xl border border-line bg-mist/20 px-5 py-5">
          <h2 className="text-2xl font-semibold">{t.coverageTitle}</h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">{t.coverageBody}</p>
        </section>

        <section className="mt-6 rounded-xl border border-line bg-mist/20 px-5 py-5">
          <h2 className="text-2xl font-semibold">{t.gapTitle}</h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">{t.gapBody}</p>
        </section>

        <section className="mt-12 rounded-xl border-2 border-pine bg-sage-soft/30 p-6">
          <h2 className="text-2xl font-semibold">{t.contributeTitle}</h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink">{t.contributeBody}</p>
          <a
            href={LINE_OA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
          >
            {t.contributeCta}
          </a>
        </section>

        <section className="mt-12 border-t border-line pt-8">
          <h2 className="text-2xl font-semibold">{t.taiwanTitle}</h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">{t.taiwanBody}</p>
          <a
            href={`/${L}/mri?utm_source=salary_index&utm_medium=footer`}
            className="mt-4 inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper"
          >
            {L === 'zh-TW' ? '做一次免費 MRI' : 'Run the free MRI'}
          </a>
        </section>

        <section className="mt-10 rounded-xl border border-line px-5 py-5">
          <h2 className="text-2xl font-semibold">{t.nextTitle}</h2>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">{t.nextBody}</p>
          <a
            href={`/${L}/services?utm_source=salary_index&utm_medium=offer_read`}
            className="mt-3 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
          >
            {t.nextCta} →
          </a>
        </section>
      </main>
    </div>
  );
}
