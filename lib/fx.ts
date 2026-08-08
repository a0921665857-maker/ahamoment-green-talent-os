import type { Locale } from '@/lib/constants';

/**
 * The site's one exchange-rate assumption, and the date it was taken.
 *
 * WHY THIS FILE EXISTS (2026-08-08 freshness audit). `1 SGD ≈ 25 TWD` was typed
 * into seven places across content/salaryReport.ts, content/costOfLiving.ts and
 * both flow.ts locales, and not one of them said WHEN. Every "2 to 3×" and every
 * "1.6× / 2.5× disposable" on the site is built on top of it, so an undated rate
 * is an undated conclusion: a reader in 2028 has no way to tell whether the
 * comparison was struck last week or two years ago, and neither does Michael.
 *
 * So the rate lives here once, carries `asOf`, and every rendered sentence quotes
 * the rate THROUGH this module. Changing the number is now a one-line edit that
 * propagates, and it is impossible to change it without also moving the date,
 * because the date is part of the same object.
 *
 * These are reference rates for reading salary bands, not trading rates. They are
 * deliberately round: the bands they convert are themselves ranges, and false
 * precision on the FX leg would imply precision the underlying data does not have.
 */
export const FX = {
  /** Reference rate used for every SGD → TWD comparison on the site. */
  sgdTwd: 25,
  /** Only used by the salary report's USD leg. */
  usdSgd: 1.35,
  /** The day these rates were taken. Move this whenever a rate moves. */
  asOf: '2026-08-08',
} as const;

/** Derived, never typed by hand: 1.35 × 25. */
export const FX_USD_TWD = FX.usdSgd * FX.sgdTwd;

/** The bare pair, for places that already carry a date of their own. */
export const FX_PAIR = `1 SGD ≈ ${FX.sgdTwd} TWD`;

/** "as of" clause on its own, for sentences that build their own frame. */
export const FX_AS_OF: Record<Locale, string> = {
  'zh-TW': `匯率以 ${FX.asOf} 為準`,
  en: `FX as of ${FX.asOf}`,
};

/** The default form: rate plus date, one token. */
export const FX_LINE: Record<Locale, string> = {
  'zh-TW': `${FX_PAIR}（${FX_AS_OF['zh-TW']}）`,
  en: `${FX_PAIR} (${FX_AS_OF.en})`,
};

/** Both legs plus the date — the salary report is the only surface that needs USD. */
export const FX_LINE_FULL: Record<Locale, string> = {
  'zh-TW': `${FX_PAIR}，1 USD ≈ ${FX.usdSgd} SGD ≈ ${FX_USD_TWD} TWD（${FX_AS_OF['zh-TW']}）`,
  en: `${FX_PAIR}, 1 USD ≈ ${FX.usdSgd} SGD ≈ ${FX_USD_TWD} TWD (${FX_AS_OF.en})`,
};
