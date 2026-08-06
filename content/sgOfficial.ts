/**
 * 新加坡官方數據快照 — generated file. Do not hand-edit.
 *
 * Regenerate with `python scripts/export_sg_official.py`. Hand edits are
 * silently overwritten on the next run, and `--check` will fail the moment the
 * file stops matching content/sg-official/*.json.
 *
 * SOURCE. data.gov.sg, six datasets published by HDB, SingStat and MOM. The raw
 * responses live in content/sg-official/ in this repo, one JSON per dataset,
 * each carrying its own dataset id, agency, source URL, licence, fetch time and
 * reporting period. Every number below is re-derivable from those files offline.
 *
 * LICENCE. Singapore Open Data Licence v1.0. It permits redistribution of
 * derived analysis and requires attribution plus a statement that this site is
 * not affiliated with the Singapore government. Both are rendered on the page
 * from content/sgOfficialCopy.ts. Do not ship this data without them.
 *
 * FIRST-HAND vs SECOND-HAND. This file holds official first-hand figures only.
 * The second-hand estimates (Numbeo, Wise, blog surveys) stay in
 * content/costOfLiving.ts. The two are rendered in separate sections and are
 * never merged into one table, never added together, and never substituted for
 * one another. tests/costOfLiving.test.ts enforces the separation.
 *
 * TWO DIFFERENT DATES, both exposed. `fetchedAt` is when this site pulled the
 * dataset. `latestPeriod` is how current the agency's own data is. They are not
 * the same claim: foreign_workforce was fetched on 2026-08-06 but the agency
 * stopped publishing it after 2022-12, so it carries `discontinued: true` and is
 * not rendered on the cost-of-living page at all.
 *
 * STALENESS BEHAVIOUR IS THE OPPOSITE OF marketPulse, deliberately. marketPulse
 * hides itself once stale because a closed job posting is a dead link. Official
 * statistics do not become false by ageing; the only risk is that a newer
 * reporting period exists. So a stale dataset here keeps its numbers and gains a
 * notice pointing at the official link. Never copy the hiding behaviour across.
 *
 * DERIVED FIGURES. Fields marked "derived" are computed by this script from the
 * official series, not published by the agency in that form: the median of the
 * 25 town medians, the quartiles, the six-year rent changes, the CPI five-year
 * cumulative, and the trailing run of quarters inside the unemployment band. The
 * page labels them as mine. Where they disagree with an official publication,
 * the official figure stands.
 *
 * TO REFRESH (roughly monthly, on the 5th; see docs/MAINTENANCE_GUIDE.md):
 *   1. python C:\Users\michael\sg-dashboard\refresh.py
 *      (4 second spacing and 60/90/120s backoff are built in; the keyless
 *       data.gov.sg quota 429s after about a dozen quick requests. Never shorten
 *       them, never parallelise, and never fetch from this repo or at build time.)
 *   2. python scripts/export_sg_official.py --sync
 *   3. npm run typecheck && npx vitest run
 *   4. commit on a feature branch; the snapshot test will point at any figure
 *      that moved, which is the intended prompt to re-read the copy.
 */

export const SG_OFFICIAL_STALE_DAYS = 90;
export const SG_OFFICIAL_LICENCE = 'Singapore Open Data Licence v1.0';
export const SG_OFFICIAL_LICENCE_URL = 'https://data.gov.sg/open-data-licence';

export interface SgOfficialSource {
  datasetKey: string;
  datasetName: string;
  agency: 'HDB' | 'MOM' | 'SingStat';
  datasetUrl: string;
  licence: string;
  licenceUrl: string;
  /** When this site pulled the dataset (ISO 8601 with offset). Drives the 90-day notice. */
  fetchedAt: string;
  /** How current the agency's own data is. A different claim from fetchedAt; both are shown. */
  latestPeriod: string;
  /** The agency stopped publishing. Only foreign_workforce, frozen at 2022-12. */
  discontinued?: boolean;
}

export interface SgTownRent {
  /** Official uppercase name, unaltered, so a row matches back to data.gov.sg. */
  town: string;
  /** Hand-written in scripts/export_sg_official.py. Never machine-translated. */
  townZh: string;
  medianRent: number;
}

export interface SgTownRentTrend {
  town: string;
  townZh: string;
  fromQuarter: string;
  fromRent: number;
  toQuarter: string;
  toRent: number;
  /** Derived by this script from the official quarterly series. */
  changePct: number;
}

export interface SgOfficialData {
  generatedOn: string;
  rent: {
    source: SgOfficialSource;
    quarter: string;
    flatType: '4-RM';
    /**
     * Written into the type so a whole-flat median can never be mistaken for the
     * price of one room. The estimate table on /cost-of-living is per person;
     * this is per household. They are different units and must not be added,
     * averaged, or swapped.
     */
    unit: 'whole_flat';
    /** 25 towns, highest first. Official values. */
    byTown: SgTownRent[];
    /** Derived: median of the 25 town medians, not an official publication. */
    medianOfTowns: number;
    /** Derived: nearest-rank quartiles across the 25 town medians. */
    p25: number;
    p75: number;
    highest: number;
    lowest: number;
    /** Derived: highest ÷ lowest. */
    spread: number;
    /** Derived: six-year change for the five towns the dashboard keeps in full. */
    trend: SgTownRentTrend[];
  };
  cpi: {
    source: SgOfficialSource;
    month: string;
    yoyAllItems: number;
    yoyFood: number;
    /** Includes owner-occupied imputed rent and utility rebates. NOT market rent. */
    yoyHousingUtilities: number;
    yoyTransport: number;
    /** Derived from the official index: cumulative change over five years. */
    cumulativeFiveYearPct: number;
    /** Derived: highest year-on-year print in the series and the month it landed. */
    peakYoy: number;
    peakYoyMonth: string;
  };
  income: {
    source: SgOfficialSource;
    year: string;
    medianMonthlyInclEmployerCpf: number;
    medianMonthlyExclEmployerCpf: number;
    /** Derived year-on-year changes. */
    yoyInclPct: number;
    yoyExclPct: number;
    /**
     * Citizens and PRs in full-time work, all occupations. Not a green-collar
     * band and not foreign-employee pay. Three different populations; this one
     * can neither confirm nor contradict the salary report on this site.
     */
    population: 'resident_full_time';
  };
  unemployment: {
    source: SgOfficialSource;
    period: string;
    seasonallyAdjustedRate: number;
    /** Derived: trailing quarters inside the 1.9-2.0 band. */
    quartersInBand: number;
    /** Derived: ten-year low and high. */
    tenYearLow: number;
    tenYearHigh: number;
    /**
     * Residents and non-residents together. A non-resident who loses a job
     * usually leaves and drops out of the labour force, so this understates how
     * hard a foreign job search is. Not a hiring-difficulty indicator.
     */
    coverage: 'overall';
  };
  /** Buying, not monthly outgoings. Carried for completeness; the page does not render it. */
  resale: {
    source: SgOfficialSource;
    month: string;
    medianByFlatType: Record<'3 ROOM' | '4 ROOM' | '5 ROOM' | 'EXECUTIVE', number>;
    /** Real transactions in the latest month, and across the whole window. */
    transactionsLatestMonth: number;
    transactionsInWindow: number;
    windowMonths: number;
  };
  /**
   * Discontinued by MOM after 2022-12. Kept so the discontinued flag has a home
   * and so nobody re-adds it thinking it is current. Not rendered anywhere.
   */
  foreignWorkforce: {
    source: SgOfficialSource;
    period: string;
    employmentPass: number;
    sPass: number;
    workPermit: number;
    otherWorkPasses: number;
  };
}

export const sgOfficial: SgOfficialData = {
  generatedOn: '2026-08-06',
  rent: {
    source: { datasetKey: 'hdb_rent', datasetName: 'Median Rent by Town and Flat Type', agency: 'HDB', datasetUrl: 'https://data.gov.sg/datasets/d_23000a00c52996c55106084ed0339566/view', licence: SG_OFFICIAL_LICENCE, licenceUrl: SG_OFFICIAL_LICENCE_URL, fetchedAt: '2026-08-06T16:34:15+08:00', latestPeriod: '2026-Q2' },
    quarter: '2026-Q2',
    flatType: '4-RM',
    unit: 'whole_flat',
    byTown: [
      { town: 'CENTRAL', townZh: '中央區', medianRent: 4600 },
      { town: 'QUEENSTOWN', townZh: '女皇鎮', medianRent: 4130 },
      { town: 'BUKIT MERAH', townZh: '紅山', medianRent: 4000 },
      { town: 'CLEMENTI', townZh: '金文泰', medianRent: 3900 },
      { town: 'GEYLANG', townZh: '芽籠', medianRent: 3800 },
      { town: 'KALLANG/WHAMPOA', townZh: '加冷／黃埔', medianRent: 3800 },
      { town: 'TOA PAYOH', townZh: '大巴窯', medianRent: 3800 },
      { town: 'BISHAN', townZh: '碧山', medianRent: 3650 },
      { town: 'ANG MO KIO', townZh: '宏茂橋', medianRent: 3500 },
      { town: 'JURONG WEST', townZh: '裕廊西', medianRent: 3500 },
      { town: 'TAMPINES', townZh: '淡濱尼', medianRent: 3500 },
      { town: 'BEDOK', townZh: '勿洛', medianRent: 3400 },
      { town: 'JURONG EAST', townZh: '裕廊東', medianRent: 3400 },
      { town: 'SERANGOON', townZh: '實龍崗', medianRent: 3400 },
      { town: 'MARINE PARADE', townZh: '馬林百列', medianRent: 3350 },
      { town: 'PASIR RIS', townZh: '巴西立', medianRent: 3350 },
      { town: 'BUKIT BATOK', townZh: '武吉巴督', medianRent: 3300 },
      { town: 'PUNGGOL', townZh: '榜鵝', medianRent: 3300 },
      { town: 'HOUGANG', townZh: '後港', medianRent: 3200 },
      { town: 'SENGKANG', townZh: '盛港', medianRent: 3200 },
      { town: 'SEMBAWANG', townZh: '三巴旺', medianRent: 3180 },
      { town: 'WOODLANDS', townZh: '兀蘭', medianRent: 3100 },
      { town: 'YISHUN', townZh: '義順', medianRent: 3100 },
      { town: 'BUKIT PANJANG', townZh: '武吉班讓', medianRent: 3000 },
      { town: 'CHOA CHU KANG', townZh: '蔡厝港', medianRent: 3000 },
    ],
    medianOfTowns: 3400,
    p25: 3200,
    p75: 3800,
    highest: 4600,
    lowest: 3000,
    spread: 1.53,
    trend: [
      { town: 'PUNGGOL', townZh: '榜鵝', fromQuarter: '2020-Q3', fromRent: 1900, toQuarter: '2026-Q2', toRent: 3300, changePct: 73.7 },
      { town: 'TAMPINES', townZh: '淡濱尼', fromQuarter: '2020-Q3', fromRent: 2000, toQuarter: '2026-Q2', toRent: 3500, changePct: 75.0 },
      { town: 'JURONG WEST', townZh: '裕廊西', fromQuarter: '2020-Q3', fromRent: 2000, toQuarter: '2026-Q2', toRent: 3500, changePct: 75.0 },
      { town: 'ANG MO KIO', townZh: '宏茂橋', fromQuarter: '2020-Q3', fromRent: 2140, toQuarter: '2026-Q2', toRent: 3500, changePct: 63.6 },
      { town: 'QUEENSTOWN', townZh: '女皇鎮', fromQuarter: '2020-Q3', fromRent: 2600, toQuarter: '2026-Q2', toRent: 4130, changePct: 58.8 },
    ],
  },
  cpi: {
    source: { datasetKey: 'cpi', datasetName: 'Consumer Price Index (CPI), 2024 As Base Year, Monthly', agency: 'SingStat', datasetUrl: 'https://data.gov.sg/datasets/d_bdaff844e3ef89d39fceb962ff8f0791/view', licence: SG_OFFICIAL_LICENCE, licenceUrl: SG_OFFICIAL_LICENCE_URL, fetchedAt: '2026-08-06T16:34:21+08:00', latestPeriod: '2026-06' },
    month: '2026-06',
    yoyAllItems: 1.94,
    yoyFood: 2.13,
    yoyHousingUtilities: 0.31,
    yoyTransport: 7.48,
    cumulativeFiveYearPct: 17.5,
    peakYoy: 7.49,
    peakYoyMonth: '2022-09',
  },
  income: {
    source: { datasetKey: 'income', datasetName: 'Median Gross Monthly Income From Employment of Full-Time Employed Residents (Total)', agency: 'MOM', datasetUrl: 'https://data.gov.sg/datasets/d_9cd9c40f22a4e45cac8f8b9d895fd5ce/view', licence: SG_OFFICIAL_LICENCE, licenceUrl: SG_OFFICIAL_LICENCE_URL, fetchedAt: '2026-08-06T16:34:25+08:00', latestPeriod: '2025' },
    year: '2025',
    medianMonthlyInclEmployerCpf: 5775,
    medianMonthlyExclEmployerCpf: 5000,
    yoyInclPct: 5.0,
    yoyExclPct: 2.9,
    population: 'resident_full_time',
  },
  unemployment: {
    source: { datasetKey: 'unemployment', datasetName: 'Overall Unemployment Rate, Quarterly', agency: 'MOM', datasetUrl: 'https://data.gov.sg/datasets/d_ca32584c91ee07d091a4ce75fa868414/view', licence: SG_OFFICIAL_LICENCE, licenceUrl: SG_OFFICIAL_LICENCE_URL, fetchedAt: '2026-08-06T16:34:21+08:00', latestPeriod: '2026-06' },
    period: '2026-06',
    seasonallyAdjustedRate: 2.0,
    quartersInBand: 13,
    tenYearLow: 1.8,
    tenYearHigh: 3.4,
    coverage: 'overall',
  },
  resale: {
    source: { datasetKey: 'hdb_resale', datasetName: 'Resale flat prices based on registration date from Jan-2017 onwards', agency: 'HDB', datasetUrl: 'https://data.gov.sg/datasets/d_8b84c4ee58e3cfc0ece0d773c8ca6abc/view', licence: SG_OFFICIAL_LICENCE, licenceUrl: SG_OFFICIAL_LICENCE_URL, fetchedAt: '2026-08-06T16:34:08+08:00', latestPeriod: '2026-07' },
    month: '2026-07',
    medianByFlatType: { '3 ROOM': 431278, '4 ROOM': 625000, '5 ROOM': 730000, 'EXECUTIVE': 900000 },
    transactionsLatestMonth: 2654,
    transactionsInWindow: 78567,
    windowMonths: 36,
  },
  foreignWorkforce: {
    source: { datasetKey: 'foreign_workforce', datasetName: 'Stock of Foreign Workforce by Pass Type', agency: 'MOM', datasetUrl: 'https://data.gov.sg/datasets/d_ca90ebca85472a1bf8fb01362b7233fa/view', licence: SG_OFFICIAL_LICENCE, licenceUrl: SG_OFFICIAL_LICENCE_URL, fetchedAt: '2026-08-06T16:34:29+08:00', latestPeriod: '2022-12', discontinued: true },
    period: '2022-12',
    employmentPass: 187300,
    sPass: 177900,
    workPermit: 1033500,
    otherWorkPasses: 25400,
  },
};

/** Every dataset in the snapshot, so a test or a page can iterate provenance. */
export const sgOfficialSources: SgOfficialSource[] = [
  sgOfficial.rent.source,
  sgOfficial.cpi.source,
  sgOfficial.income.source,
  sgOfficial.unemployment.source,
  sgOfficial.resale.source,
  sgOfficial.foreignWorkforce.source,
];

/** The four datasets the cost-of-living page actually renders. */
export const sgOfficialRenderedSources: SgOfficialSource[] = [
  sgOfficial.rent.source,
  sgOfficial.cpi.source,
  sgOfficial.income.source,
  sgOfficial.unemployment.source,
];

/**
 * Days since this site fetched the dataset. An unparseable or malformed date
 * returns Infinity so it reads as stale: fail closed, never fail fresh.
 */
export function sgOfficialAgeDays(fetchedAt: string, now: Date = new Date()): number {
  const fetched = new Date(fetchedAt).getTime();
  if (Number.isNaN(fetched)) return Number.POSITIVE_INFINITY;
  const ageDays = (now.getTime() - fetched) / 86_400_000;
  // A fetch date in the future is a clock skew or a typo, not freshness.
  if (ageDays < 0) return Number.POSITIVE_INFINITY;
  return ageDays;
}

/**
 * Signature deliberately mirrors isMarketPulseFresh so both can be probed by the
 * same shape of boundary test. The CONSEQUENCE is the opposite: marketPulse
 * hides itself when false, this only adds a notice. See the file header.
 */
export function isSgOfficialFresh(fetchedAt: string, now: Date = new Date()): boolean {
  return sgOfficialAgeDays(fetchedAt, now) <= SG_OFFICIAL_STALE_DAYS;
}

/** True when any dataset the page renders has gone past the stale window. */
export function anyRenderedSourceStale(now: Date = new Date()): boolean {
  return sgOfficialRenderedSources.some((s) => !isSgOfficialFresh(s.fetchedAt, now));
}
