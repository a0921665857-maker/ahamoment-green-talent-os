import type { Locale } from '@/lib/constants';

/**
 * Post-checkout copy. Stand-alone (like content/newsletter.ts) rather than part
 * of the locale schema: these two pages are a self-contained rail and adding
 * them to the schema would force every future locale to fill payment strings
 * before it can render a single page.
 *
 * Honesty rules applied here: nothing claims a receipt was emailed by us
 * (Stripe sends it), nothing claims a slot is reserved before the buyer books
 * one, and the cancelled page does not treat leaving as a mistake.
 */
export interface PaymentCopy {
  success: {
    title: string;
    body: string;
    nextTitle: string;
    next: string[];
    bookCta: string;
    lineCta: string;
    homeCta: string;
    receiptNote: string;
  };
  cancelled: {
    title: string;
    body: string;
    servicesCta: string;
    lineCta: string;
    homeCta: string;
  };
}

export const paymentCopy: Record<Locale, PaymentCopy> = {
  'zh-TW': {
    success: {
      title: '收到了，付款完成。',
      body: '接下來由我親自接手，不會有客服或表單擋在中間。',
      nextTitle: '接下來會發生什麼',
      next: [
        '你會收到一封 Stripe 寄出的付款收據，那是他們的系統寄的，不是我。',
        '請用下面的連結挑一個你方便的時段。我只開週一與週三晚上，以及部分週六早上（新加坡時間，與台灣同時區）。',
        '約好之後我會寄一份很短的會前問卷：你正在做的決定是什麼、有沒有截止日、手上有哪些資料。填不填都可以，填了我們能少花十分鐘暖身。',
        '對談結束後 48 小時內，我會把當天講的判斷寫成一頁備忘錄寄給你。',
      ],
      bookCta: '挑一個時段',
      lineCta: '加 LINE 直接找我',
      homeCta: '回首頁',
      receiptNote:
        '收據與發票由 Stripe 開立與寄送。本網站不保存你的完整卡號，也看不到你的付款資料。',
    },
    cancelled: {
      title: '付款沒有完成。',
      body: '沒關係，你的卡沒有被扣款，也沒有留下任何紀錄。如果只是想再想一下、或想先確認這個服務適不適合你，先聊 30 分鐘是完全正常的順序——那一場免費。',
      servicesCta: '再看一次服務內容',
      lineCta: '加 LINE 問我一個問題',
      homeCta: '回首頁',
    },
  },
  en: {
    success: {
      title: 'Payment received.',
      body: 'From here it is me, personally — no support desk and no forms in between.',
      nextTitle: 'What happens next',
      next: [
        'Stripe sends you a receipt. That comes from their system, not from me.',
        'Use the link below to pick a time. I only open Monday and Wednesday evenings, plus some Saturday mornings (Singapore time).',
        'Once we have a slot I send a short pre-call questionnaire: which decision you are facing, whether there is a deadline, and what material you already have. Filling it in is optional — it just saves us ten minutes of warm-up.',
        'Within 48 hours of the call you get the judgement written up as a one-page memo.',
      ],
      bookCta: 'Pick a time',
      lineCta: 'Reach me on LINE',
      homeCta: 'Back to the home page',
      receiptNote:
        'Receipts and invoices are issued and sent by Stripe. This site never stores your full card number and cannot see your payment details.',
    },
    cancelled: {
      title: 'Payment was not completed.',
      body: 'Nothing was charged and nothing was recorded. If you wanted more time, or want to check the service is right for you first, starting with 30 minutes is the normal order — and that call is free.',
      servicesCta: 'Look at the services again',
      lineCta: 'Ask me one question on LINE',
      homeCta: 'Back to the home page',
    },
  },
};
