'use client';
import { LINE_OA_URL, type Locale, type OfferId } from '@/lib/constants';
import { phCapture } from '@/components/PostHogProvider';
import {
  isPublicPaidOffer,
  paymentLinkFor,
  paymentLinkWithContext,
  priceFor,
} from '@/lib/services';

/**
 * The action row on a service card. Client-side so every CTA is measured — the
 * services page shipped with zero instrumentation, which is why "how many people
 * looked at pricing" has never been answerable.
 *
 * Never renders a dead control: if the booking URL is unset the button is not
 * drawn at all, and the LINE rail (a hardcoded constant, always present) is the
 * guaranteed floor so no card can end in a `#`.
 */
export function ServiceCtas(props: {
  offer: OfferId;
  locale: Locale;
  bookingUrl: string;
  bookLabel: string;
  payLabel: string;
  lineLabel: string;
  /** Report token when this is rendered off a report; omitted on the services page. */
  sessionToken?: string;
  variant?: 'primary' | 'secondary';
}) {
  const { offer, locale, bookingUrl } = props;
  const paidId = isPublicPaidOffer(offer) ? offer : null;
  const rawPayLink = paidId ? paymentLinkFor(paidId, locale) : null;
  const payHref =
    rawPayLink && paidId
      ? paymentLinkWithContext(rawPayLink, {
          token: props.sessionToken ?? null,
          offer: paidId,
          locale,
        })
      : null;
  const currency = paidId ? priceFor(paidId, locale).currency : null;

  function track(name: 'booking_clicked' | 'checkout_started' | 'cta_clicked', extra: Record<string, string>) {
    phCapture(name, { ...extra, offer, locale });
  }

  const solid =
    'inline-flex items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper';
  const outline =
    'inline-flex items-center rounded-lg border border-pine px-5 py-2.5 text-sm text-pine';

  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      {bookingUrl ? (
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('booking_clicked', { surface: 'services' })}
          className={props.variant === 'secondary' ? outline : solid}
        >
          {props.bookLabel}
        </a>
      ) : null}

      {payHref ? (
        <a
          href={payHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            track('checkout_started', { surface: 'services', currency: currency ?? 'unknown' })
          }
          className={outline}
        >
          {props.payLabel}
        </a>
      ) : null}

      <a
        href={LINE_OA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('cta_clicked', { cta: 'line_add', surface: 'services' })}
        className="text-sm text-pine underline-offset-2 hover:underline"
      >
        {props.lineLabel} →
      </a>
    </div>
  );
}
