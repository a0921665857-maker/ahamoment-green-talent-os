import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { TwinRequestForm } from '@/components/TwinRequestForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  // Private feature — keep it out of search results.
  return { title: getContent(locale).twin.request.title, robots: { index: false } };
}

export default async function TwinRequestPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const t = c.twin.request;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">{t.intro}</p>
        <TwinRequestForm locale={L} content={t} />
        <p className="mt-6 max-w-xl text-sm text-ink-soft">{t.inviteNote}</p>
      </main>
    </div>
  );
}
