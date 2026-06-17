import type { ConsentContent } from '../schema';

/** 具約束力的文案 v1 — 見 PRIVACY_AND_CONSENT.md。修改前請同步更新該文件。 */
export const consent: ConsentContent = {
  processing: {
    label: '我同意系統以 AI 處理我提供的資料，用於產生我的綠色職涯 MRI 報告。',
    detail:
      '您的資料僅用於產生這份報告；若您之後選擇付費服務，也會用於該服務的準備。原始上傳內容將於 90 天後自動刪除。我們不會用您的資料訓練 AI 模型，也不會對外分享或公開。您可以隨時要求我們刪除全部資料。',
  },
  aggregate: {
    label: '選填：同意將我的資料以匿名方式納入整體市場洞察（絕不可識別個人，亦不會使用您的文件）。',
  },
  redactHint: '上傳前可自行刪去姓名或聯絡方式——不影響分析品質。',
  noAccessNote: '我們不會、也無法存取您的 LinkedIn、ChatGPT 或 Claude 帳號。所有資料皆由您自行提供。',
  retentionSummary: '原始上傳內容 90 天後自動刪除；您可隨時要求刪除全部資料。',
  privacyLinkLabel: '隱私與資料',
};
