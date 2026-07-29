import type { Metadata } from 'next';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = getContent(locale).seo;
  return {
    title: { default: seo.titles.home, template: `%s · ${seo.siteName}` },
    description: seo.descriptions.home,
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
