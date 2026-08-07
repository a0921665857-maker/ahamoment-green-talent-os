import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { judgmentData } from '@/lib/judgment';
import { JudgmentApp } from '@/components/JudgmentApp';
import { PageViewPing } from '@/components/PageViewPing';
import { ScrollDepth } from '@/components/ScrollDepth';
import { alternatesFor } from '@/lib/seoAlternates';

/**
 * 綠領判斷力 — on-site, in the site's own design system.
 *
 * The frame (nav, header, beta bar, about, footer) renders on the server so the
 * page has real content for crawlers and for a reader with JS still loading.
 * The interactive half is `components/JudgmentApp.tsx`, which imports the
 * competency data directly: that keeps 390KB of explainers and answers out of
 * the HTML document, which matters here because the product's whole claim is
 * that the answer is not in the page until you have committed to one.
 */

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
  const t = getContent(locale as Locale).judgment;
  return {
    title: t.meta.title,
    description: t.meta.description,
    alternates: alternatesFor(locale as Locale, '/judgment'),
  };
}

export default async function JudgmentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const t = c.judgment;
  const counts = judgmentData.counts;
  const identity = judgmentData.identity;

  const mriHref = `/${L}/mri?utm_source=judgment&utm_medium=cross_link`;
  const betaMail = identity.email
    ? `mailto:${identity.email}?subject=${encodeURIComponent(t.beta.mailSubject)}`
    : null;

  return (
    <div className="min-h-screen">
      <PageViewPing name="judgment_page_viewed" props={{ locale: L }} />
      <ScrollDepth surface="judgment" extra={{ locale: L }} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <a href={mriHref} className="text-sm text-pine underline-offset-2 hover:underline">
          {t.backLink}
        </a>
        <p className="mt-6 text-xs uppercase tracking-eyebrow text-pine">{t.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-balance sm:text-4xl">{t.title}</h1>
        <p className="mt-5 text-lg text-ink-soft">{t.lede}</p>

        {/* Bilingual parity, not translation (rule 10): the module is written in
            zh-TW, so the en route says so rather than shipping a machine version. */}
        {t.zhOnlyNotice && (
          <div className="mt-6 rounded-xl border border-pine bg-sage-soft/40 px-5 py-4">
            <p className="text-sm leading-relaxed">{t.zhOnlyNotice.body}</p>
            <Link
              href="/zh-TW/judgment"
              className="mt-2 inline-block text-sm font-medium text-pine underline underline-offset-2"
            >
              {t.zhOnlyNotice.cta}
            </Link>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 rounded-xl border border-line bg-mist/50 px-5 py-4 text-sm">
          <span className="rounded bg-pine px-2 py-0.5 text-xs font-semibold uppercase tracking-eyebrow text-paper">
            {t.beta.tag}
          </span>
          <span className="flex-1 leading-relaxed text-ink-soft">{t.beta.body}</span>
          {betaMail && (
            <a
              href={betaMail}
              className="font-medium text-pine underline underline-offset-2 break-words"
            >
              {identity.email}
            </a>
          )}
        </div>

        {/* The zh-TW content keeps its typography rules even on the en route. */}
        <div className="mt-8" lang="zh-Hant-TW">
          <JudgmentApp t={t} bandLabels={c.reportTemplates.bandLabels} />
        </div>

        <details className="mt-16 border-t border-line pt-6">
          <summary className="inline-flex min-h-[44px] cursor-pointer items-center text-xs uppercase tracking-eyebrow text-pine">
            {t.about.summary}
          </summary>
          <h2 className="mt-5 text-xl font-semibold">{t.about.title}</h2>
          <p className="mt-3">
            {t.about.intro
              .replace('{competencies}', String(counts.competencies))
              .replace('{explainers}', String(counts.explainers))
              .replace('{reps}', String(counts.reps))}
          </p>
          {t.about.blocks.map((b, i) => (
            <div key={i} className="mt-6">
              <h3 className="font-semibold">{b.heading}</h3>
              <p className="mt-2 text-ink-soft">{b.body}</p>
            </div>
          ))}
          {identity.name && (
            <div className="mt-6">
              <h3 className="font-semibold">{t.about.identityTitle}</h3>
              <p className="mt-2 font-medium">{identity.name}</p>
              {identity.line && <p className="mt-1 text-ink-soft">{identity.line}</p>}
              {identity.email && (
                <p className="mt-2 text-ink-soft">
                  {t.about.identityMail}{' '}
                  <a
                    href={`mailto:${identity.email}`}
                    className="font-medium text-pine underline underline-offset-2 break-words"
                  >
                    {identity.email}
                  </a>
                </p>
              )}
            </div>
          )}
          <div className="mt-6">
            <h3 className="font-semibold">{t.about.honestTitle}</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-ink-soft">
              {t.about.honestPoints.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </details>

        {/* a plain div, not <footer>: SiteFooter already provides the page's one
            contentinfo landmark, and a second one made the site index ambiguous. */}
        <div className="mt-12 border-t border-line pt-6">
          <p className="text-xs text-ink-soft">{t.footer.origin}</p>
          <p className="mt-2 text-xs text-ink-soft">{t.footer.disclaimer}</p>
        </div>
      </main>
    </div>
  );
}
