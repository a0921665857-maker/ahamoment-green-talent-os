'use client';
import { LINE_OA_URL, type Locale, type OfferId } from '@/lib/constants';
import { phCapture } from '@/components/PostHogProvider';

/**
 * The action row on a service card. Client-side so every CTA is measured — the
 * services page shipped with zero instrumentation, which is why "how many people
 * looked at pricing" has never been answerable.
 *
 * Two controls only, by design: book the call, or add on LINE. There is no pay
 * button — the price is quoted by a person on the call (see lib/services.ts).
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
  lineLabel: string;
  variant?: 'primary' | 'secondary';
}) {
  const { offer, locale, bookingUrl } = props;

  function track(name: 'booking_clicked' | 'cta_clicked', extra: Record<string, string>) {
    phCapture(name, { ...extra, offer, locale });
  }

  // min-h-[44px]: py-2.5 rendered these at 40px, and booking the call is the one
  // control on the site that starts a conversation about money.
  const solid =
    'inline-flex min-h-[44px] items-center rounded-lg bg-pine px-5 py-2.5 text-sm text-paper';
  const outline =
    'inline-flex min-h-[44px] items-center rounded-lg border border-pine px-5 py-2.5 text-sm text-pine';

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
