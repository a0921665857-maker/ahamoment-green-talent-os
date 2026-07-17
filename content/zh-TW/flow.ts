import type { FlowContent } from '../schema';

export const flow: FlowContent = {
  stepIndicator: { input: '你的資料', confirm: '確認理解', questions: '幾個問題' },
  intro: {
    title: '從你已經有的東西開始',
    body: '選最省力的一種就好。MRI 直接讀你的真實資料，你給的內容越有料，判讀就越精準。',
    reassure: '約 3 分鐘 · 免費 · 免註冊。原始內容 90 天後自動刪除，絕不拿去訓練 AI。',
    sampleCta: '還沒把握？先看一份完整範例 →',
  },
  inputTabs: {
    cv_pdf: {
      tab: 'CV（PDF）',
      hint: '文字型 PDF 效果最好；紙本掃描檔無法讀取。',
    },
    linkedin_paste: {
      tab: '貼上 LinkedIn',
      hint: '打開你的個人檔案，全選文字（About、Experience、Education）貼到這裡。出現「…查看更多」被截斷也沒關係。',
      placeholder: '在這裡貼上你的 LinkedIn 個人檔案文字…',
    },
    notes_paste: {
      tab: '筆記或 AI 對話',
      hint: '職涯筆記、自我介紹，或你和 ChatGPT、Claude 聊職涯的對話紀錄。我們讀的是你的處境，不是 AI 給過的建議。',
      placeholder: '在這裡貼上你的筆記或對話紀錄…',
    },
    voice_transcript: {
      tab: '語音逐字稿',
      hint: '用任何 App 把你聊自己背景的內容錄下來，貼上逐字稿即可。口語、未修飾的內容在這裡反而特別有用。',
      placeholder: '在這裡貼上你的語音逐字稿…',
    },
  },
  pdf: {
    dropLabel: '把 CV 拖曳到這裡，或',
    chooseFile: '選擇 PDF 檔案',
    selected: '已選擇：',
    remove: '移除',
  },
  submit: '開始 MRI',
  submitHint: '貼上一些內容、並勾選下方的資料處理同意，就能開始。',
  charCount: '{count} 字元',
  progress: {
    extraction: {
      title: '正在閱讀你的資料',
      stages: [
        '讀取你提供的內容…',
        '對應角色、產業與證據…',
        '記下還缺少的資訊…',
      ],
    },
    report: {
      title: '正在撰寫你的報告',
      stages: [
        '以你的證據為十四個維度評分…',
        '判定你的結果類型…',
        '撰寫十二個段落…',
      ],
      note: '通常需要三到五分鐘，我們在認真寫十二個段落，不是隨便填。報告在雲端生成，就算關掉這頁也不會中斷；頁面開著的話，完成會自動顯示。',
    },
  },
  line: {
    noCvTitle: '手邊沒有履歷？正常，多數人都是通勤時點進來的。',
    noCvBody: '先把這頁傳到你的 LINE，晚點在電腦上慢慢做；或加 Michael 的 LINE，直接把履歷丟給他，他本人回。',
    saveCta: '傳到我的 LINE 存起來',
    addCta: '加 Michael 的 LINE',
    shareTextMri: '綠領職涯 MRI 免費測評，之後從這裡開始：',
    shareTextReport: '我的綠領職涯 MRI 報告，等等從這裡看：',
    generatingHint: '怕被打斷？先把報告連結傳到你的 LINE，好了直接點開。',
    resultTitle: '把這份報告存進你的 LINE',
    resultBody: '連結永久有效。傳給自己存起來；想聊報告裡的下一步，加 Michael 的 LINE，他本人回。',
    landingTitle: '還不確定要不要做測評？',
    landingBody: '先加 Michael 的 LINE，想問什麼直接問，他本人回，不是機器人。',
    endTitle: '還不想約時段也沒關係',
    endBody: '先加 Michael 的 LINE，把報告放著沉澱幾天，之後想聊隨時在。',
  },
  confirmation: {
    title: '我們是這樣讀你的',
    intro: '在任何評估開始前，先確認這裡。哪裡不對就直接修改，後續會使用你修正後的版本，而不是原始猜測。',
    identityLabel: '目前職位',
    careerLabel: '經歷摘要',
    sectorsLabel: '綠色經濟領域',
    domainsLabel: '專業範疇',
    intentLabel: '你看起來想往哪裡走',
    careerEditPlaceholder: '經歷有讀錯或漏掉的嗎？補一句最關鍵的成就或數字（選填）',
    sectorsEditPlaceholder: '綠領領域抓錯了嗎？用一句話修正你真正的賽道（選填）',
    editHint: '點任一欄位即可編輯。',
    notDetected: '未偵測到，歡迎自行補上',
    confirmCta: '沒問題，繼續',
  },
  result: { viewCta: '查看你的報告' },
};
