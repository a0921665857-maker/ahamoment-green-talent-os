import type { QuestionsContent } from '../schema';

export const questions: QuestionsContent = {
  intro: {
    title: '有幾件事，你的資料還沒告訴我們',
    body: '三到五個快問快答——只問真的讀不出來的部分。這會讓報告精準很多。',
  },
  emailGate: {
    // 具約束力的文案——創辦人 2026-06-12 指定。未經同意請勿改寫。
    title: '報告要寄到哪裡？',
    body: '我們會產出你的個人化報告，並寄一份給你保存。輸入 email 後，你也可以立即查看結果。',
    emailLabel: 'Email',
    emailPlaceholder: 'you@example.com',
    nameLabel: '稱呼（選填）',
    namePlaceholder: '報告裡要怎麼稱呼你？',
  },
  submit: '產生我的報告',
  questions: {
    q_target_move: {
      label: '你下一步想往哪裡走？',
      type: 'text',
      placeholder: '例：在新加坡做碳市場 BD、進企業內部做永續策略、還在兩條路之間猶豫…',
    },
    q_timeline: {
      label: '你希望這個轉換什麼時候發生？',
      type: 'select',
      options: [
        { value: '<6m', label: '6 個月內' },
        { value: '6-12m', label: '6 到 12 個月' },
        { value: '12m+', label: '一年以上' },
        { value: 'unknown', label: '還不確定' },
      ],
    },
    q_mba_intent: {
      label: 'MBA 在你的計畫裡是什麼位置？',
      type: 'select',
      options: [
        { value: 'active', label: '正在申請' },
        { value: 'considering', label: '認真考慮中' },
        { value: 'later', label: '也許之後' },
        { value: 'no', label: '不在考慮範圍' },
      ],
    },
    q_geography: {
      label: '你鎖定哪些市場？',
      type: 'text',
      placeholder: '例：新加坡、大中華區、留在亞太、走向全球…',
    },
    q_commercial_ownership: {
      label: '你曾經直接對某個商業數字負責嗎？',
      type: 'select',
      options: [
        { value: 'revenue', label: '有——營收或業績目標' },
        { value: 'budget', label: '有——預算或損益項目' },
        { value: 'no', label: '沒有直接負責過' },
        { value: 'unsure', label: '不好說' },
      ],
    },
    q_quantified_result: {
      label: '分享一個你能講出數字的成果。',
      type: 'text',
      placeholder: '例：替客戶把範疇三盤查工時砍 40%、完成 US$300k 續約、帶過 6 人團隊…',
    },
    q_green_focus: {
      label: '你實際做過哪些綠色經濟領域的工作？',
      type: 'text',
      placeholder: '例：SBTi 目標設定、CBAM 因應、碳權盡職調查、ESG 報告書…',
    },
    q_recent_achievement: {
      label: '過去兩年，哪一項成果你敢在面試裡為它辯護？',
      type: 'text',
      placeholder: '一件具體的事——你做了什麼，以及因此改變了什麼。',
    },
  },
};
