import type { JudgmentContent } from '../schema';

/**
 * 綠領判斷力的介面文字。內容本體（26 個能力、26 篇說明、12 題）在
 * content/judgment/data.json，是 zh-TW 原生撰寫，不在這裡重複維護。
 */
export const judgment: JudgmentContent = {
  meta: {
    title: '綠領判斷力：知識查得到，判斷你得自己練',
    description:
      '26 個能力節點、26 篇三分鐘說明、12 題判斷練習。先作答才看得到解答，而且每個錯的選項都會告訴你它為什麼誘人。免費，不用留 email。',
  },
  eyebrow: '免費・不用留 email',
  title: '綠領判斷力',
  lede: '綠領工作要的是永續與財務的交集。多數人從環工、CSR、公關進來，卡在財務那一半；金融背景的人卡在盤查邊界與揭露準則。這裡只做那個交集。',
  backLink: '免費 MRI 診斷',
  zhOnlyNotice: null,
  beta: {
    tag: 'BETA',
    body: '這是第一版，內容還在長。看到寫錯的、看不懂的、或你公司的情況對不上的，直接寄信跟我說，我會回，也會改。',
    mailSubject: '綠領判斷力 回饋',
  },
  tabs: {
    start: '你在哪裡',
    gaps: '你的缺口',
    reps: '判斷練習',
    map: '知識地圖',
  },
  bandLead: '以你勾的東西來看，你目前落在：{band}。',
  bandNone: '你還沒勾任何東西，所以這裡還沒有訊號。',
  start: {
    backgroundTitle: '你從哪個門進來的？',
    backgroundHint: '這一題決定你的缺口長什麼樣。沒有標準答案，選最接近的。',
    backgrounds: {
      eng: { label: '工程／製程／環工', hint: '你算得出排放，但提案常卡在財務部門。' },
      csr: { label: 'CSR／永續／公關', hint: '你寫得出報告書，但講不清楚它值多少錢。' },
      fin: { label: '財務／金融／投資', hint: '你懂折現與覆蓋率，但不熟盤查邊界與準則。' },
      other: { label: '其他／學生／轉職中', hint: '你想知道從哪裡開始才不會白學。' },
    },
    domainTitle: '下面這些，你真的動手做過哪些？',
    domainHint:
      '只勾「自己動手做過、講得出細節」的。勾了不會加分，只會讓下一頁更準：這裡不是履歷。',
    cta: '看我的缺口',
    ctaBlocked: '先選一個背景。',
  },
  gaps: {
    needBackground: '先回到第一步選一個背景。',
    stateTitle: '你目前的位置',
    stateNote: '這不是分數，也不是排名，是一張地圖。',
    weakSignalNote: '（訊號很弱）',
    backgroundBasis: '{label}背景',
    haveTitle: '看起來你已經有',
    maybeTitle: '訊號不夠強，需要你自己確認',
    maybeHint:
      '履歷上有相關字眼不等於做得到。下面每一項，你都能講出一個具體例子嗎？講不出來就當成缺口。',
    gapTitle: '建議從這裡開始',
    gapRule:
      '排序規則：前置能力已具備的優先，其次是財務側，那是這個領域最缺、也最難外包的一半。',
    basisLabel: '依據：',
    financeTag: '財務側',
    sustainabilityTag: '永續側',
    whyPaysLabel: '為什麼有這個能力的人比較值錢：',
    timeLabel: '從零到入門：',
    explainerSummary: '三分鐘搞懂',
    explainerPending: '這一則的說明還在撰寫中。',
    repsAttached: '有 {n} 題判斷練習練這個能力',
    moreLabel: '其餘 {n} 個能力',
    cta: '去做判斷練習',
  },
  reps: {
    title: '判斷練習',
    rule: '規則只有一條：先選，才看得到任何推理。看著答案讀沒有用，你必須先押一個，錯誤才會被你記住。每題五到十分鐘。',
    stateTitle: '你的練習狀態',
    storageNote:
      '你的選擇與作答只存在你自己這台裝置的瀏覽器裡，不會上傳到任何地方，換一台裝置就不見了。',
    backToList: '回到題目清單',
    start: '開始這題',
    again: '再看一次',
    answeredPending: '你已經選了，還沒看解答。',
    answeredWith: '你選了 {key}',
    minutes: '約 {n} 分鐘',
    gate: {
      title: '先別看答案：你為什麼選 {key}？',
      hint: '寫一行就好。被問這一句本身就有效，因為它逼你把直覺講成理由；等一下你會看到自己的話跟正解並排。',
      placeholder: '我選這個是因為',
      submit: '寫好了，看解答',
      skip: '跳過',
    },
    reveal: {
      choiceLine: '你選了 {key}',
      bestIs: '，最佳解是 {key}',
      yourReasonLabel: '你剛才寫的理由',
      skippedLabel: '你這次跳過了寫理由。想補一句也可以，只會存在你自己的瀏覽器裡。',
      addReasonPlaceholder: '現在補一句也不遲',
      takeawayLabel: '帶走這一句',
      reasoningTitle: '一個做過這個決定的人會怎麼想',
      breakdownSummary: '逐一拆解每個選項：為什麼錯的那些看起來很有道理',
      temptingLabel: '為什麼這個選項很誘人：',
      failureTitle: '真實世界的失誤模式',
      sourcesLabel: '來源',
      checkedOn: '查閱 {date}',
    },
    verdicts: {
      best: '最佳解',
      defensible: '可行，但有代價',
      wrong: '會出事',
    },
    empty: '題目還在撰寫中。',
  },
  map: {
    title: '知識地圖',
    intro: '由上往下四層，越下面的越需要先會上面的東西。點任何一項，可以看到它要先會什麼、學完會接到哪裡。',
    legendTitle: '怎麼讀這張圖',
    legendBody:
      '{n} 個節點落在財務那一半，那是環境背景的人最容易卡住、也最難外包的地方。左邊那條線是你目前的狀態，選了背景之後才會出現。',
    depthLabel: '門檻：',
    depths: ['可以今天就開始', '需要一塊基礎', '需要兩塊', '需要三塊'],
    statuses: { have: '看起來有', maybe: '待確認', gap: '缺口' },
    tierCount: '{n} 項',
    readyNow: '不用先修，今天就能開始',
    needFirst: '要先會：{name}',
    prereqsMet: '前置你都有了',
    unlocks: '接著可以學 {n} 項',
    prereqTitle: '要先會的',
    openCard: '看完整說明',
    cartographicNote: '位置只表示需要先會幾塊，不表示難度或重要性。',
  },
  exit: {
    title: '這一題在你公司的版本是什麼？',
    body: '寫一句話問我。不用長，講你卡在哪就好，我會回你一個具體的下一步，不收錢也不會把你加進任何名單。',
    betaNote: '這一版還在改。你覺得哪裡寫得不對、或哪一段沒幫到你，也歡迎直接說，那對我最有用。',
    mailSubject: '關於：',
  },
  about: {
    summary: '這是什麼、以及為什麼這樣做',
    title: '這是什麼',
    intro:
      '一套讓沒讀過商學院的人，也能取得綠領工作真正要求的判斷力的工具。目前有 {competencies} 個能力節點、{explainers} 篇三分鐘說明、{reps} 題判斷練習。',
    blocks: [
      {
        heading: '為什麼不是又一個線上課程',
        body: '因為資訊早就免費了。真正貴的一直是這三件事：有人幫你決定該學哪些、有人在你想錯的時候告訴你錯在哪、以及有具體情境讓你練判斷。這裡只做這三件事。',
      },
      {
        heading: '判斷練習為什麼要先選才給看',
        body: '因為看著答案讀，你會覺得自己懂了，然後在真的要決定時發現不會。先押一個，你才會記得住為什麼錯。這也是為什麼每個錯誤選項都會告訴你它為什麼誘人：課堂討論最貴的那一段，從來是聽到你那個錯答案為什麼會讓人上鉤。',
      },
      {
        heading: '這一版是 Beta',
        body: '所有內容都寫完並查證過來源，但這是第一次公開。內容會隨法規變，也會隨你們的回饋改。看到錯的、少的、或講不清楚的，寄信給我，這個階段回饋比讚有用得多。',
      },
    ],
    identityTitle: '這是誰做的',
    identityMail: '有問題直接寫信，我自己回。',
    honestTitle: '誠實說明',
    honestPoints: [
      '這裡的內容全部原創撰寫，事實都附公開來源，不含任何學校教材或購買教材。',
      '法規數字會過期，凡標日期者請自行覆核最新狀態。',
      '第一步的自評只是把你勾的東西攤開，不是評分，也不會傳到任何地方：你的選擇與作答只存在你自己這台裝置的瀏覽器裡，換一台就不見了。',
      '本頁不構成法律、稅務或投資建議。',
    ],
  },
  footer: {
    origin:
      '本頁所有內容皆為原創撰寫，事實均附公開可查證來源。不含任何學校教材、購買教材或客戶資料。',
    disclaimer:
      '法規數字會過期。凡標示日期者，請以該日期為準並自行覆核最新狀態。本頁不構成法律、稅務或投資建議。',
  },
};
