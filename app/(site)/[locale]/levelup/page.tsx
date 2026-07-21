import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { levelupReports } from '@/content/levelup';
import { newsletterCopy } from '@/content/newsletter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NewsletterSignup } from '@/components/NewsletterSignup';

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
  const r = levelupReports[locale as Locale];
  return { title: r.meta.title, description: r.meta.description };
}

export default async function LevelupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const r = levelupReports[L];

  const mriHref = `/${L}/mri?utm_source=levelup&utm_medium=lead_magnet&utm_content=on_site`;
  const prequelHref = `/${L}/salary-report?utm_source=levelup&utm_medium=cross_link`;

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

        {/* one-line verdict */}
        <div className="mt-8 rounded-xl border-l-2 border-pine bg-sage-soft/40 px-6 py-5 font-medium leading-relaxed">
          {r.verdict}
        </div>

        {/* opening scene */}
        <blockquote className="mt-10 border-l-2 border-pine pl-5 text-lg leading-relaxed">
          <span className="block text-xs uppercase tracking-eyebrow text-ink-soft">{r.sceneTag}</span>
          <span className="mt-2 block">{r.scene}</span>
          <span className="mt-3 block font-medium text-pine">{r.scenePunch}</span>
        </blockquote>

        {/* headline stat */}
        <div className="mt-10 rounded-xl border border-band-emerging/50 bg-mist/50 px-6 py-6">
          <div className="text-4xl font-semibold tabular-nums text-band-emerging">{r.bigstat.fig}</div>
          <p className="mt-3">{r.bigstat.cap}</p>
          <p className="mt-2 text-xs text-ink-soft">{r.bigstat.src}</p>
        </div>

        {/* 01 premium ladder */}
        <h2 className="mt-14 text-2xl font-semibold">{r.s1Title}</h2>
        <p className="mt-3 text-ink-soft">{r.s1Intro}</p>
        <div className="mt-6 grid gap-5">
          {r.rungs.map((rung, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-semibold">{rung.name}</span>
                <span
                  className={`whitespace-nowrap text-sm font-semibold tabular-nums ${
                    rung.width ? 'text-band-emerging' : 'text-ink-soft'
                  }`}
                >
                  {rung.val}
                </span>
              </div>
              {rung.width ? (
                <div className="mt-2 h-6 overflow-hidden rounded-md border border-line bg-mist/40">
                  <div className="h-full rounded-md bg-band-emerging/80" style={{ width: `${rung.width}%` }} />
                </div>
              ) : (
                <div className="mt-2 flex h-6 items-center rounded-md border border-dashed border-band-emerging/60 bg-mist/30 px-3">
                  <span className="text-xs text-ink-soft">{rung.flag}</span>
                </div>
              )}
              <p className="mt-1.5 text-xs text-ink-soft">{rung.src}</p>
            </div>
          ))}
        </div>

        {/* why empty */}
        <div className="mt-10 rounded-xl border border-line bg-paper p-6">
          <h3 className="font-semibold">{r.whyTitle}</h3>
          <p className="mt-2 text-sm text-ink-soft">{r.whyBody1}</p>
          <p className="mt-3 text-sm text-ink-soft">{r.whyBody2}</p>
        </div>

        {/* 02 direction */}
        <h2 className="mt-14 text-2xl font-semibold">{r.s2Title}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {r.triad.map((s, i) => (
            <div key={i} className="rounded-xl bg-mist/50 px-5 py-5">
              <div className="text-3xl font-semibold tabular-nums text-pine">{s.fig}</div>
              <div className="mt-2 text-sm text-ink-soft">{s.cap}</div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-ink-soft">{r.s2Body}</p>
        <p className="mt-2 text-xs uppercase tracking-eyebrow text-ink-soft">{r.s2Src}</p>

        {/* 03 certificates */}
        <h2 className="mt-14 text-2xl font-semibold">{r.s3Title}</h2>
        <p className="mt-3 text-ink-soft">{r.s3Intro}</p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="bg-mist/40 text-left">
                {r.certTable.head.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-xs uppercase tracking-eyebrow text-ink-soft">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.certTable.rows.map((row, i) => (
                <tr key={i} className="border-t border-line align-top">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`px-4 py-3 ${j === 0 ? 'font-medium' : j === 1 ? 'tabular-nums text-band-emerging' : 'text-ink-soft'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded-xl border border-band-emerging/50 bg-mist/50 p-6">
          <h3 className="font-semibold">{r.certBoxTitle}</h3>
          <p className="mt-2 text-sm">{r.certBoxBody1}</p>
          <p className="mt-3 text-sm text-ink-soft">{r.certBoxBody2}</p>
        </div>

        {/* 04 paths */}
        <h2 className="mt-14 text-2xl font-semibold">{r.s4Title}</h2>
        <div className="mt-6 grid gap-4">
          {r.paths.map((p, i) => (
            <div key={i} className="rounded-r-xl border border-l-2 border-line border-l-pine bg-paper p-6">
              <p className="text-xs font-semibold uppercase tracking-eyebrow text-pine">{p.who}</p>
              <h3 className="mt-2 text-lg font-semibold leading-snug">{p.head}</h3>
              <p className="mt-2 text-sm text-ink-soft">{p.body}</p>
            </div>
          ))}
        </div>

        {/* 05 proof */}
        <h2 className="mt-14 text-2xl font-semibold">{r.s5Title}</h2>
        <p className="mt-3 text-ink-soft">{r.s5Intro}</p>
        <div className="mt-6 grid gap-3">
          {r.proofs.map((p, i) => (
            <div key={i} className="rounded-xl border border-line bg-paper p-5">
              <div className="flex items-start gap-3 text-sm text-ink-soft">
                <span className="mt-0.5 shrink-0 rounded bg-mist px-2 py-0.5 text-xs font-semibold">
                  {r.proofNoLabel}
                </span>
                <span className="line-through decoration-line">{p.no}</span>
              </div>
              <div className="mt-2.5 flex items-start gap-3 text-sm font-medium">
                <span className="mt-0.5 shrink-0 rounded bg-sage-soft px-2 py-0.5 text-xs font-semibold text-pine-deep">
                  {r.proofYesLabel}
                </span>
                <span>{p.yes}</span>
              </div>
            </div>
          ))}
        </div>

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

        {/* prequel cross-link */}
        <p className="mt-8 text-sm text-ink-soft">
          {r.prequelLine}{' '}
          <a href={prequelHref} className="font-medium text-pine underline-offset-2 hover:underline">
            {r.prequelCta}
          </a>
        </p>

        {/* newsletter — capture the reader as a repeat visitor */}
        <div className="mt-8">
          <NewsletterSignup locale={L} copy={newsletterCopy[L]} source="levelup" />
        </div>

        {/* sources */}
        <details className="mt-12 border-t border-line pt-6">
          <summary className="cursor-pointer text-xs uppercase tracking-eyebrow text-pine">
            {r.sourcesLabel}
          </summary>
          <p className="mt-4 text-sm text-ink-soft">{r.method}</p>
          <p className="mt-3 rounded-lg border border-dashed border-band-emerging/60 bg-mist/40 px-4 py-3 text-sm text-ink-soft">
            {r.verify}
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[460px] text-sm">
              <tbody>
                {r.sources.map((s, i) => (
                  <tr key={i} className="border-t border-line align-top first:border-t-0">
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
