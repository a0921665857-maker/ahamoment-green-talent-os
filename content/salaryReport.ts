import type { Locale } from '@/lib/constants';

/**
 * 《2026 亞太綠領薪資報告》— a public lead-magnet article rendered on-site
 * at /[locale]/salary-report. Standalone, locale-keyed content (mirrors the
 * sampleReports pattern) so it stays out of the getContent schema.
 *
 * Style: zh-TW uses full-width punctuation（，。：；？「」）, no em-dash「——」,
 * written in Michael's own voice. FX: 1 SGD ≈ 25 TWD (all conversions follow).
 * All figures carry a source code; weak data is flagged 推估 / 樣本不足.
 */
export interface SalaryTable {
  head: string[];
  rows: string[][];
}

export interface SalaryReport {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lede: string;
  byline: string;
  backToMri: string;
  scene: string;
  scenePunch: string;
  stats: { fig: string; cap: string; gold?: boolean }[];
  findingsTitle: string;
  findings: { tag: string; head: string; body: string }[];
  sgTitle: string;
  sgNote: string;
  sgTable: SalaryTable;
  sgStartupNote: string;
  sgTrend: string;
  twTitle: string;
  twTable: SalaryTable;
  multiples: string;
  caveat: string;
  hkTitle: string;
  hk: string;
  jpTitle: string;
  jpNote: string;
  jpTable: SalaryTable;
  jpStartupNote: string;
  jpTrend: string;
  jpGap: string;
  skillTitle: string;
  skillIntro: string;
  skills: { tag: string; head: string; body: string }[];
  actionsTitle: string;
  actions: { head: string; body: string }[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  ctaSub: string;
  sourcesLabel: string;
  method: string;
  sources: { code: string; name: string; note: string }[];
  footer: string;
}

const zhTW: SalaryReport = {
  meta: {
    title: '2026 亞太綠領薪資報告：星台差 2 到 3 倍的真相',
    description:
      '同職能同資歷，新加坡薪水真的是台灣的 2 到 3 倍嗎？我把星台 2025 到 2026 的公開薪資指南、官方就業報告和求職平台數據全翻過一遍。答案是真的，但有三個條件你得先知道。綠色 / 永續 / ESG 職能。',
  },
  eyebrow: '綠領情報 · 2026',
  title: '做一樣的事，薪水差快四倍，這數字是真的嗎？',
  lede: '我把新加坡和台灣 2025 到 2026 的公開薪資指南、官方就業報告、求職平台數據全部翻過一遍，就是想回答一個很多人不太敢信的問題：同一個職能、同樣的資歷，跨過一個海峽，薪水真的會差 2 到 3 倍嗎？答案是真的。但先別急著訂機票，有三個條件你得先知道。',
  byline: '《2026 亞太薪資報告》· 綠色 / 永續 / ESG 職能 · 資料截至 2026 年 7 月',
  backToMri: '← 回到免費 MRI',
  scene:
    '台北，週四晚上十點半。一個在四大做了四年碳盤查的顧問，剛把客戶永續報告書的第三版改完，月薪五萬四。LinkedIn 跳出一則新加坡碳交易公司的職缺，做的事她閉著眼睛都會：盤查、查驗、抵換評估。薪資欄寫著 S$8,000 到 10,000。她按了一下匯率換算：台幣二十萬到二十五萬。',
  scenePunch: '她愣了幾秒，心裡冒出來的第一句話是：這數字，真的假的？',
  stats: [
    { fig: '2–3×', cap: '同職能同資歷，新加坡名目薪資大約是台灣的倍數' },
    { fig: '+5.3%', cap: '台灣「綠領」職稱的薪資溢價，幾乎等於零', gold: true },
    { fig: '+544%', cap: '但持相關證照的人，面試邀約成長的幅度', gold: true },
  ],
  findingsTitle: '三個關鍵發現',
  findings: [
    {
      tag: '發現 01',
      head: '同職能同資歷，新加坡名目薪資大約是台灣的 2 到 3 倍',
      body: '台灣永續新人（1 到 3 年）月薪中位數大約 5.2 萬〔104〕。新加坡同一級的年薪 S$50k–90k〔EB·OS〕，換算成月薪大概是台幣 10.4 萬到 18.7 萬。也就是說，入行三年內，差距就已經拉到兩倍以上。',
    },
    {
      tag: '發現 02',
      head: '台灣的「綠領溢價」幾乎是零：薪水只高 5.3%，面試機會卻多 5.4 倍',
      body: '2025 下半年台灣綠領職缺月薪中位數 4.0 萬，全市場 3.8 萬〔MOE〕。但同一份環境部和 104 合作的報告裡，藏著另一個數字：持證照的人，面試邀約成長了 544%〔MOE·VC〕。台灣市場現在付的是機會，還沒開始付薪水。',
    },
    {
      tag: '發現 03',
      head: '光有「永續」職稱不會加薪，真正值錢的是它配上什麼硬技能',
      body: '碳核算和 Scope 3 的專長，比同資歷的人高 12 到 18%〔OS〕。同一份調查裡，會 LCA、氣候風險建模、ESG 數據分析的人，溢價更明顯，只是市場還沒給出一個乾淨的公開數字〔OS〕。同樣掛「永續」兩個字，掛在會寫報告書上，跟掛在會算碳、會談供應鏈數據上，市場開的價完全不同。',
    },
  ],
  sgTitle: '新加坡薪資帶（主場）',
  sgNote: '年薪 · 新加坡幣 · 1 SGD ≈ 25 TWD',
  sgTable: {
    head: ['職能', '0–3 年', '4–8 年', '8 年以上'],
    rows: [
      ['永續金融（銀行 / 資管）', 'S$65k–90k', 'S$100k–160k', '氣候風險主管 S$250k–350k+'],
      ['碳市場 / 碳交易', '~S$72k*', '分析師 ~S$104k；交易員 ~S$131k*', '總監 S$180k–230k'],
      ['ESG 顧問', '月 S$4.5k–6.4k', 'S$100k–160k', '合夥人可達 ~S$420k**'],
      ['企業永續（sustainability mgr）', 'S$50k–80k', '~S$88k–142k', 'CSO S$200k–400k'],
    ],
  },
  sgStartupNote:
    '氣候科技新創：樣本不足，沒有可靠的獨立薪資帶，我就不編數字了。這一塊的新創普遍用股權補貼一個低於市場的底薪。',
  sgTrend:
    '* 是模型推估（SalaryExpert），只能當量級參考。** 是媒體轉引的單一來源，我標出來讓你自己斟酌。新加坡永續職位 2026 年平均調薪 7 到 10%，高階職能到 15%，遠高於全市場的 4.0 到 4.3%〔MP·RW〕。整個新加坡聚集了 150 家以上的碳服務與交易公司，是東南亞密度最高的，這也是為什麼碳市場那條薪資帶撐得起來。',
  twTitle: '台灣對照與真實倍數',
  twTable: {
    head: ['項目', '數字', '換算對照'],
    rows: [
      ['綠領職缺整體月薪中位數', '4.0 萬', '全市場 3.8 萬，+5.3%'],
      ['永續管理師（1 到 3 年）', '~5.2 萬', '入行段'],
      ['溫室氣體查驗相關', '~6 萬', '技能加值'],
      ['資深主管職（年薪）', '200–300 萬', '塔尖'],
    ],
  },
  multiples:
    '用年薪換算真實倍數：入行 0 到 3 年大約 1.8 到 3.3 倍，中段 4 到 8 年大約 2.7 到 3.3 倍，資深 8 年以上大約 2.2 到 3.3 倍。',
  caveat:
    '有兩件事我得老實說。第一，台灣 4 到 8 年這一段沒有可靠的公開中位數，那個區間是我從新人和主管職之間內插推估的。第二，帳面倍數不等於生活品質倍數：新加坡一個單房月租常常 S$2,500 起跳，但個人所得稅又明顯比台灣高薪級距低。把居住成本扣掉之後，實際可支配所得的差距大概收斂到 1.6 到 2.6 倍。還是很大，只是沒有帳面上看起來那麼誇張。',
  hkTitle: '香港（簡短，市場本來就小）',
  hk: '香港：環境顧問月薪大約 HK$21k–24k〔JD〕，跟台灣同級距離不大。唯一的例外是永續金融，靠著港交所 ESG 披露樞紐的定位撐起來。香港的綠領機會集中在金融塔尖，塔基的薪水不會比台灣有明顯優勢。',
  jpTitle: '日本薪資帶（三個海外市場裡資料最厚的一個）',
  jpNote: '年薪・日圓（萬円）・沒有任何一家獵頭指南出過「ESG 專章薪資表」，下表是獵頭指南、專業轉職站、現役求人票、官方統計四層來源交叉查證後的結果，信心標記照舊保留',
  jpTable: {
    head: ['職能', '基層', '中階', '資深／頂端'],
    rows: [
      [
        '企業內 ESG／永續部門（in-house）',
        '440–750 萬円（楽天、あずさ監査法人、推進職缺等在招個案，活求人可能已下架）〔DD〕',
        '管理職手前 800–900 萬円；成熟度較高的企業另可釋出 1,000 萬円以上職缺〔JAC〕',
        '具語言力與人員管理責任的 offer 案例，可達 1,200 萬円以上〔JAC〕',
      ],
      [
        'ESG／永續顧問',
        '未經驗採用 600–800 萬円〔SC〕；大手事務所 Associate 可達 700–1,000 萬円〔JAC〕',
        '資深顧問 800–1,100 萬円〔SC〕；經理級 1,200–1,800 萬円〔JAC〕',
        'Director 2,000 萬円以上〔JAC〕；脫碳專門顧問經理以上同樣可望超過 2,000 萬円，頂端策略顧問合夥人另有數千萬円等級案例〔SI〕',
      ],
      [
        '再生能源（太陽光／風力）',
        '開發職起薪落在業界通行帶 500–1,000 萬円下段，JAC 未拆分層級〔JAC〕',
        '開發專案經理（Project Manager）1,000–1,500 萬円〔RW〕',
        '事業開發總監 1,300–1,600 萬円，工程總監 1,400–2,000 萬円〔RW〕；大型業者平均年收：INPEX 1,117 萬、J-POWER 1,046 萬、Renova 992 萬円〔JAC〕',
      ],
      [
        'Carbon／climate（GX 人材）',
        '非管理職在職者平均 600 萬円，高於非 GX 職 69 萬円〔KOTORA〕',
        '轉職求人票 600–1,300 萬円；新創高階提示上看 1,500 萬円，標題數字〔SC・NIKKEI〕',
        '管理職在職者平均 952 萬円，高於非 GX 職 49 萬円，整體溢價 +13%〔KOTORA〕',
      ],
      [
        'Sustainable finance／ESG 投資',
        'ESG アナリスト（證券・運用）750–1,400 萬円〔SI〕',
        '銀行 project finance（ESG／再エネ）現役求人 500–1,400 萬円〔MPJ〕',
        'サステナ投資マネージャー 800–2,000 萬円以上〔SI〕',
      ],
    ],
  },
  jpStartupNote:
    '氣候科技新創（單一公司案例，不是平台統計）：アスエネ全體平均 567 萬円，細分工程師 500–800、顧問 700–1,100、M&A 與策略 600–2,000 萬円〔TL〕；ゼロボード採用 500–800、行銷主管 900–1,000 萬円；e-dash 工程師 450–700、客戶成功 500–700 萬円；enechain 資深職缺全數落在 900–1,800 萬円區間；フェイガー 700–1,300 萬円〔SC〕。這塊數字看起來不低，但每一筆都是單一在招職缺，換一家公司可能完全不同，別當成統計平均。保險業的 ESG 職，查無任何一筆可靠資料，這一格我寧可留白，不編數字。',
  jpTrend:
    '政策紅利算得出來：2023 年成立的 GX 推進法定調未來十年官民 150 兆円投資〔METI〕，GX 相關求人數 2016 到 2022 六年間成長 5.87 倍，實際轉職人數只跟上 3.09 倍〔RC〕，需求成長快，人才補位跟不上。GX 溢價集中在基層：整體 +13%，拆開看非管理職 +13%、管理職只有 +5.4%〔KOTORA〕，對年輕人斜率改變最大。顧問是薪資電梯，in-house 是天花板：顧問從 600 萬能一路通到 2,000 萬以上，in-house 大多卡在 1,200 萬〔JAC・SI〕。東京集中度極高，東京平均月薪比全國高 22%〔MHLW〕，ESG、金融、顧問職缺幾乎全在東京。全產業基準線參考：一般勞工月薪 330,400 円，33 年來最大增幅 +3.8%〔MHLW〕；doda 全職業別平均年収 429 萬円〔PERSOL〕；2025 年春鬥最終集計加薪 5.25%，連續兩年破 5%，創 34 年新高〔RENGO〕。',
  jpGap:
    '幾件事我得老實說。第一，日本沒有任何一家獵頭指南出過「ESG 專章薪資表」，上面這張表全部是拼接交叉，信心標記請照著看，別當成官方公告。第二，保險業 ESG 職完全查無可靠公開資料，見上一段。第三，部長級以上的 in-house 薪資只有間接證據，是 offer 案例和獵頭觀察，不是統計級樣本。第四，厚生勞動省沒有「永續職」這個職業分類，官方的綠領對照組在日本本來就不存在，這是一個誠實的缺口，不是我漏查。',
  skillTitle: '正在拉高你議價力的四種技能組合',
  skillIntro:
    '「綠領溢價」在兩個市場是兩個完全不同的故事。新加坡的溢價是真的、算得出來的；台灣的職稱溢價只有 5.3%。但這個「低」本身就是情報：市場付的錢，不在「永續」兩個字，在它底下掛的硬技能。台灣的綠領需求有 41% 來自電子半導體和製造業〔VC〕，這些公司要的是能做碳盤查、能源管理、供應鏈數據的人。',
  skills: [
    { tag: '組合 A', head: '碳核算 × 金融', body: 'Scope 3 和碳會計的專長溢價 12 到 18%〔OS〕，新加坡那 150 家碳服務公司都在搶這條線的人。' },
    { tag: '組合 B', head: 'CSRD / ISSB / ESRS 合規', body: '這組法規知識會明顯拉高薪酬。台灣 2026 年起接軌 IFRS 永續揭露準則，等於同一套技能兩地通用。' },
    { tag: '組合 C', head: 'AI × 綠色技能', body: '兩者都會的人，比只有綠色技能的人高 10 到 15%。亞太的 AI 技能溢價還是全球最高的（18%）。' },
    { tag: '組合 D', head: '結構性訊號', body: '綠色技能者的錄用率比整體高 46.6%，而且有 53% 的錄用發生在「非綠色職稱」上。綠色技能正在變成一個加值層，不再是一個獨立職業。' },
  ],
  actionsTitle: '給台灣讀者的三個建議',
  actions: [
    {
      head: '別為了「永續」這個頭銜跳槽，要為技能組合跳槽。',
      body: '台灣的頭銜溢價只有 5.3%，技能溢價（碳核算、合規、AI × 綠）在區域裡是 10 到 18%。同樣要花兩年，把時間投在 Scope 3 實戰和 ISSB 準則上，別拿去收集第五張證照。',
    },
    {
      head: '要去新加坡，戰場選碳市場和永續金融，武器是你的台灣製造業經驗。',
      body: '台灣人在電子供應鏈碳盤查的實戰，正好是新加坡顧問公司最缺的。順帶提醒，EP 月薪門檻是 S$5,600（金融業 S$6,200），0 到 3 年剛好卡在門檻上，4 年以上勝率會明顯提高。',
    },
    {
      head: '證照拿來敲門，別指望它幫你加薪。',
      body: '證照讓你多 5.4 倍面試，薪水只多 5.3%。所以履歷別寫「持有 ISO 14064」，要寫「用它盤查過幾個廠、幫客戶省下多少查驗成本」。證照負責開門，量化的戰績負責談價。',
    },
  ],
  ctaEyebrow: '那，你自己在哪一段？',
  ctaTitle: '這份報告給的是市場的地圖。你在哪裡，MRI 三分鐘告訴你。',
  ctaBody:
    '你的位置要看你的技能組合、資歷和目標市場，這正是綠領 MRI 免費在做的事：把你放進上面那些薪資帶，告訴你缺哪一塊、下一步該補什麼。',
  ctaButton: '做一次綠領 MRI（免費）→',
  ctaSub: '大約 5 分鐘 · 免費 · 免註冊',
  sourcesLabel: '方法論與來源附錄',
  method:
    '2026 年 7 月，以公開網路來源交叉查證。每個數字都保留原始區間，不做假精確；單一來源、自報樣本、模型推估都會標註；查不到可靠數據的地方（台灣 4 到 8 年中段、日本保險業 ESG 職、多數城市的氣候新創薪資帶），我就直接說樣本不足。日本節在 2026 年 7 月以獵頭指南、專業轉職站、現役求人票、官方統計四層來源交叉查證，信心標記見該節。匯率用 1 SGD ≈ 25 TWD，1 USD ≈ 1.35 SGD ≈ 33.75 TWD；日圓數字保留原幣別，不做二次換算，避免堆疊誤差。開場那個場景是我根據薪資數據拼出來的典型情境，不是特定某個人。',
  sources: [
    { code: 'MOE', name: '環境部×104《2025 下半年綠領人才就業趨勢報告》', note: '台灣官方主來源' },
    { code: 'MP', name: 'Michael Page《Singapore Salary Guide 2026》', note: '招聘顧問指南' },
    { code: 'RW', name: 'Robert Walters《Salary Survey 2026》', note: '亞太' },
    { code: 'OS', name: 'OneStop ESG《2026 Sustainability Salary Survey》', note: 'n=2,147，亞太樣本約 9%' },
    { code: 'EB', name: 'Eco-Business 轉引 Michael Page 新加坡永續調查', note: '2023，結構參考，絕對值偏舊' },
    { code: '104', name: '104 薪資情報：永續管理師', note: '平台申報' },
    { code: 'VC', name: 'Vocus 對 MOE 報告的分析', note: '二手分析' },
    { code: 'JD', name: 'Jobsdb 香港環境顧問薪資', note: '平台數據' },
    { code: 'MOM', name: '新加坡人力部 EP 合格薪資門檻', note: '官方，2025 起適用' },
    { code: 'JAC', name: 'JAC Recruitment 日本市場薪資趨勢頁（永續／ESG 顧問／再生能源）', note: '獵頭指南，2026 年 4 至 7 月更新' },
    { code: 'DD', name: 'doda 求人票關鍵字搜尋頁（「サステナビリティ」）', note: '個別在招職缺搜尋結果，時效性有限' },
    { code: 'SC', name: 'サスキャリ（sus-career.com）媒體專文與現役求人頁', note: '轉職媒體，含求人票案例' },
    { code: 'SI', name: 'sus-insights.com 年収ランキング', note: '產業匯整站' },
    { code: 'KOTORA', name: 'Kotora 轉引 Deloitte Tohmatsu《GX人材の年収に関する調査》（2024-10）', note: '唯一調查型結構數據，信心最高' },
    { code: 'MHLW', name: '厚生労働省《令和 6 年賃金構造基本統計調査》', note: '日本官方薪資統計' },
    { code: 'PERSOL', name: 'doda／Persol Career《平均年収ランキング 2025》新聞稿', note: '轉職平台官方統計' },
    { code: 'RENGO', name: '日本労働組合総連合会（連合）2025 春鬥最終集計', note: '官方工會統計，取最終集計非首波快報' },
    { code: 'MPJ', name: 'Michael Page Japan 現役 ESG／project finance 求人頁', note: '單一求人票案例' },
    { code: 'NIKKEI', name: '日経リスキリング（會員限定文章標題）', note: '標題數字，全文在付費牆內未讀到' },
    { code: 'METI', name: '経済産業省 GX 政策資料（GX 推進法／150 兆円投資）', note: '日本官方政策文件' },
    { code: 'TL', name: 'tleon.co.jp 轉載アスエネ員工薪資頁', note: '單一公司薪資頁' },
    { code: 'RC', name: 'Recruit 新聞稿《GX人材の転職市場動向》（2023-08 發布）', note: 'GX 求人成長倍率調查，涵蓋 2016–2022' },
  ],
  footer:
    '© 2026 AhaMoment 綠領情報 · 本報告是市場資訊彙整，不是個人投資、法律或移民建議 · 數字都附來源、保留區間，弱數據已標註。',
};

const en: SalaryReport = {
  meta: {
    title: '2026 APAC Green-Collar Salary Report: the 2–3× Singapore–Taiwan gap',
    description:
      'Is the same sustainability role really paid 2–3× more in Singapore than in Taiwan? We cross-checked 2025–2026 public salary guides, official employment reports and job-platform data. The answer is yes, with three conditions you need to know first.',
  },
  eyebrow: 'Green-Collar Intel · 2026',
  title: 'Same work, nearly 4× the pay: is that number real?',
  lede: 'I went through every public salary guide, official employment report and job-platform dataset across Singapore and Taiwan for 2025–2026 to answer a question a lot of people can’t quite believe: for the same role and seniority, is the cross-strait pay gap really 2–3×? It is. But before you book a flight, there are three conditions you need to understand first.',
  byline: '2026 APAC Salary Report · Green / Sustainability / ESG roles · Data as of July 2026',
  backToMri: '← Back to the free MRI',
  scene:
    'Taipei, Thursday, 10:30pm. A consultant four years into carbon accounting at a Big Four firm has just finished the third revision of a client’s sustainability report. Her salary is NT$54k a month. A Singapore carbon-trading job pops up on LinkedIn: inventory, verification, offset assessment, work she could do in her sleep. The pay band reads S$8,000–10,000. She runs the conversion: NT$200k–250k.',
  scenePunch: 'She stares at it for a few seconds. The first thing that comes to mind isn’t excitement, it’s: can this be real?',
  stats: [
    { fig: '2–3×', cap: 'Same role and seniority, Singapore’s nominal pay vs Taiwan' },
    { fig: '+5.3%', cap: 'Taiwan’s “green-collar” title premium, basically zero', gold: true },
    { fig: '+544%', cap: 'But the rise in interview invitations for the certified', gold: true },
  ],
  findingsTitle: 'Three key findings',
  findings: [
    {
      tag: 'Finding 01',
      head: 'Same role, same seniority: Singapore’s nominal pay is ~2–3× Taiwan’s',
      body: 'Taiwan sustainability newcomers (1–3 yrs) sit around NT$52k/month median [104]; the Singapore equivalent is S$50k–90k/year [EB·OS], about NT$104k–188k/month. The gap crosses 2× within three years of entry.',
    },
    {
      tag: 'Finding 02',
      head: 'Taiwan’s “green premium” is near zero: pay +5.3%, but interviews +5.4×',
      body: 'H2-2025 Taiwan green-collar median is NT$40k vs NT$38k market-wide [MOE]; the same Ministry×104 report hides another number: interview invitations up 544% for the certified [MOE·VC]. Taiwan pays for opportunity right now, not salary yet.',
    },
    {
      tag: 'Finding 03',
      head: 'A “sustainability” title alone won’t raise your pay; what it hangs on does',
      body: 'Carbon-accounting / Scope 3 specialists earn 12–18% above peers [OS]; in the same survey, those fluent in LCA, climate-risk modelling and ESG data analytics command an even sharper premium, though the market hasn’t put a clean public number on it [OS]. The same word “sustainability” priced onto report-writing versus onto carbon maths and supply-chain data are two very different numbers.',
    },
  ],
  sgTitle: 'Singapore salary bands (home turf)',
  sgNote: 'Annual · SGD · 1 SGD ≈ 25 TWD',
  sgTable: {
    head: ['Function', '0–3 yrs', '4–8 yrs', '8+ yrs'],
    rows: [
      ['Sustainable finance (bank/AM)', 'S$65k–90k', 'S$100k–160k', 'Climate-risk lead S$250k–350k+'],
      ['Carbon markets / trading', '~S$72k*', 'Analyst ~S$104k; trader ~S$131k*', 'Director S$180k–230k'],
      ['ESG consulting', 'S$4.5k–6.4k/mo', 'S$100k–160k', 'Partner up to ~S$420k**'],
      ['Corporate sustainability (mgr)', 'S$50k–80k', '~S$88k–142k', 'CSO S$200k–400k'],
    ],
  },
  sgStartupNote:
    'Climate-tech startups: insufficient data, no reliable independent band, so no numbers invented. Startups here typically offer a below-market base subsidised by equity.',
  sgTrend:
    '* Model estimate (SalaryExpert), order-of-magnitude only. ** Single media-relayed source, flagged so you can weigh it yourself. Singapore sustainability roles rose 7–10% on average in 2026, up to 15% for senior functions, well above the 4.0–4.3% market rate [MP·RW]. The country hosts 150+ carbon-services and trading firms, the densest in Southeast Asia, which is why that carbon-market band holds up.',
  twTitle: 'Taiwan comparison and the real multiples',
  twTable: {
    head: ['Item', 'Figure', 'Context'],
    rows: [
      ['Green-collar median (all roles)', 'NT$40k/mo', 'Market NT$38k, +5.3%'],
      ['Sustainability manager (1–3 yrs)', '~NT$52k/mo', 'Entry band'],
      ['GHG verification roles', '~NT$60k/mo', 'Skill uplift'],
      ['Senior management (annual)', 'NT$2–3M', 'Top of the tower'],
    ],
  },
  multiples:
    'On an annualised basis the real multiples are: 0–3 yrs ~1.8–3.3×; mid 4–8 yrs ~2.7–3.3×; senior 8+ yrs ~2.2–3.3×.',
  caveat:
    'Two honest caveats. First, Taiwan has no reliable public median for the 4–8-year band; that range is interpolated. Second, a nominal multiple isn’t a quality-of-life multiple: a Singapore studio routinely rents at S$2,500+/month, while personal income tax is markedly lower than Taiwan’s high brackets. Net of housing, the disposable-income gap converges to roughly 1.6–2.6×. Still large, just not as dramatic as the headline.',
  hkTitle: 'Hong Kong (brief, the market itself is small)',
  hk: 'Hong Kong: environmental consultants earn ~HK$21k–24k/month [JD], not far from Taiwan’s equivalent. The exception is sustainable finance, buoyed by HKEX’s ESG-disclosure hub role. Green-collar opportunity concentrates at the financial apex; the base offers no clear edge over Taiwan.',
  jpTitle: 'Japan salary bands (the best-sourced of the three overseas markets)',
  jpNote:
    'Annual · JPY (man-yen) · No headhunter guide publishes a dedicated ESG salary table; the bands below are cross-checked across four source layers — headhunter guides, specialist job sites, live postings, official statistics — confidence flags kept as-is',
  jpTable: {
    head: ['Function', 'Entry', 'Mid', 'Senior/Top'],
    rows: [
      [
        'In-house ESG/sustainability (corporate)',
        '¥4.4–7.5M (live postings incl. Rakuten, KPMG AZSA, ESG-promotion roles; postings may since have expired) [DD]',
        'Pre-management level ¥8–9M; more mature organisations post ¥10M+ roles [JAC]',
        'Offer examples with language skills and people-management responsibility reach ¥12M+ [JAC]',
      ],
      [
        'ESG/sustainability consulting',
        'No-experience hires ¥6–8M [SC]; large-firm Associates reach ¥7–10M [JAC]',
        'Senior consultant ¥8–11M [SC]; manager level ¥12–18M [JAC]',
        'Director ¥20M+ [JAC]; decarbonization-specialist consultants at manager level and above can also exceed ¥20M, with top strategy-firm partners reaching the tens-of-millions-yen tier in some cases [SI]',
      ],
      [
        'Renewable energy (solar/wind)',
        'Entry-level pay sits at the lower end of the industry-wide ¥5–10M band, JAC gives no tier breakdown [JAC]',
        'Development project manager ¥10–15M [RW]',
        'Business development director ¥13–16M, construction director ¥14–20M [RW]; large-firm average pay: INPEX ¥11.17M, J-POWER ¥10.46M, Renova ¥9.92M [JAC]',
      ],
      [
        'Carbon/climate (GX talent)',
        'Non-management incumbents average ¥6M, ¥0.69M above non-GX roles [KOTORA]',
        'Job-market postings ¥6–13M; headline venture offers up to ¥15M, a title-level figure [SC/NIKKEI]',
        'Management incumbents average ¥9.52M, ¥0.49M above non-GX roles, overall premium +13% [KOTORA]',
      ],
      [
        'Sustainable finance/ESG investing',
        'ESG analyst (securities/asset mgmt) ¥7.5–14M [SI]',
        'Bank project finance (ESG/renewables), live listing ¥5–14M [MPJ]',
        'Sustainability investment manager ¥8–20M+ [SI]',
      ],
    ],
  },
  jpStartupNote:
    'Climate-tech startups (single-company examples, not a platform average): Asuene averages ¥5.67M overall — engineers ¥5–8M, consultants ¥7–11M, M&A/strategy ¥6–20M [TL]; Zeroboard recruiting ¥5–8M, marketing lead ¥9–10M; e-dash engineers ¥4.5–7M, customer success ¥5–7M; enechain senior roles cluster ¥9–18M; Faeger ¥7–13M [SC]. These numbers look strong, but each is one live posting, not a statistical average, and will vary company to company. ESG roles in insurance are a genuine blank; I found no reliable public data, so that cell stays empty rather than invented.',
  jpTrend:
    'The policy dividend is measurable: Japan’s 2023 GX Promotion Act commits to ¥150 trillion in public-private investment over ten years [METI]; GX-related job postings grew 5.87× between 2016 and 2022, while actual job changes only kept pace at 3.09×, demand is outrunning the talent pipeline [RC]. The green premium concentrates at the junior level: +13% overall, splitting into +13% for non-management and only +5.4% for management [KOTORA], the steepest slope change sits with younger workers. Consulting is the salary elevator, in-house is the ceiling: consultants run from ¥6M up past ¥20M, while in-house roles mostly cap around ¥12M [JAC/SI]. Tokyo concentration is extreme; Tokyo’s average monthly wage runs 22% above the national figure [MHLW], and ESG, finance and consulting roles sit almost entirely there. Market-wide reference points: general workers’ monthly wage is ¥330,400, the largest year-on-year rise in 33 years at +3.8% [MHLW]; doda’s cross-industry average annual salary is ¥4.29M [PERSOL]; the 2025 shuntō final tally landed at +5.25%, the second straight year above 5% and the highest in 34 years [RENGO].',
  jpGap:
    'A few honest caveats. First, no headhunter guide in Japan publishes a dedicated ESG salary table; every row above is cross-checked and stitched together, read the confidence flags, don’t mistake this for an official release. Second, ESG roles in insurance are a genuine blank, see the note above. Third, in-house pay above department-head level rests on indirect evidence only, offer anecdotes and recruiter observation, not a statistical sample. Fourth, Japan’s labour ministry has no “sustainability role” occupational category at all, so an official green-collar benchmark simply doesn’t exist there, that’s an honest gap, not something I failed to look for.',
  skillTitle: 'Four skill combinations lifting your leverage',
  skillIntro:
    'The “green premium” is two different stories by market. In Singapore it’s real and quantifiable; in Taiwan the title premium is only 5.3%. That “low” is itself intelligence: the money isn’t in the word “sustainability”, it’s in the hard skill underneath it. 41% of Taiwan’s green-collar demand comes from electronics/semiconductor and manufacturing [VC], which want people who can do carbon inventory, energy management and supply-chain data.',
  skills: [
    { tag: 'Combo A', head: 'Carbon accounting × finance', body: 'Scope 3 and carbon-accounting expertise adds 12–18% [OS]; Singapore’s 150 carbon-services firms are all fighting for this line.' },
    { tag: 'Combo B', head: 'CSRD / ISSB / ESRS compliance', body: 'This regulatory knowledge lifts pay materially; Taiwan adopts IFRS sustainability-disclosure standards from 2026, so the same skill works in both markets.' },
    { tag: 'Combo C', head: 'AI × green skills', body: 'Those with both earn 10–15% more than green-only peers; APAC’s AI-skill premium is still the world’s highest (18%).' },
    { tag: 'Combo D', head: 'Structural signal', body: 'Green-skilled hiring rates run 46.6% above the overall workforce, and 53% of green-skill hires land in non-green titles. Green skill is becoming a value layer, not a standalone job.' },
  ],
  actionsTitle: 'Three moves for Taiwan readers',
  actions: [
    {
      head: 'Don’t switch jobs for a “sustainability” title; switch for a skill combination.',
      body: 'Taiwan’s title premium is 5.3%; the skill premium (carbon accounting, compliance, AI×green) is 10–18% regionally. If you’re spending two years, spend them on Scope 3 practice and ISSB standards, not on collecting a fifth certificate.',
    },
    {
      head: 'Targeting Singapore? The battleground is carbon markets and sustainable finance; your weapon is Taiwan manufacturing experience.',
      body: 'Taiwanese hands-on electronics-supply-chain carbon inventory is exactly what Singapore consultancies lack. One reminder: the EP salary threshold is S$5,600 (finance S$6,200), so 0–3 yrs sits right at the line while 4+ yrs improves your odds markedly.',
    },
    {
      head: 'Use certificates to open doors, not to expect a raise.',
      body: 'Certificates get you 5.4× the interviews but only 5.3% more pay. So don’t write “holds ISO 14064”, write “used it to audit N plants and saved the client X in verification cost.” Certificates open the door; quantified results negotiate the price.',
    },
  ],
  ctaEyebrow: 'So, where do you sit?',
  ctaTitle: 'This report is the market’s map. Where you sit, the MRI tells you in three minutes.',
  ctaBody:
    'Where you sit depends on your skill combination, seniority and target market, which is exactly what the free green-collar MRI does: it places you into the bands above and tells you what’s missing and what to build next.',
  ctaButton: 'Take the green-collar MRI (free) →',
  ctaSub: 'About 5 min · Free · No signup',
  sourcesLabel: 'Methodology & sources',
  method:
    'Cross-checked against public online sources in July 2026. Every figure keeps its original range with no false precision; single-source, self-reported and model-estimated numbers are flagged; where the data simply isn’t reliable (Taiwan’s 4–8-year mid-band, Japan’s insurance-sector ESG roles, most cities’ climate-tech startup bands) I say so directly. The Japan section was cross-checked in July 2026 across four source layers — headhunter guides, specialist job sites, live postings, official statistics — see that section for confidence flags. FX: 1 SGD ≈ 25 TWD, 1 USD ≈ 1.35 SGD ≈ 33.75 TWD; yen figures keep their original currency, no secondary conversion, to avoid stacking errors. The opening scene is a composite I built from salary data, not a specific person.',
  sources: [
    { code: 'MOE', name: 'MoENV × 104, “H2-2025 Green-Collar Talent Employment Trends”', note: 'Taiwan official primary source' },
    { code: 'MP', name: 'Michael Page, Singapore Salary Guide 2026', note: 'Recruiter guide' },
    { code: 'RW', name: 'Robert Walters, Salary Survey 2026', note: 'APAC' },
    { code: 'OS', name: 'OneStop ESG, 2026 Sustainability Salary Survey', note: 'n=2,147, APAC sample ~9%' },
    { code: 'EB', name: 'Eco-Business relaying Michael Page Singapore survey', note: '2023, structural reference; absolute values dated' },
    { code: '104', name: '104 Salary Intel: sustainability manager', note: 'Platform-reported' },
    { code: 'VC', name: 'Vocus analysis of the MOE report', note: 'Secondary analysis' },
    { code: 'JD', name: 'Jobsdb Hong Kong environmental-consultant pay', note: 'Platform data' },
    { code: 'MOM', name: 'Singapore MOM EP qualifying salary threshold', note: 'Official, effective 2025' },
    { code: 'JAC', name: 'JAC Recruitment Japan market-salary trend pages (sustainability/ESG consulting/renewables)', note: 'Headhunter guide, updated Apr–Jul 2026' },
    { code: 'DD', name: 'doda job-listing keyword search page ("sustainability")', note: 'Live posting search results, time-limited' },
    { code: 'SC', name: 'Sus-Career (sus-career.com) feature articles and live job listings', note: 'Job-transition media, incl. posting examples' },
    { code: 'SI', name: 'sus-insights.com salary rankings', note: 'Industry aggregator site' },
    { code: 'KOTORA', name: 'Kotora, relaying Deloitte Tohmatsu “Survey on GX Talent Salaries” (2024-10)', note: 'Only structured survey-level data, highest confidence' },
    { code: 'MHLW', name: 'Ministry of Health, Labour and Welfare, Basic Survey on Wage Structure (Reiwa 6)', note: 'Japan official wage statistics' },
    { code: 'PERSOL', name: 'doda / Persol Career, “2025 Average Annual Salary Ranking” release', note: 'Job-platform official statistics' },
    { code: 'RENGO', name: 'Japanese Trade Union Confederation (Rengo), 2025 shuntō final tally', note: 'Official union statistics, final tally not the first flash estimate' },
    { code: 'MPJ', name: 'Michael Page Japan live ESG/project-finance job listings', note: 'Single-posting example' },
    { code: 'NIKKEI', name: 'Nikkei Reskilling (member-gated article headline)', note: 'Headline figure; full text behind paywall, not read' },
    { code: 'METI', name: 'Ministry of Economy, Trade and Industry, GX policy documents (GX Promotion Act / ¥150T investment)', note: 'Japan official policy document' },
    { code: 'TL', name: 'tleon.co.jp, republishing Asuene employee salary page', note: 'Single-company salary page' },
    { code: 'RC', name: 'Recruit press release, “GX Talent Job-Market Trends” (published Aug 2023)', note: 'GX job-growth multiple survey, covers 2016–2022' },
  ],
  footer:
    '© 2026 AhaMoment Green-Collar Intel · Market information, not personal investment, legal or immigration advice · Figures cite sources and keep ranges; weak data is flagged.',
};

export const salaryReports: Record<Locale, SalaryReport> = {
  'zh-TW': zhTW,
  en,
};
