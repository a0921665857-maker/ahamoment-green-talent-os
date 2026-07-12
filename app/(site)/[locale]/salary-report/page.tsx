import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { salaryReports } from '@/content/salaryReport';
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
  const r = salaryReports[locale as Locale];
  return { title: r.meta.title, description: r.meta.description };
}

export default async function SalaryReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const r = salaryReports[L];

  const mriHref = `/${L}/mri?utm_source=salary_report&utm_medium=lead_magnet&utm_content=on_site`;

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
        {/* header */}
        <p className="text-xs uppercase tracking-eyebrow text-pine">{r.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{r.title}</h1>
        <p className="mt-5 text-lg text-ink-soft">{r.lede}</p>
        <p className="mt-6 border-t border-line pt-4 text-xs text-ink-soft">{r.byline}</p>

        {/* opening scene */}
        <blockquote className="mt-10 border-l-2 border-pine pl-5 text-lg leading-relaxed">
          {r.scene}
          <span className="mt-3 block font-medium text-pine">{r.scenePunch}</span>
        </blockquote>

        {/* headline stats */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {r.stats.map((s, i) => (
            <div key={i} className="rounded-xl bg-mist/50 px-5 py-5">
              <div
                className={`text-3xl font-semibold tabular-nums ${s.gold ? 'text-band-emerging' : 'text-pine'}`}
              >
                {s.fig}
              </div>
              <div className="mt-2 text-sm text-ink-soft">{s.cap}</div>
            </div>
          ))}
        </div>

        {/* findings */}
        <h2 className="mt-14 text-2xl font-semibold">{r.findingsTitle}</h2>
        <div className="mt-6 grid gap-4">
          {r.findings.map((f, i) => (
            <div key={i} className="rounded-xl border border-line bg-paper p-6">
              <span className="text-xs font-semibold uppercase tracking-eyebrow text-pine">{f.tag}</span>
              <h3 className="mt-2 text-lg font-semibold leading-snug">{f.head}</h3>
              <p className="mt-2 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>

        {/* Singapore bands */}
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
              {r.sgTable.rows.map((row, i) => (
                <tr key={i} className="border-t border-line align-top">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-medium' : 'tabular-nums text-ink-soft'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-line">
                <td colSpan={r.sgTable.head.length} className="px-4 py-3 text-sm text-ink-soft">
                  {r.sgStartupNote}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-ink-soft">{r.sgTrend}</p>

        {/* Taiwan comparison */}
        <h2 className="mt-14 text-2xl font-semibold">{r.twTitle}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[480px] text-sm">
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
              {r.twTable.rows.map((row, i) => (
                <tr key={i} className="border-t border-line align-top">
                  {row.map((cell, j) => (
                    <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-medium' : 'tabular-nums text-ink-soft'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-ink-soft">{r.multiples}</p>
        <div className="mt-5 rounded-xl bg-mist/50 px-5 py-5 text-sm text-ink-soft">{r.caveat}</div>

        {/* HK / JP */}
        <h2 className="mt-14 text-2xl font-semibold">{r.hkjpTitle}</h2>
        <p className="mt-4 text-ink-soft">{r.hk}</p>
        <p className="mt-4 text-ink-soft">{r.jp}</p>

        {/* skill combos */}
        <h2 className="mt-14 text-2xl font-semibold">{r.skillTitle}</h2>
        <p className="mt-3 text-ink-soft">{r.skillIntro}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {r.skills.map((s, i) => (
            <div key={i} className="rounded-xl border border-line bg-paper p-6">
              <span className="text-xs font-semibold uppercase tracking-eyebrow text-pine">{s.tag}</span>
              <h3 className="mt-2 font-semibold">{s.head}</h3>
              <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>

        {/* actions */}
        <h2 className="mt-14 text-2xl font-semibold">{r.actionsTitle}</h2>
        <ol className="mt-6 grid gap-4">
          {r.actions.map((a, i) => (
            <li key={i} className="flex gap-4 rounded-xl border border-line bg-paper p-6">
              <span className="shrink-0 text-2xl font-semibold tabular-nums text-pine">{i + 1}</span>
              <div>
                <p className="font-semibold">{a.head}</p>
                <p className="mt-1 text-sm text-ink-soft">{a.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* CTA to free MRI */}
        <section className="mt-16 rounded-2xl bg-pine px-7 py-9 text-paper">
          <p className="text-xs uppercase tracking-eyebrow text-paper/70">{r.ctaEyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug">{r.ctaTitle}</h2>
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
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[460px] text-sm">
              <tbody>
                {r.sources.map((s, i) => (
                  <tr key={i} className="border-t border-line first:border-t-0 align-top">
                    <td className="px-4 py-2.5 font-medium tabular-nums">{s.code}</td>
                    <td className="px-4 py-2.5">{s.name}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{s.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <p className="mt-10 border-t border-line pt-6 text-xs text-ink-soft">{r.footer}</p>
      </article>
    </div>
  );
}
