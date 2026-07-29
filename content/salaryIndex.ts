import type { Locale } from '@/lib/constants';

/**
 * 綠領揭薪指數 — a snapshot of the salary_index ledger, exported 2026-07-30.
 *
 * PROVENANCE. Every row behind these cells is a salary that a real job posting
 * printed. Nothing here is modelled, inferred, self-reported or averaged from a
 * recruiter's guide. The ledger's own rules, kept verbatim:
 *   - only `posted` salaries enter (one `estimated` row exists and is excluded);
 *   - rows whose seniority could not be read from the posting are excluded from
 *     every cell — that is 26 of 98 rows, and they are counted in `excluded`;
 *   - a cell publishes a range only at n ≥ MIN_N. Below that the cell still
 *     appears, with its n, and no numbers.
 *
 * The last rule is the point of the page. An empty cell that says "n=2, not
 * enough" is the product; filling it in would make this the thing it exists to
 * replace.
 *
 * VERIFICATION STATE. Each observation was captured from the posting at the
 * time. They have NOT each been re-opened and re-read since, so the whole
 * snapshot is `source_available_unverified`. Do not describe this data as
 * audited until a spot-check is recorded (see docs/execution/NEXT_MORNING.md).
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
  /** Observations behind this cell. Shown even when below MIN_N. */
  n: number;
  /** Lowest posted minimum / highest posted maximum. Null below MIN_N. */
  lo: number | null;
  hi: number | null;
  currency: string;
  period: 'monthly' | 'annual';
  firstSeen: string;
  lastSeen: string;
  verification: VerificationStatus;
}

export const salaryIndexMeta = {
  exportedOn: '2026-07-30',
  totalObservations: 98,
  postedObservations: 97,
  /** Seniority unreadable from the posting, so excluded from every cell. */
  excludedUnknownSeniority: 26,
  byMarket: { SG: 83, HK: 8, UK: 7 },
  firstSeen: '2025-11-13',
  lastSeen: '2026-07-28',
  verification: 'source_available_unverified' as VerificationStatus,
} as const;

export const salaryCells: SalaryCell[] = [
  { market: 'SG', fn: 'corporate_sustainability', seniority: '0-3', n: 11, lo: 1000, hi: 6500, currency: 'SGD', period: 'monthly', firstSeen: '2026-05-28', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'corporate_sustainability', seniority: '4-8', n: 9, lo: 3500, hi: 10000, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '0-3', n: 9, lo: 1000, hi: 5500, currency: 'SGD', period: 'monthly', firstSeen: '2025-11-13', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '8+', n: 4, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '0-3', n: 4, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2025-12-29', lastSeen: '2026-07-28', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '4-8', n: 4, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-17', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'corporate_sustainability', seniority: '0-3', n: 3, lo: null, hi: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-02', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '4-8', n: 3, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'compliance_disclosure', seniority: '4-8', n: 3, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-20', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '8+', n: 3, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'sustainable_finance', seniority: '0-3', n: 2, lo: null, hi: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-09', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'carbon_env_commodities', seniority: '0-3', n: 2, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-06-24', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'climate_tech', seniority: '8+', n: 2, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-21', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'compliance_disclosure', seniority: '0-3', n: 2, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-06', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'corporate_sustainability', seniority: '8+', n: 2, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-07', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'esg_consulting', seniority: '4-8', n: 2, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-09', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'SG', fn: 'sustainable_finance', seniority: '0-3', n: 2, lo: null, hi: null, currency: 'SGD', period: 'monthly', firstSeen: '2026-07-22', lastSeen: '2026-07-26', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'compliance_disclosure', seniority: '0-3', n: 1, lo: null, hi: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-06-30', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'HK', fn: 'esg_consulting', seniority: '8+', n: 1, lo: null, hi: null, currency: 'HKD', period: 'monthly', firstSeen: '2026-07-21', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'climate_tech', seniority: '4-8', n: 1, lo: null, hi: null, currency: 'GBP', period: 'annual', firstSeen: '2026-07-03', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'climate_tech', seniority: '8+', n: 1, lo: null, hi: null, currency: 'GBP', period: 'annual', firstSeen: '2026-06-23', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
  { market: 'UK', fn: 'sustainable_finance', seniority: '0-3', n: 1, lo: null, hi: null, currency: 'GBP', period: 'annual', firstSeen: '2026-06-12', lastSeen: '2026-07-22', verification: 'source_available_unverified' },
];

export function publishable(cell: SalaryCell): boolean {
  return cell.n >= MIN_N && cell.lo !== null && cell.hi !== null;
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
