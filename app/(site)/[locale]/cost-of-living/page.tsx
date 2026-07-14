import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { costOfLiving } from '@/content/costOfLiving';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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
  const r = costOfLiving[locale as Locale];
  return { title: r.meta.title, description: r.meta.description };
}

export default async function CostOfLivingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const r = costOfLiving[L];

  const mriHref = `/${L}/mri?utm_source=cost_of_living&utm_medium=on_site&utm_content=cta`;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <div className="flex items-center gap-4">
          <a href={mriHref} className="text-sm text-pine underline-offset-2 hover:underline">
            {r.backToMri}
          </a>
          <LanguageSwitcher current={L} />
        </div>
      </nav>

      <article className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <p className="text-xs uppercase tracking-eyebrow text-pine">{r.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{r.title}</h1>
        <p className="mt-5 text-lg text-ink-soft">{r.lede}</p>
        <p className="mt-6 border-t border-line pt-4 text-xs text-ink-soft">{r.byline}</p>

        <blockquote className="mt-10 border-l-2 border-pine pl-5 text-lg leading-relaxed">
          {r.hook}
        </blockquote>

        {/* Singapore */}
        <h2 className="mt-14 text-2xl font-semibold">{r.sgTitle}</h2>
        <p className="mt-2 text-xs uppercase tracking-eyebrow text-pine">{r.sgNote}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-mist/40 text-left">
                {r.sgTable.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs uppercase tracking-eyebrow text-ink-soft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.sgTable.rows.map((row, i) => {
                const isTotal = i === r.sgTable.rows.length - 1;
                return (
                  <tr key={i} className={`border-t border-line ${isTotal ? 'bg-mist/30 font-medium' : ''}`}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3 ${j === 0 ? 'font-medium' : 'tabular-nums text-ink-soft'} ${isTotal ? 'text-ink' : ''}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-ink-soft">{r.sgAfter}</p>

        {/* Taipei */}
        <h2 className="mt-14 text-2xl font-semibold">{r.twTitle}</h2>
        <p className="mt-2 text-xs uppercase tracking-eyebrow text-pine">{r.twNote}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[460px] text-sm">
            <thead>
              <tr className="bg-mist/40 text-left">
                {r.twTable.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs uppercase tracking-eyebrow text-ink-soft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.twTable.rows.map((row, i) => {
                const isTotal = i === r.twTable.rows.length - 1;
                return (
                  <tr key={i} className={`border-t border-line ${isTotal ? 'bg-mist/30 font-medium' : ''}`}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-4 py-3 ${j === 0 ? 'font-medium' : 'tabular-nums text-ink-soft'} ${isTotal ? 'text-ink' : ''}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-ink-soft">{r.twAfter}</p>

        {/* the verdict */}
        <h2 className="mt-14 text-2xl font-semibold">{r.verdictTitle}</h2>
        <p className="mt-3 text-ink-soft">{r.verdictIntro}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-mist/40 text-left">
                {r.verdictHead.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs uppercase tracking-eyebrow text-ink-soft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.verdictRows.map((row, i) => (
                <tr key={i} className="border-t border-line align-top">
                  <td className="px-4 py-3 font-medium">{row.stage}</td>
                  <td className="px-4 py-3 tabular-nums text-ink-soft">{row.nominal}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-pine">{row.disposable}</td>
                  <td className="px-4 py-3 text-ink-soft">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* the insight */}
        <div className="mt-8 rounded-2xl border border-pine/30 bg-mist/50 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-eyebrow text-pine">{r.insightLabel}</p>
          <p className="mt-2 text-[15px] leading-[1.8]">{r.insight}</p>
        </div>

        <div className="mt-5 rounded-xl bg-mist/40 px-5 py-5 text-sm text-ink-soft">{r.caveat}</div>

        <a
          href={`/${L}/salary-report`}
          className="mt-6 inline-block text-sm font-medium text-pine underline-offset-2 hover:underline"
        >
          {r.salaryReportCta}
        </a>

        {/* CTA to free MRI */}
        <section className="mt-14 rounded-2xl bg-pine px-7 py-9 text-paper">
          <h2 className="text-2xl font-semibold leading-snug">{r.ctaTitle}</h2>
          <p className="mt-3 max-w-xl text-paper/90">{r.ctaBody}</p>
          <a
            href={mriHref}
            className="mt-6 inline-block rounded-lg bg-paper px-6 py-3 font-semibold text-pine"
          >
            {r.ctaButton}
          </a>
          <p className="mt-4 text-sm text-paper/70">{r.ctaSub}</p>
        </section>

        {/* sources */}
        <details className="mt-12 border-t border-line pt-6">
          <summary className="cursor-pointer text-xs uppercase tracking-eyebrow text-pine">
            {r.sourcesLabel}
          </summary>
          <p className="mt-4 text-sm text-ink-soft">{r.method}</p>
          <ul className="mt-4 grid gap-2">
            {r.sources.map((s) => (
              <li key={s.url} className="text-sm">
                <a
                  href={s.url}
                  target={s.url.startsWith('http') ? '_blank' : undefined}
                  rel={s.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="font-medium text-pine underline-offset-2 hover:underline"
                >
                  {s.label} {s.url.startsWith('http') ? '↗' : '→'}
                </a>
                <span className="ml-2 text-ink-soft">{s.note}</span>
              </li>
            ))}
          </ul>
        </details>

        <p className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">{r.footer}</p>
      </article>
    </div>
  );
}
