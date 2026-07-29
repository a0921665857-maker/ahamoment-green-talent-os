/**
 * SINGLE SOURCE OF TRUTH for what is publicly sold and what it costs.
 *
 * Gate 8 (2026-07-29) collapsed an 11-item menu to one free front door plus two
 * paid services. Prices live HERE and nowhere else — `OfferCopy.price` is left
 * unset for public offers so a stale string in a content file can never disagree
 * with this table. Archived offers keep their historical price strings because
 * they are never rendered on a public surface.
 *
 * Market rule (founder decision, 2026-07-29): price follows the page's language.
 * zh-TW → Taiwan market (NT$) · en → international / Singapore market (SGD).
 * No conversion note, no "discount" framing — each market simply sees its price.
 */
import type { Locale, OfferId } from '@/lib/constants';

/** Offers that may appear on a public surface, in display order. */
export const PUBLIC_PAID_OFFER_IDS = ['offer_path_read', 'mba_story_teardown'] as const;
export type PublicPaidOfferId = (typeof PUBLIC_PAID_OFFER_IDS)[number];

/** The free front door. Not a "product" — the entry to every paid path. */
export const FREE_OFFER_ID: OfferId = 'intro_call_free';

/** Everything retired by Gate 8. Kept in OFFER_IDS for historical DB rows only. */
export const ARCHIVED_OFFER_IDS = [
  'deep_read',
  'consult_60',
  'teardown_90',
  'cv_linkedin_review',
  'climate_positioning_sprint',
  'mba_story_sprint',
  'mock_interview_pack',
  'offer_negotiation',
  'climate_finance_transition',
  'full_package',
] as const satisfies readonly OfferId[];

export function isPublicPaidOffer(id: OfferId): id is PublicPaidOfferId {
  return (PUBLIC_PAID_OFFER_IDS as readonly OfferId[]).includes(id);
}

export function isArchivedOffer(id: OfferId): boolean {
  return (ARCHIVED_OFFER_IDS as readonly OfferId[]).includes(id);
}

/* ---------------------------------- pricing --------------------------------- */

export const MARKETS = ['tw', 'intl'] as const;
export type Market = (typeof MARKETS)[number];

export function marketForLocale(locale: Locale): Market {
  return locale === 'zh-TW' ? 'tw' : 'intl';
}

export interface PriceSpec {
  /** Exactly what the user sees. No "起", no "from", no range. */
  display: string;
  /** ISO 4217. Drives the payment link lookup and analytics props. */
  currency: 'TWD' | 'SGD';
  /** Minor units (cents). Used for payment-link config validation and reporting. */
  amountMinor: number;
}

/**
 * Founder-authorised public prices (2026-07-29). Both services are the same
 * price by design — they are the same 90 minutes of the same person.
 */
export const SERVICE_PRICE: Record<PublicPaidOfferId, Record<Market, PriceSpec>> = {
  offer_path_read: {
    tw: { display: 'NT$6,800', currency: 'TWD', amountMinor: 680_000 },
    intl: { display: 'SGD 420', currency: 'SGD', amountMinor: 42_000 },
  },
  mba_story_teardown: {
    tw: { display: 'NT$6,800', currency: 'TWD', amountMinor: 680_000 },
    intl: { display: 'SGD 420', currency: 'SGD', amountMinor: 42_000 },
  },
};

export function priceFor(id: PublicPaidOfferId, locale: Locale): PriceSpec {
  return SERVICE_PRICE[id][marketForLocale(locale)];
}

/** Display price for any offer id; null for the free call and archived offers. */
export function displayPrice(id: OfferId, locale: Locale): string | null {
  return isPublicPaidOffer(id) ? priceFor(id, locale).display : null;
}

/* ------------------------------- payment links ------------------------------ */

/**
 * Stripe Payment Links, one per service × market. Hosted checkout — no `stripe`
 * SDK, no server-side session creation, no webhook secret required for the
 * happy path. Unset env = the pay button is simply not rendered (the booking
 * path still works), never a dead `#`.
 *
 * Naming: NEXT_PUBLIC_STRIPE_LINK_<OFFER>_<MARKET>, e.g.
 *   NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_TW
 *   NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_INTL
 *   NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_TW
 *   NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_INTL
 *
 * NEXT_PUBLIC_* is inlined at build time, so these must be read as static
 * property accesses — a computed `process.env[key]` returns undefined in the
 * browser bundle.
 */
export function paymentLinkFor(id: PublicPaidOfferId, locale: Locale): string | null {
  const market = marketForLocale(locale);
  const raw =
    id === 'offer_path_read'
      ? market === 'tw'
        ? process.env.NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_TW
        : process.env.NEXT_PUBLIC_STRIPE_LINK_OFFER_PATH_READ_INTL
      : market === 'tw'
        ? process.env.NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_TW
        : process.env.NEXT_PUBLIC_STRIPE_LINK_MBA_STORY_TEARDOWN_INTL;
  return isUsablePaymentLink(raw) ? raw.trim() : null;
}

/**
 * Guards against the two ways this has actually gone wrong before: an unset
 * variable that stringifies to "undefined", and the `https://stripe.com/placeholder`
 * value that shipped in `.env.example`. A link must be an https Stripe URL.
 */
export function isUsablePaymentLink(raw: string | undefined | null): raw is string {
  if (!raw) return false;
  const v = raw.trim();
  if (v === '' || v === 'undefined' || v === 'null') return false;
  if (v.includes('placeholder')) return false;
  let url: URL;
  try {
    url = new URL(v);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  return url.hostname === 'buy.stripe.com' || url.hostname.endsWith('.stripe.com');
}

/**
 * Attaches the report token so a payment can be traced back to a report.
 * `client_reference_id` is a Stripe-supported query parameter on Payment Links
 * and carries an opaque string through to the checkout session; we pass the
 * report token, which is already a bearer key the buyer holds. No PII, no card
 * data — those never touch this app.
 *
 * NOTE on the post-payment redirect: a Payment Link's confirmation behaviour is
 * configured in the Stripe Dashboard ("After payment" → "Redirect to your
 * website"), NOT via a query parameter. The dashboard redirect must be set to
 * the locale's success page; the manual step is written up in
 * docs/execution/STRIPE_SETUP.md. This function deliberately does not invent a
 * URL parameter for it.
 */
export function paymentLinkWithContext(
  link: string,
  ctx: { token?: string | null; offer: PublicPaidOfferId; locale: Locale },
): string {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return link;
  }
  if (ctx.token && ctx.token !== 'sample') url.searchParams.set('client_reference_id', ctx.token);
  return url.toString();
}
