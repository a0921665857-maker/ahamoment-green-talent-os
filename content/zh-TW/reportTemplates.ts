import type { ReportTemplatesContent } from '../schema';

export const reportTemplates: ReportTemplatesContent = {
  reportTitle: '綠色職涯 MRI',
  reportSubtitle: '一份針對你個人的判讀：定位、證據，與下一步。',
  preparedFor: '為 {name} 而寫',
  generatedOn: '產生於 {date}',
  limitedDataNote:
    '依據你目前提供的資料，這是一次局部掃描：部分段落的訊號比平常少。這份診斷選擇誠實面對，而不是假裝篤定。',
  bandLabels: { emerging: '萌芽', developing: '發展中', strong: '紮實' },
  notEnoughSignal: '訊號還不足',
  categoryLabel: '你的結果類型',
  sections: {
    current_positioning: {
      title: '目前定位',
      fallback: '你的資料呈現出一位在綠色經濟中轉換階段的專業者。更完整的定位陳述，需要比這次掃描更多一點的訊號。',
    },
    hidden_strengths: {
      title: '被低估的優勢',
      fallback: '你的資料裡有一些優勢，被目前的敘述方式賣低了。在拆解對談中由真人判讀，可以把它們精準點名。',
    },
    underused_story_assets: {
      title: '未被善用的故事資產',
      fallback: '你背景裡的某些專案與數字，目前發揮的敘事作用低於它們應有的水準。',
    },
    core_story_gap: {
      title: '故事的核心缺口',
      fallback: '從這份資料還無法可靠定位你故事的主要缺口——而這件事本身，就值得探究。',
    },
    green_career_fit: {
      title: '綠色職涯適配度',
      fallback: '你與綠色經濟的適配是真實的，但在目前資料中描述得不夠具體。',
    },
    mba_readiness: {
      title: 'MBA 準備度',
      fallback: '以目前資料，還無法有把握地為你的 MBA 準備度分級。',
    },
    commercial_clarity: {
      title: '商業清晰度',
      fallback: '你的影響力在商業語言上的呈現程度，本次掃描無法可靠評估。',
    },
    international_positioning: {
      title: '國際定位',
      fallback: '你的檔案跨市場的可攜程度，需要比本次掃描更多的訊號。',
    },
    interview_readiness: {
      title: '面試準備度',
      fallback: '僅憑書面資料，本次掃描無法評估面試準備度。',
    },
    cv_readiness: {
      title: '履歷完成度',
      fallback: '以目前提供的資料，無法評估履歷結構。',
    },
    recommended_next_move: {
      title: '建議的下一步',
      fallback: '槓桿最高的一步：本週把你最強的三項成果寫下來，附上數字。之後的每一步都建立在這上面。',
    },
    suggested_paid_next_step: {
      title: '如果你想加上真人判讀',
      fallback: '當你想在這份掃描之上加一層真人判讀，「90 分鐘故事拆解」是通用的入口。',
    },
  },
  footer: {
    deleteLine: '想刪除這份資料？寄一封信，7 天內完成。',
    confidentiality: '真人審閱完全保密。未經你書面同意，你的資料絕不會被用作公開案例或見證。',
    returnNote: '這個連結屬於你——收藏起來，隨時回來看你的報告。',
  },
};
