import type { ErrorsContent } from '../schema';

export const errors: ErrorsContent = {
  tooShort: '內容有點太短，還讀不出你的輪廓。請再補幾行：你的角色、做過的專案，或你正在考慮的方向。約 80 字就足夠。',
  fileMissing: '還沒選擇檔案。請選一個 PDF，或改用其他分頁直接貼上文字。',
  tooLong: '內容超過 40,000 字元上限。請保留最相關的部分：近期經歷，以及你正面臨的選擇。',
  fileTooLarge: 'PDF 檔案超過 10MB 上限。請輸出較輕量的版本（文字型、非掃描檔）後再試一次。',
  fileType: '這裡僅支援 PDF 檔案。其他格式請改用其他分頁貼上文字。',
  consentRequired: '送出前，請先勾選上方的資料處理同意。',
  emailInvalid: 'Email 格式看起來不太對，請再確認一次。',
  extractionFailed: '這次沒有成功讀取你的資料。內容並未遺失，已為你保存。請再試一次，或改用貼上文字的方式。',
  reportDegraded: '本報告部分段落因產生過程中斷而使用了預設文字；分級與診斷結果仍是根據你的資料計算。',
  rateLimited: '此連線在一小時內的送出次數已達上限，請稍後再試。',
  // 2026-08-08：舊文案「刻意限量以維持品質」是製造稀缺（違反 UX_PRINCIPLES 第 5 條），
  // 而且不實——那是每日 AI 處理成本上限，不是品質選擇；也承諾了不存在的「開放通知」。
  dailyCapReached: '今天的處理額度已經用完了。這是每日成本上限，不是名額限制。明天再回到這一頁就可以送出。',
  notFound: '找不到這份報告。請確認連結，或重新進行一次 MRI。',
  generic: '我們這邊出了點問題。你的內容已保存。請再試一次。',
  retry: '再試一次',
};
