import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { ctaOffers } from '@/lib/scoring/resultClassifier';
import { sampleReports } from '@/content/sampleReport';
import { InlineCtaCard } from '@/components/InlineCtaCard';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { MriLiteReport } from '@/components/MriLiteReport';
import { PaidOfferCta } from '@/components/PaidOfferCta';
import { ShareableTypeCard } from '@/components/ShareableTypeCard';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getContent(locale).sample.pageTitle };
}

export default async function SamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const s = sampleReports[L];

  const slots = ctaOffers({
    category: s.category,
    primary_offer: s.primaryOffer,
    secondary_offer: s.secondaryOffer,
  });
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>
      <main className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <div className="mb-8 rounded-lg border border-line bg-mist/40 px-5 py-5">
          <p className="text-xs uppercase tracking-eyebrow text-pine">{c.sample.pageEyebrow}</p>
          <h1 className="mt-2 text-2xl font-semibold">{c.sample.pageTitle}</h1>
          <p className="mt-2 text-sm text-ink-soft">{c.sample.pageIntro}</p>
          <a
            href={`/${L}/mri`}
            className="mt-4 inline-block rounded-lg bg-pine px-6 py-3 text-paper"
          >
            {c.sample.startCta}
          </a>
        </div>

        <MriLiteReport
          locale={L}
          name={s.name}
          sections={s.sections}
          bands={s.bands}
          limitedData={s.limitedData}
          templates={c.reportTemplates}
          dateLabel={c.sample.pageEyebrow}
          mbaIntent={s.mbaIntent}
          inlineCta={
            <InlineCtaCard locale={L} content={c.paidOffers} calendlyUrl={calendlyUrl} sessionToken={null} />
          }
        />
        <PaidOfferCta
          locale={L}
          category={s.category}
          categoryLabel={c.share.types[s.category].label}
          slots={slots}
          content={c.paidOffers}
          calendlyUrl={calendlyUrl}
          sessionToken="sample"
        />
        <ShareableTypeCard
          locale={L}
          category={s.category}
          content={c.share}
          shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/${L}/types/${s.category}`}
        />

        <div className="mt-12 border-t border-line pt-10 text-center">
          <a href={`/${L}/mri`} className="inline-block rounded-lg bg-pine px-6 py-3 text-paper">
            {c.sample.startCta}
          </a>
        </div>
      </main>
    </div>
  );
}
