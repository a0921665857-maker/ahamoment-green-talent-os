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

/* ------------------------------ how money moves ----------------------------- */

/**
 * There is no self-serve checkout, by founder decision (business-model constant,
 * restated in the 2026-08 UX audit): nobody pays this site. The path is fixed —
 * add on LINE → book the free 30-minute positioning call → Michael says the price
 * and the scope out loud on that call → the person decides → payment is arranged
 * personally afterwards.
 *
 * The Stripe Payment Link rail that used to live here (`paymentLinkFor`,
 * `isUsablePaymentLink`, `paymentLinkWithContext`, the NEXT_PUBLIC_STRIPE_LINK_*
 * reads and the /payment/{success,cancelled} pages) was removed on 2026-08-08:
 * it contradicted that decision, and a "Pay now" button sitting next to the
 * booking button taught readers the price was something you click past rather
 * than something a person tells you.
 *
 * Prices above stay — they are public business information the services page and
 * the report both display. Displaying a price is not the same as taking money.
 */
