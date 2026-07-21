import type { TwinContent } from '../schema';

export const twin: TwinContent = {
  request: {
    title: '職涯檔案：把你的歷次 MRI 串成一條線',
    intro:
      '一份報告是你某一天的切片。做過不只一次的人，可以在這裡把歷次報告串起來，看見這段時間裡真正變了什麼。目前只開放給付費客戶與受邀者。',
    emailLabel: '你做 MRI 時留的 email',
    emailPlaceholder: 'you@example.com',
    submitCta: '寄一條登入連結給我',
    sentNote: '如果這個 email 在開放名單內，登入連結已寄出，24 小時內有效。沒收到就翻一下垃圾信，或直接回信給我。',
    inviteNote: '還不在名單內？完成任一付費服務就會開通；或直接寫信跟我說明你的情況。',
    invalidEmail: '這個 email 格式不對，再看一眼。',
  },
  hub: {
    title: '你的職涯檔案',
    intro: '這裡是你歷次 MRI 的紀錄，最新的在最上面。',
    latestLabel: '最新',
    reportCta: '打開這份報告',
    diffTitle: '跟上次相比',
    diffIntro: '九個指標帶的變化。看方向就好，單格的波動不用焦慮。',
    needTwo: '還沒有兩份可以對比的報告。情況變了就做一次 MRI，湊滿兩份，這裡就會出現前後對比。',
    upWord: '升',
    downWord: '降',
    sameSummary: '{n} 項持平',
    unknownWord: '資料不足',
    updateTitle: '情況變了？',
    updateBody: '換了工作、拿到 offer、補上新的證據，就值得重新照一次。新報告會自動接進這條線。',
    updateCta: '更新我的檔案（重做 MRI）',
    expiredTitle: '這條連結過期了',
    expiredBody: '登入連結只有 24 小時效期，這是為了保護你的報告。再要一條就好。',
    requestAgainCta: '重新取得連結',
  },
  bandNames: {
    story_index: '故事主軸',
    mba_index: 'MBA 綜合指數',
    climate_index: '氣候賽道指數',
    commercial_credibility: '商業可信度',
    international_positioning: '國際定位',
    interview_readiness: '面試準備度',
    cv_readiness: '履歷完成度',
    green_economy_fit: '綠色經濟契合',
    mba_readiness: 'MBA 準備度',
  },
  resultLink: {
    prompt: '這份報告是你今天的切片。付費客戶可以把歷次 MRI 串成職涯檔案，追蹤自己的變化。',
    cta: '了解職涯檔案',
  },
};
