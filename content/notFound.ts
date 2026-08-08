import type { Locale } from '@/lib/constants';

/**
 * 404 copy.
 *
 * Stand-alone and locale-keyed for the same reason as content/nav.ts: this is
 * chrome, not a page, and it should not block a future locale on filling in the
 * whole schema.
 *
 * Until this existed the site had no 404 of its own, so a Traditional Chinese
 * reader who mistyped a URL got Next's built-in English "404: This page could
 * not be found." — an English dead end inside a site that was rebuilt
 * specifically to remove dead ends. Both exits below are the two the reader
 * actually wants: the home page, and the free MRI. The full site index is in
 * the footer that renders under this page anyway, and the copy says so rather
 * than duplicating the list.
 */
export interface NotFoundCopy {
  eyebrow: string;
  title: string;
  /**
   * The tab / history / bookmark / share title. Separate from `title` because a
   * heading can rely on the page around it and a tab label cannot: out of
   * context "這一頁不在這裡" could be any page on any site, so this one carries
   * the site name. It is set by rendering a <title> element in the page's own
   * JSX rather than by a metadata export — see app/not-found.tsx for why the
   * export does nothing here.
   */
  metaTitle: string;
  body: string;
  homeCta: string;
  mriCta: string;
  indexHint: string;
}

export const notFoundCopy: Record<Locale, NotFoundCopy> = {
  'zh-TW': {
    eyebrow: '404',
    title: '這一頁不在這裡',
    metaTitle: '這一頁不在這裡 · AhaMoment 綠色職涯 MRI',
    body: '你打開的網址後面沒有頁面。可能是連結少了一段，也可能這一頁搬過位置。下面兩個出口都還通。',
    homeCta: '回首頁',
    mriCta: '做一次綠領 MRI（免費）→',
    indexHint: '整站的頁面索引，就在這一頁最下面。',
  },
  en: {
    eyebrow: '404',
    title: 'This page is not here',
    metaTitle: 'This page is not here · AhaMoment Green Career MRI',
    body: 'The URL you opened has no page behind it. Either the link lost a piece on the way, or the page moved. Both exits below still work.',
    homeCta: 'Back to home',
    mriCta: 'Run the free green-career MRI →',
    indexHint: 'The full index of everything on this site is at the bottom of this page.',
  },
};
