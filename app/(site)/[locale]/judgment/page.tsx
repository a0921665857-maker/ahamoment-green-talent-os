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

  /**
   * Does this locale have the module, or only the notice that it does not?
   *
   * `zhOnlyNotice` is the existing marker for "written in zh-TW, not translated"
   * — null on the zh route, set on the en one. Reading the gate off it rather
   * than off `L === 'en'` means the day the module is translated, clearing that
   * one content field turns the whole page back on.
   *
   * Before this, the en route rendered the notice *and* the full interactive
   * module underneath it: an English reader was told the module was Chinese and
   * then handed twenty Chinese checkboxes, a submit button and four tabs. That
   * reads as an unfinished page rather than a deliberate one, which is the
   * opposite of what the notice is for. So on a locale without the module, the
   * page states the position and offers the two doors that actually work: the
   * module in the language it was written in, and the English product.
   */
  const hasModule = !t.zhOnlyNotice;

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
          <div className="mt-6 max-w-[37rem] rounded-xl border border-pine bg-sage-soft/40 px-5 py-5">
            <p className="text-sm leading-relaxed">{t.zhOnlyNotice.body}</p>
            {/* The way out, in the reader's own language, is the primary action:
                this page has nothing else for them to do. The link to the module
                stays a link — it is the door for the smaller group who read
                Chinese, and it should not compete with the one that works.
                Both strings are existing content, so neither locale gains a
                line that was written for the other. */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href={`/${L}/mri?utm_source=judgment&utm_medium=zh_only_exit`}
                className="inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 text-sm text-paper"
              >
                {c.landing.finalCta.cta}
              </Link>
              <Link
                href="/zh-TW/judgment"
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-pine underline underline-offset-2"
              >
                {t.zhOnlyNotice.cta}
              </Link>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2 rounded-xl border border-line bg-mist/50 px-5 py-4 text-sm">
          <span className="rounded-sm bg-pine px-2 py-0.5 text-xs font-semibold uppercase tracking-eyebrow text-paper">
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

        {/* Rendered only where the module exists. Because this is a conditional
            in a server component, a locale without it never receives the client
            reference either — the 390KB of competencies stays off the wire, not
            just off the screen. */}
        {hasModule && (
          <div className="mt-8" lang="zh-Hant-TW">
            <JudgmentApp t={t} bandLabels={c.reportTemplates.bandLabels} />
          </div>
        )}

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
              {/* `identity.line` comes from the module corpus and exists only in
                  zh-TW, so on a locale that does not have the module it would
                  land as a Chinese sentence under an English heading — the same
                  defect the notice above exists to prevent, one screen lower.
                  The name and the mail address are language-neutral and stay. */}
              {identity.line && hasModule && (
                <p className="mt-1 text-ink-soft">{identity.line}</p>
              )}
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
          {/* 12px copy caps at a 480px column, not 560 — max-w-[30rem]. */}
          <p className="max-w-[30rem] text-xs text-ink-soft">{t.footer.origin}</p>
          <p className="mt-2 max-w-[30rem] text-xs text-ink-soft">{t.footer.disclaimer}</p>
        </div>
      </main>
    </div>
  );
}
