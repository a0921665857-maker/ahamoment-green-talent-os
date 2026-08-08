import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { LOCALES, type Locale } from '@/lib/constants';
import { localeRegistry, isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { PostHogProvider } from '@/components/PostHogProvider';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import '@/app/globals.css';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

/** Paper, not pine. Mobile browsers tint their own chrome with theme-color, and
 *  this is a light site: a deep-green address bar sitting above a #f6f6f1 page
 *  reads as a second surface fighting the first. Byte-identical to
 *  --color-paper in app/globals.css. Lives on the `viewport` export, not in
 *  metadata — Next moved themeColor there and warns at build time otherwise. */
export const viewport: Viewport = { themeColor: '#f6f6f1' };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = getContent(locale).seo;
  return {
    // Without this Next warns at build time and resolves og/twitter image URLs
    // against a guessed origin. Same env var and fallback as sitemap.ts/robots.ts.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ahamoment-green-talent-os.vercel.app',
    ),
    title: { default: seo.titles.home, template: `%s · ${seo.siteName}` },
    description: seo.descriptions.home,
    // og:locale and og:site_name were declared in content and never emitted.
    // canonical/hreflang deliberately do NOT live here: layout alternates are
    // inherited, which would point every route at the locale root. Pages call
    // lib/seoAlternates.ts with their own path instead.
    openGraph: {
      type: 'website',
      siteName: seo.siteName,
      locale: seo.ogLocale,
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const meta = localeRegistry.find((l) => l.code === (locale as Locale))!;
  const L = locale as Locale;
  const c = getContent(L);
  return (
    <html lang={meta.htmlLang}>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <PostHogProvider>
          {/* One header and one footer for every page in the site group. Before
              Gate 8 each page hand-wrote its own nav, so any page reached from
              search was a dead end. */}
          <SiteHeader
            locale={L}
            siteName={c.seo.siteName}
            returnReportLabel={c.landing.hero.viewExistingReport}
          />
          {children}
          <SiteFooter locale={L} />
        </PostHogProvider>
      </body>
    </html>
  );
}
