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
  /** Accessible name for the mobile menu toggle — its glyph (≡ / ×) is decorative. */
  menuOpen: string;
  menuClose: string;
  home: string;
  /**
   * Stages of a single journey, in order, phrased as the reader's own situation:
   * I don't know what I'm missing → I know, and I want to close it → I'm looking
   * at roles → I have an offer to compare. The practice module is the second
   * stage. It sat in the footer for a while, which left the journey with a hole:
   * the site told a reader what their gap was and then handed them job listings,
   * with nothing in between about closing it.
   */
  doors: { label: string; hint: string; href: string }[];
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
  menuOpen: '開啟選單',
  menuClose: '關閉選單',
  home: '首頁',
  doors: [
    { label: '我不知道我缺什麼', hint: '五分鐘免費診斷', href: '/mri' },
    { label: '我想補上缺的那一塊', hint: '免費 12 題判斷練習', href: '/judgment' },
    { label: '我正在看職缺', hint: '本週精選＋JD 判讀', href: '/jobs' },
    { label: '我在比薪資或 offer', hint: '亞太綠領薪資帶', href: '/salary-report' },
    { label: '我要去新加坡了', hint: '官方流程中文導覽', href: '/singapore' },
  ],
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
        { label: '台灣人赴新加坡指南', href: '/singapore' },
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
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  home: 'Home',
  doors: [
    { label: 'I don’t know what I’m missing', hint: 'Free 5-minute diagnostic', href: '/mri' },
    { label: 'I want to close the gap', hint: 'Free, 12 judgement exercises', href: '/judgment' },
    { label: 'I’m looking at roles', hint: 'Weekly picks + JD read', href: '/jobs' },
    { label: 'I’m comparing an offer', hint: 'APAC green-collar bands', href: '/salary-report' },
    { label: 'I’m moving to Singapore', hint: 'Relocation guide', href: '/singapore' },
  ],
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
        { label: 'Taiwan → Singapore guide', href: '/singapore' },
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

/**
 * The three surfaces that render the five doors, in the auditor's names.
 *
 *   door-mobile   the in-page grid on the home page. Named for how it is met,
 *                 not for a breakpoint: it renders at every width, but below
 *                 `lg` the header rail is hidden, so on a phone this grid IS
 *                 the doors.
 *   door-desktop  the header rail. `hidden lg:contents` — desktop only.
 *   door-menu     the header's hamburger disclosure. `lg:hidden`.
 *
 * Only the first one carried utm parameters, so two of the three door surfaces
 * arrived at /mri, /jobs and the rest indistinguishable from direct traffic and
 * every door's real pull read low. Sum a door with `utm_medium = 'door'`; split
 * it by surface with `utm_content`.
 */
export type DoorPlacement = 'door-mobile' | 'door-desktop' | 'door-menu';

/**
 * The one place a door link is built. Three call sites share it so the
 * parameters cannot drift apart again.
 *
 * `utm_source` stays honest rather than uniform: the in-page grid only exists
 * on the home page and keeps the `home` source it has been reporting for
 * months (so the 14-day baseline stays comparable), while the header ships on
 * every route and would be lying if it claimed the same origin.
 */
export function doorHref(locale: Locale, href: string, placement: DoorPlacement): string {
  const source = placement === 'door-mobile' ? 'home' : 'site_nav';
  return `/${locale}${href}?utm_source=${source}&utm_medium=door&utm_content=${placement}`;
}

/** The LINE Official Account handle, for the desktop search path. */
export const LINE_OA_ID = '@051mtbjb';
