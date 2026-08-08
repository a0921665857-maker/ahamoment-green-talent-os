import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';
import { ctaOffers } from '@/lib/scoring/resultClassifier';
import { sampleReports } from '@/content/sampleReport';
import { InlineCtaCard } from '@/components/InlineCtaCard';
import { MarketPulseCard } from '@/components/MarketPulseCard';
import { MriLiteReport } from '@/components/MriLiteReport';
import { PaidOfferCta } from '@/components/PaidOfferCta';
import { ShareableTypeCard } from '@/components/ShareableTypeCard';
import { alternatesFor } from '@/lib/seoAlternates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getContent(locale).sample.pageTitle,
    alternates: alternatesFor(locale as Locale, '/sample'),
  };
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
      <main id="main" className="mx-auto max-w-2xl px-6 pb-24 pt-6">
        <div className="mb-8 rounded-xl border border-line bg-mist/40 px-5 py-5">
          <p className="text-xs uppercase tracking-eyebrow text-pine">{c.sample.pageEyebrow}</p>
          {/* Back to an <h1>, at the house size (36px desktop). This page's own
              title was 24px — the smallest page title on the site, on the page
              whose whole job is to show what the product looks like. It reads as
              a caption above the specimen rather than as the page.
              Two h1s is intentional and valid here: MriLiteReport renders an
              <article> and the h1 inside it is that ARTICLE's title (the sample
              report), 30px, deliberately smaller than the page's own. */}
          <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{c.sample.pageTitle}</h1>
          <p className="mt-2 max-w-[35rem] text-sm text-ink-soft">{c.sample.pageIntro}</p>
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
        <MarketPulseCard locale={L} utmContent="sample" />
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
