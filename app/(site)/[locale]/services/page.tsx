import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import type { Locale, OfferId } from '@/lib/constants';
import { FREE_OFFER_ID, PUBLIC_PAID_OFFER_IDS, priceFor } from '@/lib/services';
import { ServiceCtas } from '@/components/ServiceCtas';
import { PageViewPing } from '@/components/PageViewPing';
import { alternatesFor } from '@/lib/seoAlternates';

/** Scope boundary block — "what this service does not do". Declared at module
 * scope: a component defined inside the page body is re-created every render. */
function Scope({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4 border-t border-line pt-4">
      <p className="text-xs uppercase tracking-eyebrow text-ink-soft">{label}</p>
      <ul className="mt-2 space-y-1">
        {items.map((line) => (
          <li key={line} className="text-sm text-ink-soft">
            · {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: getContent(locale).paidOffers.title,
    alternates: alternatesFor(locale as Locale, '/services'),
  };
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const L = locale as Locale;
  const c = getContent(L);
  const o = c.paidOffers;
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? '';

  const free = o.offers[FREE_OFFER_ID];

  return (
    <div className="min-h-screen">
      <PageViewPing name="services_page_viewed" props={{ locale: L }} />

      <main id="main" className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <h1 className="text-3xl font-semibold">{o.title}</h1>
        <p className="mt-3 max-w-2xl text-ink-soft">{o.intro}</p>
        <p className="mt-4 max-w-2xl rounded-lg border border-line bg-mist/40 px-4 py-3 text-sm text-ink">
          {o.bookingNote}
        </p>

        {/* The free front door — the entry to both paid services, not a product. */}
        <section className="mt-10 rounded-xl border-2 border-pine bg-sage-soft/30 p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold">{free.name}</h2>
            <span className="text-sm font-medium text-pine">{free.price}</span>
          </div>
          <p className="mt-3 text-sm text-ink">{free.blurb}</p>
          <p className="mt-3 text-xs text-ink-soft">{free.forWhom}</p>
          <p className="mt-1 text-xs text-ink-soft">{free.delivery}</p>
          <Scope label={o.notIncludedLabel} items={free.notIncluded} />
          <ServiceCtas
            offer={FREE_OFFER_ID}
            locale={L}
            bookingUrl={bookingUrl}
            bookLabel={o.bookCta}
            payLabel={o.payCta ?? ''}
            lineLabel={o.stickyLine}
          />
        </section>

        <div className="mt-12 space-y-6">
          {PUBLIC_PAID_OFFER_IDS.map((id) => {
            const offer = o.offers[id as OfferId];
            const price = priceFor(id, L);
            return (
              <section key={id} className="rounded-xl border border-line bg-paper p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="text-xl font-semibold">{offer.name}</h2>
                  <span className="shrink-0 text-base font-semibold text-pine">{price.display}</span>
                </div>

                {offer.decisionMoment && (
                  <p className="mt-4 border-l-2 border-pine pl-4 text-sm text-ink">
                    <span className="block text-xs uppercase tracking-eyebrow text-ink-soft">
                      {o.decisionMomentLabel}
                    </span>
                    {offer.decisionMoment}
                  </p>
                )}

                <p className="mt-4 text-sm">{offer.blurb}</p>
                <p className="mt-4 text-xs text-ink-soft">{offer.forWhom}</p>
                <p className="mt-1 text-xs text-ink-soft">{offer.delivery}</p>

                <Scope label={o.notIncludedLabel} items={offer.notIncluded} />

                <ServiceCtas
                  offer={id as OfferId}
                  locale={L}
                  bookingUrl={bookingUrl}
                  bookLabel={o.bookCta}
                  payLabel={o.payCta ?? ''}
                  lineLabel={o.stickyLine}
                />
              </section>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-ink-soft">{o.confidentiality}</p>

        <div className="mt-12 border-t border-line pt-10 text-center">
          <a href={`/${L}/mri`} className="inline-block rounded-lg bg-pine px-6 py-3 text-paper">
            {c.landing.finalCta.cta}
          </a>
        </div>
      </main>
    </div>
  );
}
