import type { Locale } from '@/lib/constants';

/**
 * 《2026 亞太綠領薪資報告》— a public lead-magnet article rendered on-site
 * at /[locale]/salary-report. Standalone, locale-keyed content (mirrors the
 * sampleReports pattern) so it stays out of the getContent schema.
 *
 * All figures carry a source code (see `sources`); weak data is marked 推估 /
 * 樣本不足 / estimate. The opening scene is a composite built from salary data,
 * not a specific real person. This is market information, not personal advice.
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
  hkjpTitle: string;
  hk: string;
  jp: string;
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
    title: '2026 亞太綠領薪資報告：星台差 2–3 倍的真相',
    description:
      '同職能同資歷,新加坡薪資約是台灣的 2–3 倍嗎?我們翻遍星台 2025–2026 公開薪資指南、官方就業報告與求職平台數據:答案是真的,但有三個你必須先知道的條件。綠色/永續/ESG 職能。',
  },
  eyebrow: '綠領情報 · 2026',
  title: '做一樣的事,薪水三倍半——這數字是真的嗎?',
  lede: '我們翻遍新加坡與台灣 2025–2026 的公開薪資指南、官方就業報告與求職平台數據,回答一個很多人不敢相信的問題:同職能同資歷,跨海之後薪水真的差 2–3 倍嗎?答案是真的,但有三個你必須先知道的條件。',
  byline: '《2026 亞太薪資報告》· 綠色 / 永續 / ESG 職能 · 資料截至 2026 年 7 月',
  backToMri: '← 回到免費 MRI',
  scene:
    '台北,週四晚上十點半。一位在四大做了四年碳盤查的顧問,剛改完客戶永續報告書的第三版,月薪五萬四。LinkedIn 跳出一則新加坡碳交易公司的職缺,做的事她閉著眼睛都會:盤查、查驗、抵換評估。薪資欄寫著 S$8,000–10,000。她按了匯率換算:18 萬 6 到 23 萬台幣。',
  scenePunch: '她的第一反應不是心動,是懷疑——這是真的嗎?',
  stats: [
    { fig: '2–3×', cap: '同職能同資歷,新加坡名目薪資約為台灣的倍數' },
    { fig: '+5.3%', cap: '台灣「綠領」職稱的薪資溢價——幾乎等於零', gold: true },
    { fig: '+544%', cap: '但持相關證照者的面試邀約成長幅度', gold: true },
  ],
  findingsTitle: '三個關鍵發現',
  findings: [
    {
      tag: '發現 01',
      head: '同職能同資歷,新加坡名目薪資約是台灣的 2–3 倍',
      body: '台灣永續新人(1–3 年)月薪中位數約 5.2 萬〔104〕;新加坡同級年薪 S$50k–90k〔EB·OS〕,換算月薪約 9.6 萬–17 萬台幣——入行三年內差距就拉到 2 倍以上。',
    },
    {
      tag: '發現 02',
      head: '台灣的「綠領溢價」接近零:薪資只高 5.3%,但面試機會多 5.4 倍',
      body: '2025 下半年台灣綠領職缺月薪中位數 4.0 萬,全市場 3.8 萬〔MOE〕;同一份環境部×104 的報告顯示,持證照者面試邀約成長 544%〔MOE·VC〕。台灣市場現在付的是機會,不是薪水。',
    },
    {
      tag: '發現 03',
      head: '拉高薪水的不是「永續」職稱,是「永續 × 硬技能」的組合',
      body: '碳核算 / Scope 3 專長者比同資歷同儕高 12–18%〔OS〕;新加坡具碳足跡評估、生命週期分析(LCA)、永續採購實戰經驗者溢價 10–12%〔MP〕。職稱不值錢,技能組合才值錢。',
    },
  ],
  sgTitle: '新加坡薪資帶(主場)',
  sgNote: '年薪 · 新加坡幣 · 1 SGD ≈ 23 TWD',
  sgTable: {
    head: ['職能', '0–3 年', '4–8 年', '8 年以上'],
    rows: [
      ['永續金融(銀行/資管)', 'S$65k–90k', 'S$100k–160k', '氣候風險主管 S$250k–350k+'],
      ['碳市場 / 碳交易', '~S$72k*', '分析師 ~S$104k;交易員 ~S$131k*', '總監 S$180k–230k'],
      ['ESG 顧問', '月 S$4.5k–6.4k', 'S$100k–160k', '合夥人可達 ~S$420k**'],
      ['企業永續(sustainability mgr)', 'S$50k–80k', '~S$88k–142k', 'CSO S$200k–400k'],
    ],
  },
  sgStartupNote:
    '氣候科技新創:樣本不足,無可靠獨立薪資帶——不編數字。新創普遍以股權補貼低於市場的底薪。',
  sgTrend:
    '* 為模型推估(SalaryExpert),僅供量級參考。** 為媒體轉引之單一來源鏈。新加坡永續職位 2026 年薪資平均調升 7–10%,高階職能達 15%,遠高於全市場的 4.0–4.3%〔MP·RW〕。全境聚集 150+ 家碳服務與交易公司,是東南亞密度最高——這是碳市場薪資帶存在的結構性原因。',
  twTitle: '台灣對照與真實倍數',
  twTable: {
    head: ['項目', '數字', '換算對照'],
    rows: [
      ['綠領職缺整體月薪中位數', '4.0 萬', '全市場 3.8 萬,+5.3%'],
      ['永續管理師(1–3 年)', '~5.2 萬', '入行段'],
      ['溫室氣體查驗相關', '~6 萬', '技能加值'],
      ['資深主管職(年薪)', '200–300 萬', '塔尖'],
    ],
  },
  multiples:
    '以年薪比估算真實倍數:入行 0–3 年約 1.7–3 倍;中段 4–8 年約 2.5–3 倍;資深 8 年+ 約 2–3 倍。',
  caveat:
    '誠實兩件事:第一,台灣 4–8 年段沒有可靠的公開中位數,該區間是內插推估。第二,名目倍數不等於生活品質倍數——新加坡單房月租普遍 S$2,500 以上,個人所得稅則明顯低於台灣高薪級距。扣掉居住成本後,可支配所得差距大約收斂到 1.5–2.5 倍。差距仍然巨大,但不是表面的三倍。',
  hkjpTitle: '香港與日本(簡短,因為數據就是薄)',
  hk: '香港:環境顧問月薪約 HK$21k–24k〔JD〕,與台灣同級差距不大;唯永續金融是例外,受惠於港交所 ESG 披露樞紐定位。綠領機會集中在金融塔尖,塔基薪資不比台灣有明顯優勢。',
  jp: '日本:公開的職能級薪資帶樣本不足。Robert Walters 與 Morgan McKinley 的 2026 日本指南都未公開永續職能具體數字;可靠背景只有 2025 春鬥平均調薪 5.46%。這個市場沒有可靠公開數據,我不編——想去日本的讀者,建議直接下載兩家指南 PDF 自查。',
  skillTitle: '正在拉高你議價力的四種技能組合',
  skillIntro:
    '「綠領溢價」在不同市場是兩個故事。新加坡的溢價真實可量化;台灣的職稱溢價只有 5.3%——但這反而是情報:台灣付錢買的不是「永續」兩個字,而是它掛在什麼硬技能上。台灣綠領需求 41% 來自電子半導體與製造業〔VC〕,要的是能做碳盤查、能源管理、供應鏈數據的人。',
  skills: [
    { tag: '組合 A', head: '碳核算 × 金融', body: 'Scope 3 與碳會計專長溢價 12–18%;新加坡 150 家碳服務公司都在搶這條線的人。' },
    { tag: '組合 B', head: 'CSRD / ISSB / ESRS 合規', body: '這組法規知識顯著拉高薪酬;台灣 2026 年起接軌 IFRS 永續揭露準則,同一套技能兩地通用。' },
    { tag: '組合 C', head: 'AI × 綠色技能', body: '兼備者比只有綠色技能者高 10–15%;亞太的 AI 技能溢價全球最高(18%)。' },
    { tag: '組合 D', head: '結構性訊號', body: '綠色技能者錄用率比整體高 46.6%,且 53% 的錄用發生在「非綠色職稱」上——綠色技能正在變成加值層,而非獨立職業。' },
  ],
  actionsTitle: '給台灣讀者的三個行動',
  actions: [
    {
      head: '別為「永續」頭銜跳槽,為技能組合跳槽。',
      body: '台灣頭銜溢價 5.3%,技能溢價(碳核算、合規、AI×綠)在區域是 10–18%。同樣花兩年,投在 Scope 3 實戰和 ISSB 準則,不要投在收集第五張證照。',
    },
    {
      head: '目標新加坡,戰場選碳市場與永續金融,武器是台灣製造業經驗。',
      body: '台灣人在電子供應鏈碳盤查的實戰,正是新加坡顧問公司缺的。注意 EP 月薪門檻 S$5,600(金融 S$6,200)——0–3 年剛好卡在門檻上,4 年以上勝率明顯提高。',
    },
    {
      head: '證照拿來敲門,別期待它加薪。',
      body: '證照讓面試多 5.4 倍,薪資只多 5.3%。履歷別寫「持有 ISO 14064」,要寫「用它盤查過幾個廠、替客戶省下多少查驗成本」。證照開門,量化戰績談價。',
    },
  ],
  ctaEyebrow: '那,你自己在哪一段?',
  ctaTitle: '這份報告給的是市場的地圖。你的位置,MRI 三分鐘告訴你。',
  ctaBody:
    '你的位置要看你的技能組合、資歷與目標市場——這正是綠領 MRI 免費做的事:幫你把自己放進上面的薪資帶,告訴你缺哪一塊、下一步該補什麼。',
  ctaButton: '做一次綠領 MRI(免費)→',
  ctaSub: '約 5 分鐘 · 免費 · 免註冊',
  sourcesLabel: '方法論與來源附錄',
  method:
    '2026 年 7 月以公開網路來源交叉查證;每個數字保留原始區間,不做假精確;單一來源、自報樣本、模型推估均已標註;查不到可靠數據的市場(日本、氣候新創薪資帶、台灣 4–8 年中段)直接聲明樣本不足。匯率:1 SGD ≈ 23 TWD,1 USD ≈ 1.35 SGD ≈ 32.5 TWD。開場場景為依據薪資數據構成的典型情境,非特定個人。',
  sources: [
    { code: 'MOE', name: '環境部×104《2025 下半年綠領人才就業趨勢報告》', note: '台灣官方主來源' },
    { code: 'MP', name: 'Michael Page《Singapore Salary Guide 2026》', note: '招聘顧問指南' },
    { code: 'RW', name: 'Robert Walters《Salary Survey 2026》', note: '亞太' },
    { code: 'OS', name: 'OneStop ESG《2026 Sustainability Salary Survey》', note: 'n=2,147,亞太樣本 ~9%' },
    { code: 'EB', name: 'Eco-Business 轉引 Michael Page 新加坡永續調查', note: '2023,結構參考、絕對值偏舊' },
    { code: '104', name: '104 薪資情報:永續管理師', note: '平台申報' },
    { code: 'VC', name: 'Vocus 對 MOE 報告的分析', note: '二手分析' },
    { code: 'JD', name: 'Jobsdb 香港環境顧問薪資', note: '平台數據' },
    { code: 'MOM', name: '新加坡人力部 EP 合格薪資門檻', note: '官方,2025 起適用' },
  ],
  footer:
    '© 2026 AhaMoment 綠領情報 · 本報告為市場資訊彙整,非個人投資、法律或移民建議 · 數字附來源、保留區間,弱數據已標註。',
};

const en: SalaryReport = {
  meta: {
    title: '2026 APAC Green-Collar Salary Report: the 2–3× Singapore–Taiwan gap',
    description:
      'Is the same sustainability role really paid 2–3× more in Singapore than in Taiwan? We cross-checked 2025–2026 public salary guides, official employment reports and job-platform data. The answer is yes — with three conditions you need to know first.',
  },
  eyebrow: 'Green-Collar Intel · 2026',
  title: 'Same work, 3.5× the pay — is that number real?',
  lede: 'We went through every public salary guide, official employment report and job-platform dataset across Singapore and Taiwan for 2025–2026 to answer a question a lot of people can’t quite believe: for the same role and seniority, is the cross-strait pay gap really 2–3×? It’s real — but there are three conditions you need to understand first.',
  byline: '2026 APAC Salary Report · Green / Sustainability / ESG roles · Data as of July 2026',
  backToMri: '← Back to the free MRI',
  scene:
    'Taipei, Thursday, 10:30pm. A consultant four years into carbon accounting at a Big Four firm has just finished the third revision of a client’s sustainability report. Her salary is NT$54k a month. A Singapore carbon-trading job pops up on LinkedIn — inventory, verification, offset assessment, work she could do in her sleep. The pay band reads S$8,000–10,000. She runs the conversion: NT$186k–230k.',
  scenePunch: 'Her first reaction isn’t excitement — it’s doubt. Is this real?',
  stats: [
    { fig: '2–3×', cap: 'Same role and seniority — Singapore’s nominal pay vs Taiwan' },
    { fig: '+5.3%', cap: 'Taiwan’s “green-collar” title premium — basically zero', gold: true },
    { fig: '+544%', cap: 'But the rise in interview invitations for the certified', gold: true },
  ],
  findingsTitle: 'Three key findings',
  findings: [
    {
      tag: 'Finding 01',
      head: 'Same role, same seniority — Singapore’s nominal pay is ~2–3× Taiwan’s',
      body: 'Taiwan sustainability newcomers (1–3 yrs) sit around NT$52k/month median [104]; the Singapore equivalent is S$50k–90k/year [EB·OS], ~NT$96k–170k/month — a 2×+ gap within three years of entry.',
    },
    {
      tag: 'Finding 02',
      head: 'Taiwan’s “green premium” is near zero: pay +5.3%, but interviews +5.4×',
      body: 'H2-2025 Taiwan green-collar median is NT$40k vs NT$38k market-wide [MOE]; the same Ministry×104 report shows interview invitations up 544% for the certified [MOE·VC]. Taiwan pays for opportunity right now, not salary.',
    },
    {
      tag: 'Finding 03',
      head: 'What lifts pay isn’t the “sustainability” title — it’s sustainability × a hard skill',
      body: 'Carbon-accounting / Scope 3 specialists earn 12–18% above peers [OS]; in Singapore, hands-on carbon footprinting, LCA and sustainable-procurement experience adds 10–12% [MP]. The title is cheap; the combination is what pays.',
    },
  ],
  sgTitle: 'Singapore salary bands (home turf)',
  sgNote: 'Annual · SGD · 1 SGD ≈ 23 TWD',
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
    'Climate-tech startups: insufficient data, no reliable independent band — no numbers invented. Startups typically offer below-market base subsidised by equity.',
  sgTrend:
    '* Model estimate (SalaryExpert), order-of-magnitude only. ** Single media-relayed source chain. Singapore sustainability roles rose 7–10% on average in 2026, up to 15% for senior functions, well above the 4.0–4.3% market rate [MP·RW]. The country hosts 150+ carbon-services and trading firms — the densest in Southeast Asia, and the structural reason these bands exist.',
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
    'On an annualised basis the real multiples are: 0–3 yrs ~1.7–3×; mid 4–8 yrs ~2.5–3×; senior 8+ yrs ~2–3×.',
  caveat:
    'Two honest caveats. First, Taiwan has no reliable public median for the 4–8-year band — that range is interpolated. Second, a nominal multiple isn’t a quality-of-life multiple: a Singapore studio routinely rents at S$2,500+/month, while personal income tax is markedly lower than Taiwan’s high brackets. Net of housing, the disposable-income gap converges to roughly 1.5–2.5×. Still large — just not the surface 3×.',
  hkjpTitle: 'Hong Kong and Japan (brief — the data is simply thin)',
  hk: 'Hong Kong: environmental consultants earn ~HK$21k–24k/month [JD], not far from Taiwan’s equivalent; sustainable finance is the exception, buoyed by HKEX’s ESG-disclosure hub role. Green-collar opportunity concentrates at the financial apex; the base offers no clear edge over Taiwan.',
  jp: 'Japan: function-level public bands are insufficient. Robert Walters and Morgan McKinley both publish 2026 Japan guides but don’t disclose specific sustainability figures; the only reliable backdrop is the 2025 shuntō average raise of 5.46%. No reliable public data here — so no invented numbers; readers targeting Japan should download both guides’ PDFs directly.',
  skillTitle: 'Four skill combinations lifting your leverage',
  skillIntro:
    'The “green premium” is two different stories by market. In Singapore it’s real and quantifiable; in Taiwan the title premium is only 5.3% — which is itself intelligence: Taiwan isn’t paying for the word “sustainability,” it’s paying for the hard skill it hangs on. 41% of Taiwan’s green-collar demand comes from electronics/semiconductor and manufacturing [VC], which want people who can do carbon inventory, energy management and supply-chain data.',
  skills: [
    { tag: 'Combo A', head: 'Carbon accounting × finance', body: 'Scope 3 and carbon-accounting expertise adds 12–18%; Singapore’s 150 carbon-services firms are all fighting for this line.' },
    { tag: 'Combo B', head: 'CSRD / ISSB / ESRS compliance', body: 'This regulatory knowledge lifts pay materially; Taiwan adopts IFRS sustainability-disclosure standards from 2026 — the same skill works in both markets.' },
    { tag: 'Combo C', head: 'AI × green skills', body: 'Those with both earn 10–15% more than green-only peers; APAC’s AI-skill premium is the world’s highest (18%).' },
    { tag: 'Combo D', head: 'Structural signal', body: 'Green-skilled hiring rates run 46.6% above the overall workforce, and 53% of green-skill hires land in non-green titles — green skill is becoming a value layer, not a standalone job.' },
  ],
  actionsTitle: 'Three moves for Taiwan readers',
  actions: [
    {
      head: 'Don’t switch jobs for a “sustainability” title — switch for a skill combination.',
      body: 'Taiwan’s title premium is 5.3%; the skill premium (carbon accounting, compliance, AI×green) is 10–18% regionally. If you’re spending two years, spend them on Scope 3 practice and ISSB standards, not on collecting a fifth certificate.',
    },
    {
      head: 'Targeting Singapore? The battleground is carbon markets and sustainable finance; your weapon is Taiwan manufacturing experience.',
      body: 'Taiwanese hands-on electronics-supply-chain carbon inventory is exactly what Singapore consultancies lack. Note the EP salary threshold S$5,600 (finance S$6,200) — 0–3 yrs sits right at the line; 4+ yrs improves your odds markedly.',
    },
    {
      head: 'Use certificates to open doors, not to expect a raise.',
      body: 'Certificates get you 5.4× the interviews but only 5.3% more pay. Don’t write “holds ISO 14064” — write “used it to audit N plants and saved the client X in verification cost.” Certificates open the door; quantified results negotiate the price.',
    },
  ],
  ctaEyebrow: 'So — where do you sit?',
  ctaTitle: 'This report is the market’s map. Your position, the MRI tells you in three minutes.',
  ctaBody:
    'Where you sit depends on your skill combination, seniority and target market — which is exactly what the free green-collar MRI does: it places you into the bands above and tells you what’s missing and what to build next.',
  ctaButton: 'Take the green-collar MRI (free) →',
  ctaSub: '~5 min · Free · No signup',
  sourcesLabel: 'Methodology & sources',
  method:
    'Cross-checked against public online sources in July 2026; every figure keeps its original range with no false precision; single-source, self-reported and model-estimated numbers are flagged; markets without reliable data (Japan, climate-tech startup bands, Taiwan’s 4–8-year mid-band) are declared insufficient. FX: 1 SGD ≈ 23 TWD, 1 USD ≈ 1.35 SGD ≈ 32.5 TWD. The opening scene is a composite built from salary data, not a specific person.',
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
  ],
  footer:
    '© 2026 AhaMoment Green-Collar Intel · Market information, not personal investment, legal or immigration advice · Figures cite sources and keep ranges; weak data is flagged.',
};

export const salaryReports: Record<Locale, SalaryReport> = {
  'zh-TW': zhTW,
  en,
};
