import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MriIntakeFlow } from '@/components/MriIntakeFlow';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = getContent(locale).seo;
  return { title: seo.titles.mri, description: seo.descriptions.mri };
}

export default async function MriPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);
  const L = locale as Locale;

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <MriIntakeFlow
          locale={L}
          flow={c.flow}
          consent={c.consent}
          questions={c.questions}
          errors={c.errors}
          privacyHref={`/${L}/privacy`}
          sampleHref={`/${L}/sample`}
          sampleLabel={c.sample.emailGateLinkLabel}
        />
      </main>
    </div>
  );
}
