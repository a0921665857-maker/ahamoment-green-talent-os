import type { Locale } from '@/lib/constants';

/**
 * Personalised salary band for the MRI report — a DETERMINISTIC lookup, zero LLM.
 *
 * Numbers mirror content/salaryReport.ts (the human-curated, sourced dataset) and
 * a drift-guard unit test asserts every band string here still exists there, so
 * the two can never silently diverge. The multiples mirror the salary report
 * (nominal) and cost-of-living page (disposable), both at 1 SGD ≈ 25 TWD.
 *
 * Honesty rules, enforced in code:
 * - Only sectors with a defensible row in the salary report are mapped. Sectors
 *   the report itself flags as "insufficient data" (climate-tech startups) or
 *   that have no comparable row (policy, nature, renewables engineering) return
 *   null — the block simply does not render. Never guess.
 * - years_experience missing → null. Seniority labels alone are too coarse.
 * - Low extraction confidence → the caller hides the block.
 */

export type BandFunction = 'finance' | 'carbon' | 'consulting' | 'corporate';
export type ExpCol = 'entry' | 'mid' | 'senior';

/** Taxonomy sector slug → salary-report function row. Unlisted slugs are honestly unmapped. */
const SECTOR_TO_FUNCTION: Record<string, BandFunction> = {
  'carbon-markets': 'carbon',
  'green-finance': 'finance',
  'impact-investing': 'finance',
  'climate-risk': 'finance',
  'esg-data-ratings': 'finance',
  'esg-advisory': 'consulting',
  'corporate-sustainability': 'corporate',
  'sustainable-supply-chain': 'corporate',
  'circular-economy': 'corporate',
  // Deliberately unmapped (no defensible row in the salary report):
  // climate-tech (report: 樣本不足，不編數字), renewable-energy, energy-transition,
  // climate-policy, nature-biodiversity, sustainability-saas.
};

interface FunctionRow {
  labelZh: string;
  labelEn: string;
  bands: Record<ExpCol, string>; // display strings, verbatim from content/salaryReport.ts
}

/** SG bands, verbatim from the salary report's sgTable (drift-guarded by test). */
const FUNCTION_ROWS: Record<BandFunction, FunctionRow> = {
  finance: {
    labelZh: '永續金融',
    labelEn: 'Sustainable finance',
    bands: { entry: 'S$65k–90k', mid: 'S$100k–160k', senior: 'S$250k–350k+' },
  },
  carbon: {
    labelZh: '碳市場',
    labelEn: 'Carbon markets',
    bands: { entry: '~S$72k*', mid: '分析師 ~S$104k；交易員 ~S$131k*', senior: 'S$180k–230k' },
  },
  consulting: {
    labelZh: 'ESG 顧問',
    labelEn: 'ESG consulting',
    bands: { entry: '月 S$4.5k–6.4k', mid: 'S$100k–160k', senior: '合夥人可達 ~S$420k**' },
  },
  corporate: {
    labelZh: '企業永續',
    labelEn: 'Corporate sustainability',
    bands: { entry: 'S$50k–80k', mid: '~S$88k–142k', senior: 'S$200k–400k' },
  },
};

const CARBON_BAND_EN: Record<ExpCol, string> = {
  entry: '~S$72k*',
  mid: 'analyst ~S$104k; trader ~S$131k*',
  senior: 'S$180k–230k',
};
const CONSULTING_BAND_EN: Record<ExpCol, string> = {
  entry: 'S$4.5k–6.4k/mo',
  mid: 'S$100k–160k',
  senior: 'partner up to ~S$420k**',
};

interface ExpColInfo {
  labelZh: string;
  labelEn: string;
  twAnchorZh: string;
  twAnchorEn: string;
  nominal: string; // multiple range, from the salary report (FX 25)
  disposable: string | null; // from cost-of-living; null where we did not compute one
}

/** Taiwan anchors + multiples, mirroring salary report 倍數 section and cost-of-living verdict. */
const EXP_COLS: Record<ExpCol, ExpColInfo> = {
  entry: {
    labelZh: '0 到 3 年',
    labelEn: '0–3 yrs',
    twAnchorZh: '台灣同段約 68 萬/年（新進中位 5.2 萬/月）〔104〕',
    twAnchorEn: 'Taiwan equivalent ~NT$680k/yr (entry median NT$52k/mo) [104]',
    nominal: '1.8–3.3×',
    disposable: '1.6×',
  },
  mid: {
    labelZh: '4 到 8 年',
    labelEn: '4–8 yrs',
    twAnchorZh: '台灣同段約 80 到 120 萬/年（公開數據薄，內插推估）',
    twAnchorEn: 'Taiwan equivalent ~NT$0.8–1.2M/yr (thin public data, interpolated)',
    nominal: '2.7–3.3×',
    disposable: '2.5×',
  },
  senior: {
    labelZh: '8 年以上',
    labelEn: '8+ yrs',
    twAnchorZh: '台灣資深主管約 200 到 300 萬/年',
    twAnchorEn: 'Taiwan senior management ~NT$2–3M/yr',
    nominal: '2.2–3.3×',
    disposable: null, // cost-of-living only computed entry and mid; do not invent
  },
};

export interface PersonalBand {
  functionLabel: string;
  expLabel: string;
  sgBand: string;
  twAnchor: string;
  nominal: string;
  disposable: string | null;
}

function pickExpCol(years: number): ExpCol {
  if (years <= 3) return 'entry';
  if (years <= 8) return 'mid';
  return 'senior';
}

/**
 * The whole feature: user-confirmed sectors + extracted years → one band, or null.
 * First mapped sector wins (extraction lists the dominant sector first).
 */
export function getPersonalBand(
  sectors: string[],
  yearsExperience: number | null | undefined,
  locale: Locale,
): PersonalBand | null {
  if (yearsExperience == null || !Number.isFinite(yearsExperience) || yearsExperience < 0) return null;
  const fn = sectors.map((s) => SECTOR_TO_FUNCTION[s]).find(Boolean);
  if (!fn) return null;

  const col = pickExpCol(yearsExperience);
  const row = FUNCTION_ROWS[fn];
  const exp = EXP_COLS[col];
  const zh = locale === 'zh-TW';

  let sgBand = row.bands[col];
  if (!zh && fn === 'carbon') sgBand = CARBON_BAND_EN[col];
  if (!zh && fn === 'consulting') sgBand = CONSULTING_BAND_EN[col];

  return {
    functionLabel: zh ? row.labelZh : row.labelEn,
    expLabel: zh ? exp.labelZh : exp.labelEn,
    sgBand,
    twAnchor: zh ? exp.twAnchorZh : exp.twAnchorEn,
    nominal: exp.nominal,
    disposable: exp.disposable,
  };
}

/* ------------------------- quick-read (zero-typing) ------------------------ */

/** Quick-read q5 option value → band function. 'other' is honestly unmapped. */
const QUICK_SECTOR_TO_FUNCTION: Record<string, BandFunction> = {
  finance: 'finance',
  carbon: 'carbon',
  consulting: 'consulting',
  corporate: 'corporate',
};

/** Quick-read q2 option value → representative years. y6 (6–8) deliberately maps
 * to mid, not senior — with a coarse tap input we round DOWN, never up. */
const QUICK_YEARS: Record<string, number> = { y0: 0, y1: 2, y3: 5, y6: 7, y8: 9 };

export interface QuickBand {
  /** Full personal band when the tapped sector maps to a report row; null for 'other'. */
  band: PersonalBand | null;
  /** Experience-column facts — always present, sector-independent, from the report. */
  expLabel: string;
  twAnchor: string;
  nominal: string;
  disposable: string | null;
}

/**
 * Deterministic salary facts for the quick read. Same honesty rules as
 * getPersonalBand: unmapped sector → no SG band row, only the exp-column
 * anchor + multiple (which the salary report states function-independently).
 */
export function getQuickBand(
  sectorOpt: string,
  yearsOpt: string,
  locale: Locale,
): QuickBand | null {
  const years = QUICK_YEARS[yearsOpt];
  if (years == null) return null;
  const zh = locale === 'zh-TW';
  const col = pickExpCol(years);
  const exp = EXP_COLS[col];
  const fn = QUICK_SECTOR_TO_FUNCTION[sectorOpt];

  let band: PersonalBand | null = null;
  if (fn) {
    const row = FUNCTION_ROWS[fn];
    let sgBand = row.bands[col];
    if (!zh && fn === 'carbon') sgBand = CARBON_BAND_EN[col];
    if (!zh && fn === 'consulting') sgBand = CONSULTING_BAND_EN[col];
    band = {
      functionLabel: zh ? row.labelZh : row.labelEn,
      expLabel: zh ? exp.labelZh : exp.labelEn,
      sgBand,
      twAnchor: zh ? exp.twAnchorZh : exp.twAnchorEn,
      nominal: exp.nominal,
      disposable: exp.disposable,
    };
  }
  return {
    band,
    expLabel: zh ? exp.labelZh : exp.labelEn,
    twAnchor: zh ? exp.twAnchorZh : exp.twAnchorEn,
    nominal: exp.nominal,
    disposable: exp.disposable,
  };
}

/** Exported for the drift-guard test only. */
export const _internal = { SECTOR_TO_FUNCTION, FUNCTION_ROWS, EXP_COLS, QUICK_YEARS };
