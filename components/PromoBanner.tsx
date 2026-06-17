import type { PromoContent } from '@/content/schema';
import { isPromoActive } from '@/lib/promo';

/** Honest, deadline-bound promo strip. Renders nothing once the deadline passes. */
export function PromoBanner({ promo }: { promo: PromoContent }) {
  if (!isPromoActive()) return null;
  return (
    <div className="border-b border-line bg-mist">
      <div className="mx-auto max-w-3xl px-6 py-3 text-sm">
        <span className="font-medium text-pine">{promo.eyebrow}</span>
        <span className="ml-2 text-ink">{promo.headline}</span>
        <span className="mt-0.5 block text-ink-soft sm:ml-2 sm:mt-0 sm:inline">{promo.note}</span>
      </div>
    </div>
  );
}
