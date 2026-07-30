import type { Locale } from '@/lib/constants';

/**
 * 綠領揭薪指數 — a snapshot of the salary_index ledger, re-exported 2026-07-30.
 *
 * HOW THE ROWS GET HERE. The `green-jobs-weekly` scheduled job runs every
 * Sunday, sweeps green-collar postings across Singapore, Hong Kong and the UK,
 * and records every qualifying posting that printed a salary. It is automated;
 * no row is hand-entered. All 98 rows currently in the ledger were inserted
 * between 2026-07-21 and 2026-07-28 — the ledger is days old, not months. The
 * 2025-11 to 2026-07 span in the dates below is when the POSTINGS were seen,
 * not how long collection has run.
 *
 * WHAT GETS EXCLUDED, and why the numbers changed on 2026-07-30:
 *   - `estimated` and `self_reported` rows never enter (1 estimated row exists).
 *   - Rows whose seniority the posting never made readable: 26 of 98.
 *   - **Internships.** One "Sustainability Intern" posting at SGD 1,000–1,200
 *     sat inside the 0–3 band and, under the first export's min-to-max range,
 *     single-handedly published an entry floor of SGD 1,000. An intern is not
 *     an early-career hire; the row is excluded, not averaged in.
 *   - **Duplicates.** 12 rows were the same posting captured by more than one
 *     sweep, or the same posting filed under two functions. The dedupe_hash was
 *     meant to stop this and did not. n was inflated until this export.
 * 72 posted rows with readable seniority → 59 distinct postings in cells.
 *
 * WHAT IS PUBLISHED. Median plus P25–P75 over each posting's band midpoint —
 * which is what INDEX_METHODOLOGY.md §2 specified all along. The first export
 * shipped min-to-max instead, which is why one intern could move the floor.
 * A range still appears only at n ≥ MIN_N; below that the cell keeps its place
 * on the page with its n and no numbers.
 *
 * VERIFICATION STATE. Every row was read off the posting at capture time and
 * none has been re-opened since, so the snapshot is
 * `source_available_unverified`. Nothing here may be described as audited.
 */

export const MIN_N = 5;

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
  exportedOn: '2026-07-30',
  /** Every row the ledger holds. */
  totalObservations: 98,
  postedObservations: 97,
  /** Seniority unreadable from the posting, so excluded from every cell. */
  excludedUnknownSeniority: 26,
  /** An intern posting is not an early-career salary. */
  excludedInternship: 1,
  /** Same posting captured twice, or filed under two functions. */
  excludedDuplicate: 12,
  /** Distinct postings that actually sit in a cell. */
  postingsInCells: 59,
  byMarket: { SG: 83, HK: 8, UK: 7 },
  firstSeen: '2025-11-13',
  lastSeen: '2026-07-28',
  /** Automated weekly sweep, not hand-collected. */
  collectedBy: 'green-jobs-weekly scheduled sweep (Sundays)',
  ledgerOpenedOn: '2026-07-21',
  verification: 'source_available_unverified' as VerificationStatus,
} as const;

export const salaryCells: SalaryCell[] = [
  { market: 'SG', fn: 'corporate_sustainability', seniority: '0-3', n: 8, median: 4000, p25: 3750, p75: 4200, currency: 'SGD', period: 'monthly', firstSeen: '2026-05-28', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '0-3', n: 8, median: 4125, p25: 3750, p75: 4250, currency: 'SGD', period: 'monthly', firstSeen: '2025-11-13', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'corporate_sustainability', seniority: '4-8', n: 7, median: 5750, p25: 5000, p75: 6750, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '4-8', n: 4, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-17', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '0-3', n: 4, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2025-12-29', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'corporate_sustainability', seniority: '0-3', n: 3, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-02', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '4-8', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '8+', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'compliance_disclosure', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-06', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'compliance_disclosure', seniority: '4-8', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-20', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '4-8', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-09', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'corporate_sustainability', seniority: '8+', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-07', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-06-24', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'sustainable_finance', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-09', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'sustainable_finance', seniority: '0-3', n: 2, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '8+', n: 1, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '8+', n: 1, median: null, p25: null, p75: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-21', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'esg_consulting', seniority: '8+', n: 1, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-21', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'compliance_disclosure', seniority: '0-3', n: 1, median: null, p25: null, p75: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-06-30', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'climate_tech', seniority: '4-8', n: 1, median: null, p25: null, p75: null, currency: 'GBP', period: 'annual', firstSeen: '2026-07-03', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'sustainable_finance', seniority: '0-3', n: 1, median: null, p25: null, p75: null, currency: 'GBP', period: 'annual', firstSeen: '2026-06-12', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
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
