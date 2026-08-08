import type { Locale } from '@/lib/constants';

/**
 * Copy for the newsletter signup box (《綠領情報》). Locale-keyed, standalone.
 *
 * NO SEND FREQUENCY IS PROMISED (2026-08-08 freshness audit). This box shipped on
 * 2026-07-12 saying 「每週一封」 / "One email a week" on four pages, and by the
 * audit not one issue had been sent — there is no sending pipeline in this repo at
 * all (lib/email.ts has four functions and none of them is an issue). A promise
 * nobody can keep is worse than no promise: the first thing a subscriber learns
 * about the list is that its stated cadence was fiction. The copy now says what is
 * actually true, which is that an issue arrives when there is something worth
 * sending. Do not put a cadence back until something in this repo can send one.
 */
export interface NewsletterCopy {
  eyebrow: string;
  title: string;
  placeholder: string;
  button: string;
  submitting: string;
  success: string;
  errorInvalid: string;
  errorGeneric: string;
  privacy: string;
}

export const newsletterCopy: Record<Locale, NewsletterCopy> = {
  'zh-TW': {
    eyebrow: '綠領情報',
    title:
      '有值得說的東西時，我會把亞太綠領的職缺和薪資變化，整理成三分鐘讀得完的一封信寄給你。不定期，隨時可退訂。',
    placeholder: '你的 email',
    button: '免費訂閱',
    submitting: '訂閱中…',
    success: '訂閱成功，下一期發出時你會收到。',
    errorInvalid: '這個 email 看起來不太對，再確認一下？',
    errorGeneric: '這一步沒送出去，稍等一下再按一次就好。',
    privacy: '只寄《綠領情報》，隨時可退訂，絕不轉售你的 email。',
  },
  en: {
    eyebrow: 'Green-Collar Intel',
    title:
      'When there is something worth sending, I distil APAC green-collar jobs and salary shifts into a three-minute read. No fixed schedule, unsubscribe anytime.',
    placeholder: 'your email',
    button: 'Subscribe free',
    submitting: 'Subscribing…',
    success: 'You’re in — you’ll get the next issue when it goes out.',
    errorInvalid: 'That email looks off — mind checking it?',
    errorGeneric: 'That didn’t go through. Give it a moment and press it again.',
    privacy: 'Only the Green-Collar Intel issue, unsubscribe anytime, we never sell your email.',
  },
};
