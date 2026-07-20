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
  hkjpTitle: '香港與日本（很短，因為數據就是薄）',
  hk: '香港：環境顧問月薪大約 HK$21k–24k〔JD〕，跟台灣同級距離不大。唯一的例外是永續金融，靠著港交所 ESG 披露樞紐的定位撐起來。香港的綠領機會集中在金融塔尖，塔基的薪水不會比台灣有明顯優勢。',
  jp: '日本：公開的職能級薪資帶樣本太少。Robert Walters 和 Morgan McKinley 的 2026 日本指南都沒公開永續職能的具體數字，唯一可靠的背景只有 2025 年春鬥平均調薪 5.46%。這個市場我查不到可靠的公開數據，所以不編；真的想去日本的人，建議直接下載這兩家的指南 PDF 自己查。',
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
    '2026 年 7 月，以公開網路來源交叉查證。每個數字都保留原始區間，不做假精確；單一來源、自報樣本、模型推估都會標註；查不到可靠數據的市場（日本、氣候新創薪資帶、台灣 4 到 8 年中段），我就直接說樣本不足。匯率用 1 SGD ≈ 25 TWD，1 USD ≈ 1.35 SGD ≈ 33.75 TWD。開場那個場景是我根據薪資數據拼出來的典型情境，不是特定某個人。',
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
  hkjpTitle: 'Hong Kong and Japan (brief, because the data is simply thin)',
  hk: 'Hong Kong: environmental consultants earn ~HK$21k–24k/month [JD], not far from Taiwan’s equivalent. The exception is sustainable finance, buoyed by HKEX’s ESG-disclosure hub role. Green-collar opportunity concentrates at the financial apex; the base offers no clear edge over Taiwan.',
  jp: 'Japan: function-level public bands are too thin. Robert Walters and Morgan McKinley both publish 2026 Japan guides but don’t disclose specific sustainability figures; the only reliable backdrop is the 2025 shuntō average raise of 5.46%. I couldn’t find reliable public data here, so I don’t invent it; if you’re serious about Japan, download both guides’ PDFs and check directly.',
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
    'Cross-checked against public online sources in July 2026. Every figure keeps its original range with no false precision; single-source, self-reported and model-estimated numbers are flagged; for markets without reliable data (Japan, climate-tech startup bands, Taiwan’s 4–8-year mid-band) I simply say the sample is insufficient. FX: 1 SGD ≈ 25 TWD, 1 USD ≈ 1.35 SGD ≈ 33.75 TWD. The opening scene is a composite I built from salary data, not a specific person.',
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
