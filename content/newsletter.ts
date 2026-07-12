import type { Locale } from '@/lib/constants';

/** Copy for the newsletter signup box (《綠領情報》週刊). Locale-keyed, standalone. */
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
    eyebrow: '綠領情報週刊',
    title: '每週一封,把亞太綠領的職缺與薪資變化,整理成三分鐘讀得完的情報。',
    placeholder: '你的 email',
    button: '免費訂閱',
    submitting: '訂閱中…',
    success: '訂閱成功——下一期發出時你會收到。',
    errorInvalid: '這個 email 看起來不太對,再確認一下?',
    errorGeneric: '訂閱暫時失敗,稍後再試一次。',
    privacy: '只寄《綠領情報》,隨時可退訂,絕不轉售你的 email。',
  },
  en: {
    eyebrow: 'Green-Collar Intel Weekly',
    title: 'One email a week — APAC green-collar jobs and salary shifts, distilled into a three-minute read.',
    placeholder: 'your email',
    button: 'Subscribe free',
    submitting: 'Subscribing…',
    success: 'You’re in — you’ll get the next issue when it goes out.',
    errorInvalid: 'That email looks off — mind checking it?',
    errorGeneric: 'Subscription failed for now — please try again shortly.',
    privacy: 'Only the Green-Collar Intel issue, unsubscribe anytime, we never sell your email.',
  },
};
