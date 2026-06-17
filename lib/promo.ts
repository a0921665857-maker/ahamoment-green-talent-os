/**
 * Honest deadline-bound promo. The banner shows ONLY while the real deadline in
 * NEXT_PUBLIC_PROMO_DEADLINE (YYYY-MM-DD) is in the future. Unset or past → off,
 * so the offer reverts to full price automatically. No countdowns, no fake scarcity.
 */
export function isPromoActive(now: Date = new Date()): boolean {
  const raw = process.env.NEXT_PUBLIC_PROMO_DEADLINE;
  if (!raw) return false;
  const deadline = new Date(`${raw}T23:59:59`);
  if (Number.isNaN(deadline.getTime())) return false;
  return now.getTime() <= deadline.getTime();
}
