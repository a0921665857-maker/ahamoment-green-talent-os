import type { Locale } from '@/lib/constants';

/**
 * 綠領揭薪指數 — generated file. Do not hand-edit.
 *
 * Regenerate with `python scripts/export_salary_index.py`, which is run by the
 * green-jobs-weekly scheduled job every Sunday after that week's postings have
 * been inserted. Editing this file by hand will be silently overwritten.
 *
 * HOW THE ROWS GET HERE. green-jobs-weekly sweeps green-collar postings across
 * Singapore, Hong Kong and the UK every Sunday and records every qualifying
 * posting that printed a salary. It is automated; no row is hand-entered. The
 * ledger opened on 2026-07-21. The 2025-11-13 to 2026-08-06 span below is when
 * the POSTINGS were seen, not how long collection has run.
 *
 * WHAT IS EXCLUDED, and why:
 *   - estimated and self-reported rows never enter.
 *   - 27 rows whose seniority the posting never made readable.
 *   - 1 internship posting(s). An intern is not an early-career hire,
 *     and under a min-to-max range one intern moves the entire floor — which is
 *     exactly what happened in the first snapshot.
 *   - 12 duplicate rows: the same posting captured by more than one sweep,
 *     or filed under two functions.
 *   73 distinct postings remain in cells.
 *
 * WHAT IS PUBLISHED. Median plus P25–P75 over each posting's band midpoint, per
 * INDEX_METHODOLOGY.md §2, and only at n >= MIN_N. Below the threshold the cell
 * keeps its place with its n and no numbers.
 *
 * VERIFICATION. Every row was read off the posting at capture time and none has
 * been re-opened since, so the snapshot is `source_available_unverified`.
 * Nothing here may be described as audited.
 */

export const MIN_N = 5;
export const GENERATED_ON = '2026-08-08';

export type Market = 'SG' | 'HK' | 'UK';
export type Fn =
  | 'sustainable_finance'
  | 'carbon_env_commodities'
  | 'corporate_sustainability'
  | 'esg_consulting'
  | 'climate_tech'
  | 'compliance_disclosure';
export type Seniority = '0-3' | '4-8' | '8+';

/** How much a number on this page has been checked. Only `manually_verified`
 * may ever be described as audited; nothing is that yet. */
export type VerificationStatus =
  | 'manually_verified'
  | 'source_available_unverified'
  | 'automatically_collected'
  | 'source_unavailable'
  | 'excluded';

export interface SalaryCell {
  market: Market;
  fn: Fn;
  seniority: Seniority;
  /** Distinct postings behind this cell. Shown even when below MIN_N. */
  n: number;
  /** Median of the postings' band midpoints. Null below MIN_N. */
  median: number | null;
  /** Interquartile range — the published band. Null below MIN_N. */
  p25: number | null;
  p75: number | null;
  currency: string;
  period: 'monthly' | 'annual';
  firstSeen: string;
  lastSeen: string;
  verification: VerificationStatus;
}

export const salaryIndexMeta = {
  exportedOn: '2026-08-08',
  /** Every row the ledger holds. */
  totalObservations: 113,
  postedObservations: 112,
  /** Seniority unreadable from the posting, so excluded from every cell. */
  excludedUnknownSeniority: 27,
  /** An intern posting is not an early-career salary. */
  excludedInternship: 1,
  /** Same posting captured twice, or filed under two functions. */
  excludedDuplicate: 12,
  /** Distinct postings that actually sit in a cell. */
  postingsInCells: 73,
  byMarket: { SG: 98, HK: 8, UK: 7 },
  firstSeen: '2025-11-13',
  lastSeen: '2026-08-06',
  /** Automated weekly sweep, not hand-collected. */
  collectedBy: 'green-jobs-weekly scheduled sweep (Sundays)',
  ledgerOpenedOn: '2026-07-21',
  verification: 'source_available_unverified' as VerificationStatus,
} as const;

export const salaryCells: SalaryCell[] = [
  { market: 'SG', fn: 'corporate_sustainability', seniority: '0-3', n: 12, median: 4100, p25: 3750, p75: 4250, currency: 'SGD', period: 'monthly', firstSeen: '2026-05-28', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '0-3', n: 9, median: 4250, p25: 3750, p75: 4750, currency: 'SGD', period: 'monthly', firstSeen: '2025-11-13', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'corporate_sustainability', seniority: '4-8', n: 8, median: 6250, p25: 5000, p75: 6750, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '0-3', n: 4, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-06-24', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '8+', n: 4, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '0-3', n: 4, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2025-12-29', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '4-8', n: 4, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-17', lastSeen: '2026-08-02', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'corporate_sustainability', seniority: '0-3', n: 3, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-02', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '4-8', n: 3, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'corporate_sustainability', seniority: '8+', n: 3, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-07', lastSeen: '2026-08-02', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'compliance_disclosure', seniority: '4-8', n: 3, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-20', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'sustainable_finance', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-09', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'sustainable_finance', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '4-8', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-09', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '8+', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-08-06', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'compliance_disclosure', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-06', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'esg_consulting', seniority: '8+', n: 1, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-21', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'compliance_disclosure', seniority: '0-3', n: 1, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-06-30', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '8+', n: 1, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-21', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'sustainable_finance', seniority: '0-3', n: 1, median: null, p25: null, p75: null, currency: 'GBP', period: 'annual', firstSeen: '2026-06-12', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'climate_tech', seniority: '4-8', n: 1, median: null, p25: null, p75: null, currency: 'GBP', period: 'annual', firstSeen: '2026-07-03', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'climate_tech', seniority: '8+', n: 1, median: null, p25: null, p75: null, currency: 'GBP', period: 'annual', firstSeen: '2026-06-23', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
];
export function publishable(cell: SalaryCell): boolean {
  return cell.n >= MIN_N && cell.p25 !== null && cell.p75 !== null;
}

/** Bilingual labels for the ledger's controlled vocabularies. */
export const fnLabels: Record<Locale, Record<Fn, string>> = {
  'zh-TW': {
    sustainable_finance: '永續金融',
    carbon_env_commodities: '碳與環境商品',
    corporate_sustainability: '企業永續部門',
    esg_consulting: 'ESG 顧問',
    climate_tech: '氣候科技',
    compliance_disclosure: '法遵與揭露',
  },
  en: {
    sustainable_finance: 'Sustainable finance',
    carbon_env_commodities: 'Carbon & environmental commodities',
    corporate_sustainability: 'In-house sustainability',
    esg_consulting: 'ESG consulting',
    climate_tech: 'Climate tech',
    compliance_disclosure: 'Compliance & disclosure',
  },
};

export const marketLabels: Record<Locale, Record<Market, string>> = {
  'zh-TW': { SG: '新加坡', HK: '香港', UK: '英國' },
  en: { SG: 'Singapore', HK: 'Hong Kong', UK: 'United Kingdom' },
};

export const seniorityLabels: Record<Locale, Record<Seniority, string>> = {
  'zh-TW': { '0-3': '0–3 年', '4-8': '4–8 年', '8+': '8 年以上' },
  en: { '0-3': '0–3 yrs', '4-8': '4–8 yrs', '8+': '8+ yrs' },
};
