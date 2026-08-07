import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { MriIntakeFlow } from '@/components/MriIntakeFlow';
import { alternatesFor } from '@/lib/seoAlternates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const seo = getContent(locale).seo;
  return {
    title: seo.titles.mri,
    description: seo.descriptions.mri,
    alternates: alternatesFor(locale as Locale, '/mri'),
  };
}

export default async function MriPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const c = getContent(locale);
  const L = locale as Locale;

  return (
    <div className="min-h-screen">
      <main id="main" className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <MriIntakeFlow
          locale={L}
          flow={c.flow}
          consent={c.consent}
          questions={c.questions}
          errors={c.errors}
          share={c.share}
          privacyHref={`/${L}/privacy`}
          sampleHref={`/${L}/sample`}
          sampleLabel={c.sample.emailGateLinkLabel}
        />
      </main>
    </div>
  );
}
