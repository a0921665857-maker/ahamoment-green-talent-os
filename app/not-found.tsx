import { LOCALES } from '@/lib/constants';
import { notFoundCopy } from '@/content/notFound';
import '@/app/globals.css';

/**
 * The root 404 — the one Next reaches for when a URL matches nothing anywhere:
 * a path with a dot in it (proxy.ts lets those through untouched), an unknown
 * /admin path, anything that never gets a locale prefix at all, and every
 * unmatched path under /zh-TW and /en.
 *
 * No `export const metadata` and no <html>/<body> of its own, and both of those
 * are the result of measurement, not taste:
 *
 * - A metadata export here is dead code. This app has no root layout (both route
 *   groups declare their own <html>), so there is no metadata tree above this
 *   file to merge into; the shipped response for /nope.txt carried no <title>
 *   at all and the browser tab showed the raw URL. Rendering a <title> element
 *   in the JSX is what actually reaches the document — it is also exactly what
 *   Next's own built-in 404 does.
 * - Rendering <html>/<body> here produced a document with two of each:
 *   <html><body><div hidden/><html lang="en"><body>…. Next wraps a root-level
 *   not-found in its own shell, so this file must be a fragment the way Next's
 *   built-in fallback is one. The page's colours come from the body rules in
 *   globals.css, which is why nothing needs a class here.
 *
 * The page is bilingual on purpose: there is no locale to read on this route, so
 * it shows both languages rather than guessing and getting it wrong. Both exits
 * are the two a lost reader actually wants — the home page and the free MRI.
 */
export default function RootNotFound() {
  return (
    <>
      {/* Not a metadata export. See above: this element is the only thing that
          puts a title on this response. */}
      <title>{`${notFoundCopy['zh-TW'].title} · ${notFoundCopy.en.title} · AhaMoment`}</title>
      <meta name="robots" content="noindex" />
      <main className="mx-auto min-h-screen max-w-2xl px-6 py-20">
        <p className="text-xs uppercase tracking-eyebrow text-pine">404</p>

        {LOCALES.map((locale) => {
          const c = notFoundCopy[locale];
          return (
            <section
              key={locale}
              lang={locale === 'zh-TW' ? 'zh-Hant-TW' : 'en'}
              className="mt-8 border-t border-line pt-8 first-of-type:border-t-0 first-of-type:pt-0"
            >
              <h2 className="text-2xl font-semibold leading-tight">{c.title}</h2>
              <p className="mt-3 text-ink-soft">{c.body}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={`/${locale}`}
                  className="inline-flex min-h-11 items-center rounded-lg border border-pine px-5 py-3 text-sm font-medium text-pine"
                >
                  {c.homeCta}
                </a>
                <a
                  href={`/${locale}/mri?utm_source=not_found&utm_medium=recovery`}
                  className="inline-flex min-h-11 items-center rounded-lg bg-pine px-5 py-3 text-sm font-semibold text-paper"
                >
                  {c.mriCta}
                </a>
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
