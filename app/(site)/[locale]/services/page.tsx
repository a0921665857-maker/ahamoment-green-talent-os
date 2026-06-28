import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { OFFER_IDS, type Locale } from '@/lib/constants';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getContent(locale).paidOffers.title };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const o = c.paidOffers;
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? '';

  return (
    <div className="min-h-screen">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <a href={`/${L}`} className="text-sm font-semibold tracking-tight">
          {c.seo.siteName}
        </a>
        <LanguageSwitcher current={L} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{o.title}</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">{o.intro}</p>
        <p className="mt-4 max-w-2xl rounded-lg border border-line bg-mist/40 px-4 py-3 text-sm text-ink">
          {o.bookingNote}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {OFFER_IDS.map((id) => {
            const offer = o.offers[id];
            return (
              <div key={id} className="flex flex-col rounded-xl border border-line bg-paper p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold">{offer.name}</h2>
                  <span className="shrink-0 text-sm font-medium text-pine">{offer.price}</span>
                </div>
                {offer.priceNote && <p className="mt-2 text-xs text-pine">{offer.priceNote}</p>}
                <p className="mt-3 text-sm">{offer.blurb}</p>
                <p className="mt-3 text-xs text-ink-soft">{offer.forWhom}</p>
                <p className="mt-1 text-xs text-ink-soft">{offer.delivery}</p>
                <a
                  href={calendlyUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block self-start rounded-lg border border-pine px-5 py-2 text-sm text-pine"
                >
                  {o.bookCta}
                </a>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-sm font-medium text-pine">{o.guarantee}</p>
        <p className="mt-2 text-sm text-ink-soft">{o.creditPolicy}</p>
        <p className="mt-1 text-sm text-ink-soft">{o.confidentiality}</p>

        <div className="mt-12 border-t border-line pt-10 text-center">
          <a href={`/${L}/mri`} className="inline-block rounded-lg bg-pine px-6 py-3 text-paper">
            {c.landing.finalCta.cta}
          </a>
        </div>
      </main>
    </div>
  );
}
