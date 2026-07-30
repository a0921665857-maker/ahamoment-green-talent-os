import type { Locale } from '@/lib/constants';

/**
 * Site-wide navigation copy.
 *
 * Stand-alone rather than part of the locale schema for the same reason as
 * content/payment.ts: navigation is a rail, not a page, and it should not block
 * a future locale on filling it in.
 *
 * The three primary entries are the three decision moments, not the three
 * product categories. Before Gate 8 every page hand-wrote a nav containing only
 * the site name and a language switcher, so anyone arriving from search on
 * /salary-report had no way to reach anything else — the site was a star of
 * dead ends around the home page.
 */
export interface NavCopy {
  /** Skip-to-content label (accessibility). */
  skipToContent: string;
  home: string;
  doors: { label: string; hint: string; href: string }[];
  /**
   * The free practice tool, reachable from the header without becoming a fourth
   * door. It was only in the footer and on one home-page card, so the module the
   * site treats as its flagship was the hardest thing on the site to find. Kept
   * deliberately lighter than the doors: a door is a situation the reader
   * recognises, this is a thing they can go and do.
   */
  practice: { label: string; href: string };
  services: string;
  footerTitle: string;
  footerGroups: { title: string; links: { label: string; href: string }[] }[];
  contactTitle: string;
  contactLine: string;
  contactEmail: string;
  /** Desktop LINE instructions — the mobile deep link does nothing on a laptop. */
  lineDesktopTitle: string;
  lineDesktopBody: string;
  lineIdLabel: string;
  lineCopy: string;
  lineCopied: string;
}

const zh: NavCopy = {
  skipToContent: '跳到主要內容',
  home: '首頁',
  doors: [
    { label: '我不知道下一步怎麼走', hint: '五分鐘免費診斷', href: '/mri' },
    { label: '我正在看職缺或準備轉職', hint: '本週精選＋JD 判讀', href: '/jobs' },
    { label: '我在比薪資、職級或 offer', hint: '亞太綠領薪資帶', href: '/salary-report' },
  ],
  practice: { label: '綠領判斷力（免費）', href: '/judgment' },
  services: '服務與定價',
  footerTitle: '站內索引',
  footerGroups: [
    {
      title: '診斷',
      links: [
        { label: '綠領 MRI 免費診斷', href: '/mri' },
        { label: '看一份完整範例', href: '/sample' },
        { label: '八種綠領人才類型', href: '/types' },
      ],
    },
    {
      title: '資料與情報',
      links: [
        { label: '綠領揭薪指數（週更）', href: '/salary-index' },
        { label: '2026 亞太綠領薪資報告', href: '/salary-report' },
        { label: '綠領晉級地圖', href: '/levelup' },
        { label: '綠領職缺雷達（週更）', href: '/jobs' },
        { label: '異地生活成本', href: '/cost-of-living' },
      ],
    },
    {
      title: '工具與練習',
      links: [
        { label: 'JD 判讀器', href: '/jd' },
        { label: '綠領判斷力練習', href: '/judgment' },
        { label: 'MBA ROI 試算', href: '/mba-roi' },
      ],
    },
    {
      title: '關於',
      links: [
        { label: '服務與定價', href: '/services' },
        { label: '隱私與資料', href: '/privacy' },
      ],
    },
  ],
  contactTitle: '聯絡方式',
  contactLine: '加 LINE 直接問我',
  contactEmail: 'mri@ahamoment-career.com',
  lineDesktopTitle: '用電腦看這頁？',
  lineDesktopBody:
    'LINE 的加好友連結只在手機上有作用。用電腦的話，打開 LINE 搜尋下面這個 ID 就找得到我。',
  lineIdLabel: 'LINE ID',
  lineCopy: '複製',
  lineCopied: '已複製',
};

const en: NavCopy = {
  skipToContent: 'Skip to content',
  home: 'Home',
  doors: [
    { label: 'I don’t know what my next move is', hint: 'Free 5-minute diagnostic', href: '/mri' },
    { label: 'I’m looking at roles or preparing a move', hint: 'Weekly picks + JD read', href: '/jobs' },
    { label: 'I’m comparing salary, level or an offer', hint: 'APAC green-collar bands', href: '/salary-report' },
  ],
  practice: { label: 'Judgement practice (free)', href: '/judgment' },
  services: 'Services & pricing',
  footerTitle: 'Everything on this site',
  footerGroups: [
    {
      title: 'Diagnostic',
      links: [
        { label: 'Green Career MRI (free)', href: '/mri' },
        { label: 'See a full sample report', href: '/sample' },
        { label: 'The eight green-career types', href: '/types' },
      ],
    },
    {
      title: 'Data & intelligence',
      links: [
        { label: 'Posted-salary index (weekly)', href: '/salary-index' },
        { label: '2026 APAC green salary report', href: '/salary-report' },
        { label: 'Green career level-up map', href: '/levelup' },
        { label: 'Green jobs radar (weekly)', href: '/jobs' },
        { label: 'Cost of living', href: '/cost-of-living' },
      ],
    },
    {
      title: 'Tools & practice',
      links: [
        { label: 'JD reader', href: '/jd' },
        { label: 'Green-collar judgement practice', href: '/judgment' },
        { label: 'MBA ROI calculator', href: '/mba-roi' },
      ],
    },
    {
      title: 'About',
      links: [
        { label: 'Services & pricing', href: '/services' },
        { label: 'Privacy & your data', href: '/privacy' },
      ],
    },
  ],
  contactTitle: 'Contact',
  contactLine: 'Ask me on LINE',
  contactEmail: 'mri@ahamoment-career.com',
  lineDesktopTitle: 'Reading this on a laptop?',
  lineDesktopBody:
    'The LINE add-friend link only works on a phone. On desktop, open LINE and search for the ID below.',
  lineIdLabel: 'LINE ID',
  lineCopy: 'Copy',
  lineCopied: 'Copied',
};

export const navCopy: Record<Locale, NavCopy> = { 'zh-TW': zh, en };

/** The LINE Official Account handle, for the desktop search path. */
export const LINE_OA_ID = '@051mtbjb';
