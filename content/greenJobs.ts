import type { Locale } from '@/lib/constants';

/**
 * 綠領職缺雷達 (Green-Collar Jobs Radar) — a curated launchpad, NOT a scraped feed.
 * We never re-host or resell listings: every link points to an employer's own
 * page or a public job board's search. `weeklyPicks` is a small, human-approved
 * shortlist refreshed weekly (empty is fine — the page then nudges the newsletter).
 *
 * Data is language-neutral (orgs, URLs); chrome/labels live in `greenJobsCopy`.
 */
export type MarketKey = 'SG' | 'TW' | 'HK';

export interface JobLink {
  label: string;
  url: string;
}

export interface JobMarket {
  key: MarketKey;
  employers: string[]; // employers with a standing green-collar hiring presence
  boards: JobLink[]; // real, public search entry points (constructed, not scraped)
}

export interface WeeklyPick {
  org: string;
  roleZh: string;
  roleEn: string;
  market: MarketKey;
  url: string; // employer page or board search — never a scraped listing
}

export interface GreenJobsData {
  updatedAt: string; // YYYY-MM-DD — bump when weeklyPicks refresh
  markets: JobMarket[];
  weeklyPicks: WeeklyPick[];
}

export const greenJobs: GreenJobsData = {
  updatedAt: '2026-07-12',
  markets: [
    {
      key: 'SG',
      employers: ['EY', 'ERM', 'Arup', 'Deloitte', 'GlobalFoundries', 'GIC', 'Siemens Energy', 'Neste', 'Swiss Re', 'AXA'],
      boards: [
        { label: 'JobStreet · ESG', url: 'https://sg.jobstreet.com/ESG-jobs' },
        { label: 'Indeed · sustainability & ESG', url: 'https://sg.indeed.com/q-sustainability-esg-jobs.html' },
        { label: 'LinkedIn · sustainability', url: 'https://sg.linkedin.com/jobs/sustainability-jobs' },
      ],
    },
    {
      key: 'TW',
      employers: ['台灣世曦', 'KPMG', 'Deloitte 勤業眾信', '台積電', '中鼎工程', 'PwC'],
      boards: [
        { label: '104 · 永續', url: 'https://www.104.com.tw/jobs/search/?keyword=%E6%B0%B8%E7%BA%8C' },
        { label: '104 · ESG', url: 'https://www.104.com.tw/jobs/search/?keyword=ESG' },
        { label: 'Indeed · ESG', url: 'https://tw.indeed.com/q-esg-%E8%81%B7%E7%BC%BA.html' },
      ],
    },
    {
      key: 'HK',
      employers: ['HKEX', 'HSBC', 'ERM', 'AECOM', 'Arup'],
      boards: [
        { label: 'JobsDB · environmental', url: 'https://hk.jobsdb.com/environmental-jobs' },
        { label: 'LinkedIn · sustainability', url: 'https://hk.linkedin.com/jobs/sustainability-jobs' },
      ],
    },
  ],
  // Human-approved weekly shortlist. Kept empty until Michael reviews the first
  // batch — the page nudges the newsletter when this is empty.
  weeklyPicks: [],
};

export interface GreenJobsCopy {
  eyebrow: string;
  title: string;
  intro: string;
  updatedPrefix: string;
  weeklyTitle: string;
  weeklyEmpty: string;
  employersLabel: string;
  boardsLabel: string;
  sourceNote: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  backToMri: string;
  marketNames: Record<MarketKey, string>;
}

export const greenJobsCopy: Record<Locale, GreenJobsCopy> = {
  'zh-TW': {
    eyebrow: '綠領職缺雷達',
    title: '亞太綠領職缺,一頁看清該去哪裡找。',
    intro:
      '我們不轉存、不販售職缺——這頁把最值得盯的雇主與求職平台整理好,連結一律導向官方原始頁面。每週更新精選。',
    updatedPrefix: '更新於',
    weeklyTitle: '本週精選',
    weeklyEmpty: '本週精選整理中。訂閱《綠領情報》週刊,每週一收到當週 Top 10。',
    employersLabel: '長期招募綠領的雇主',
    boardsLabel: '精選搜尋入口',
    sourceNote: '連結導向雇主官方頁或求職平台;職缺內容與薪資一律以原始頁面為準。',
    ctaTitle: '不確定自己該投哪一個?',
    ctaBody: '綠領 MRI 免費幫你把履歷對到市場缺口,三分鐘告訴你哪一類職缺最適合你、缺哪一塊。',
    ctaButton: '做一次綠領 MRI(免費)→',
    backToMri: '← 回到免費 MRI',
    marketNames: { SG: '新加坡', TW: '台灣', HK: '香港' },
  },
  en: {
    eyebrow: 'Green-Collar Jobs Radar',
    title: 'APAC green-collar jobs — one page for where to actually look.',
    intro:
      'We don’t re-host or resell listings — this page curates the employers and job boards worth watching, and every link points to the original source. Picks refresh weekly.',
    updatedPrefix: 'Updated',
    weeklyTitle: 'This week’s picks',
    weeklyEmpty: 'This week’s picks are being curated. Subscribe to Green-Collar Intel Weekly to get the Top 10 every Monday.',
    employersLabel: 'Employers hiring green-collar consistently',
    boardsLabel: 'Curated search entry points',
    sourceNote: 'Links point to employer pages or job boards; listing details and salaries are per the original source.',
    ctaTitle: 'Not sure which one to go for?',
    ctaBody: 'The green-collar MRI maps your CV to the market gap for free — three minutes to see which roles fit you and what’s missing.',
    ctaButton: 'Take the green-collar MRI (free) →',
    backToMri: '← Back to the free MRI',
    marketNames: { SG: 'Singapore', TW: 'Taiwan', HK: 'Hong Kong' },
  },
};
