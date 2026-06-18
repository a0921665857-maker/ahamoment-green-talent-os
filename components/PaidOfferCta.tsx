'use client';
import type { Locale, OfferId, ResultCategory } from '@/lib/constants';
import type { PaidOffersContent } from '@/content/schema';

interface Slot {
  offer: OfferId;
  role: 'primary' | 'entry' | 'anchor';
}

export function PaidOfferCta(props: {
  locale: Locale;
  category: ResultCategory;
  slots: Slot[];
  content: PaidOffersContent;
  calendlyUrl: string;
  sessionToken: string;
}) {
  const { content } = props;
  const roleLabel: Record<Slot['role'], string> = {
    primary: content.primaryLabel,
    entry: content.entryLabel,
    anchor: content.anchorLabel,
  };

  function book(offer: OfferId) {
    try {
      void fetch('/api/mri/event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'booking_clicked',
          session_token: props.sessionToken,
          props: { offer, category: props.category },
        }),
        keepalive: true,
      });
    } catch {
      /* best-effort */
    }
  }

  return (
    <section className="mt-16 border-t border-line pt-10">
      <h2 className="text-xl font-semibold">{content.title}</h2>
      <p className="mt-2 max-w-2xl text-ink-soft">{content.intro}</p>
      <p className="mt-4 max-w-2xl rounded-lg border border-line bg-mist/40 px-4 py-3 text-sm text-ink">
        {content.bookingNote}
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {props.slots.map((s) => {
          const o = content.offers[s.offer];
          const isPrimary = s.role === 'primary';
          return (
            <div
              key={s.offer}
              className={
                isPrimary
                  ? 'rounded-xl border-2 border-pine bg-paper p-5'
                  : 'rounded-xl border border-line bg-paper p-5'
              }
            >
              <p className="text-xs uppercase tracking-eyebrow text-pine">{roleLabel[s.role]}</p>
              <h3 className="mt-2 text-lg font-semibold">{o.name}</h3>
              <p className="mt-1 text-sm">
                {o.originalPrice && (
                  <span className="text-ink-soft line-through">{o.originalPrice}</span>
                )}{' '}
                <span className="font-medium text-ink">{o.price}</span>
                {o.originalPrice && (
                  <span className="ml-2 rounded bg-sage-soft px-1.5 py-0.5 text-xs text-pine-deep">
                    {content.earlyBird}
                  </span>
                )}
              </p>
              <p className="mt-3 text-sm">{o.blurb}</p>
              <p className="mt-3 text-xs text-ink-soft">{o.delivery}</p>
              <a
                href={props.calendlyUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => book(s.offer)}
                className={
                  isPrimary
                    ? 'mt-4 inline-block rounded-lg bg-pine px-5 py-2.5 text-sm text-paper'
                    : 'mt-4 inline-block rounded-lg border border-pine px-5 py-2.5 text-sm text-pine'
                }
              >
                {content.bookCta}
              </a>
            </div>
          );
        })}
      </div>

      <a
        href={`/${props.locale}/services`}
        className="mt-5 inline-block text-sm text-pine underline-offset-2 hover:underline"
      >
        {content.allServicesCta} →
      </a>

      <p className="mt-6 text-sm text-ink-soft">{content.creditPolicy}</p>
      <p className="mt-1 text-sm text-ink-soft">{content.confidentiality}</p>

      <p className="mt-6 border-t border-line pt-6 text-sm text-ink-soft">
        {content.offers.intro_call_free.blurb}{' '}
        <a
          href={props.calendlyUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => book('intro_call_free')}
          className="text-pine underline-offset-2 hover:underline"
        >
          {content.offers.intro_call_free.name} · {content.offers.intro_call_free.price} →
        </a>
      </p>
    </section>
  );
}
