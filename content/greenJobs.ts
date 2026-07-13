import type { Locale } from '@/lib/constants';

/**
 * 綠領職缺雷達 (Green-Collar Jobs Radar) — a curated launchpad, NOT a scraped feed.
 * We never re-host or resell listings: every link points to an employer's own
 * page or a public job board's search. `weeklyPicks` is a small, human-approved
 * shortlist refreshed weekly (empty is fine — the page then nudges the newsletter).
 *
 * Data is language-neutral (orgs, URLs); chrome/labels live in `greenJobsCopy`.
 */
export type MarketKey = 'SG' | 'TW' | 'HK' | 'UK';

export interface JobLink {
  label: string;
  url: string;
}

export interface JobMarket {
  key: MarketKey;
  employers: string[]; // employers with a standing green-collar hiring presence
  boards: JobLink[]; // real, public search entry points (constructed, not scraped)
}

export interface SalarySource {
  label: string;
  url: string;
}

export interface WeeklyPick {
  org: string;
  roleZh: string;
  roleEn: string;
  market: MarketKey;
  metaZh: string; // 地點 · 年資 · 更新日 — verified at pick time
  metaEn: string;
  salaryZh: string; // 薪資帶(估算)— a tight, sourced range, never false precision
  salaryEn: string;
  salarySources: SalarySource[]; // clickable source links backing the range
  // 我們的點評 — paragraphs. See docs/job-pick-playbook.md. Para 1 = signal/strategy,
  // para 2 = fit/play/cost. Michael's voice, the moat.
  takeZh: string[];
  takeEn: string[];
  url: string; // links to the source listing / employer page — never re-hosted
}

export interface GreenJobsData {
  updatedAt: string; // YYYY-MM-DD — bump when weeklyPicks refresh
  markets: JobMarket[];
  weeklyPicks: WeeklyPick[];
  // Separate MBA / strategy track (Michael's MBA alert keyword). Same shape as
  // weeklyPicks. Kept apart so the green-collar radar stays coherent.
  mbaPicks: WeeklyPick[];
}

export const greenJobs: GreenJobsData = {
  updatedAt: '2026-07-12',
  markets: [
    {
      key: 'SG',
      employers: ['EY', 'ERM', 'Arup', 'Deloitte', 'GlobalFoundries', 'GIC', 'Siemens Energy', 'Neste', 'Swiss Re', 'AXA'],
      boards: [
        { label: 'LinkedIn · sustainability', url: 'https://sg.linkedin.com/jobs/sustainability-jobs' },
        { label: 'JobStreet · ESG', url: 'https://sg.jobstreet.com/ESG-jobs' },
        { label: 'MyCareersFuture · sustainability', url: 'https://www.mycareersfuture.gov.sg/search?search=sustainability&sortBy=new_posting_date' },
      ],
    },
    {
      key: 'TW',
      employers: ['台灣世曦', 'KPMG', 'Deloitte 勤業眾信', '台積電', '中鼎工程', 'PwC'],
      boards: [
        { label: '104 · 永續', url: 'https://www.104.com.tw/jobs/search/?keyword=%E6%B0%B8%E7%BA%8C' },
        { label: '104 · ESG', url: 'https://www.104.com.tw/jobs/search/?keyword=ESG' },
        { label: 'Indeed · ESG', url: 'https://tw.indeed.com/q-esg-%E8%81%B7%E7%BC%BA.html' },
      ],
    },
    {
      key: 'HK',
      employers: ['HKEX', 'HSBC', 'ERM', 'AECOM', 'Arup'],
      boards: [
        { label: 'JobsDB · environmental', url: 'https://hk.jobsdb.com/environmental-jobs' },
        { label: 'LinkedIn · sustainability', url: 'https://hk.linkedin.com/jobs/sustainability-jobs' },
      ],
    },
    {
      key: 'UK',
      employers: ['MSCI', 'LSEG', 'Schroders', 'ERM', 'Bloomberg', 'PwC'],
      boards: [
        { label: 'LinkedIn · sustainability', url: 'https://uk.linkedin.com/jobs/sustainability-jobs' },
        { label: 'Indeed · sustainability & ESG', url: 'https://uk.indeed.com/q-sustainability-esg-jobs.html' },
      ],
    },
  ],
  // Human-approved weekly shortlist. DRAFT for Michael's review — sources:
  // his LinkedIn job-alert emails (SG/HK/UK, 7/09–7/11) + 104 (TW, 7/08).
  // Commentary follows docs/job-pick-playbook.md (Michael to finalise);
  // salaries are tight sourced estimates; urls pending each posting's direct link.
  weeklyPicks: [
    {
      org: 'Ministry of Trade and Industry (Singapore)',
      roleZh: '資深／助理司長，碳策略司',
      roleEn: 'Senior/Assistant Director, Carbon Strategy Division',
      market: 'SG',
      metaZh: '新加坡 · 資深 · 更新 7/11',
      metaEn: 'Singapore · senior · updated 7/11',
      salaryZh: 'S$150k–210k/年（推估；公部門薪級不公開，以民間永續金融總監帶回推）',
      salaryEn: 'Est. S$150k–210k/yr (public-sector bands undisclosed; reverse-benchmarked from private sustainable-finance director bands)',
      salarySources: [{ label: '薪資報告（本站）', url: '/zh-TW/salary-report' }],
      takeZh: [
        '先讀懂這個位子背後的局。新加坡不是在做碳合規，是在把自己做成亞洲的碳定價與碳交易樞紐：碳稅一路調到 2030 年、跟國際碳權市場（《巴黎協定》第 6 條）接軌、底下還養著一整個碳服務業聚落。這時候把「碳策略司」獨立出來、還開到資深司長級，等於國家層級在補「設計規則的人」。所以這職缺乍看是公務員，其實是站在整條碳市場價值鏈最上游、決定別人要照什麼規則玩的位子。',
        '適合的人很特定：已經在碳市場、碳權或永續金融實戰過，受夠了只能執行別人訂的規則、想往制定端走。你在民間看過規則哪裡會被鑽、哪裡跟現實脫節，那正是政策桌上最缺、也最難從學界補進來的視角。面試主軸別堆證照，講一個你實際操作時撞到的規則破口、你會怎麼修。但代價要先認清：公部門薪級不透明、決策鏈長。你交出的是政策，換到的是對規則的影響力，代價就是看不到民間帳面上最高的那個數字。',
      ],
      takeEn: [
        'Read the board behind this seat first: Singapore isn’t doing carbon compliance — it’s building itself into Asia’s carbon-pricing and carbon-trading hub, with a carbon tax ramping to 2030, Article 6 links to international credit markets, and a whole carbon-services cluster beneath it. Standing up a Carbon Strategy Division at senior-director level is the state staffing “the people who design the rules”. So it looks like a civil-service job but sits at the very top of the carbon-market value chain — deciding the rules everyone else plays by.',
        'The fit is specific: someone who has operated in carbon markets, credits or sustainable finance and is tired of only executing rules others set. You’ve seen where rules get gamed and where they detach from reality — exactly the view the policy table lacks and can’t easily hire from academia. Pitch a real rule-gap you hit in practice and how you’d fix it, not certificates. But price the cost in: opaque public-sector pay, long decision chains, output is policy not trades — you’re buying leverage over influence, not the highest number.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=MTI%20Carbon%20Strategy%20Director%20Singapore',
    },
    {
      org: 'MSCI',
      roleZh: 'EMEA 永續與氣候指數主管',
      roleEn: 'EMEA Sustainability & Climate Index Head',
      market: 'UK',
      metaZh: '英國倫敦 · 主管級 · 更新 7/10',
      metaEn: 'London, UK · head level · updated 7/10',
      salaryZh: '£140k–190k/年（推估；介於 MSCI Executive Director 帶與倫敦 Head of Sustainability 之間）',
      salaryEn: 'Est. £140k–190k/yr (between MSCI Executive Director bands and London Head of Sustainability)',
      salarySources: [
        { label: 'Glassdoor · MSCI', url: 'https://www.glassdoor.com/Salary/MSCI-Salaries-E14616.htm' },
        { label: 'Glassdoor · London Head of Sustainability', url: 'https://www.glassdoor.co.uk/Salaries/london-head-of-sustainability-salary-SRCH_IL.0,6_IM1035_KO7,29.htm' },
      ],
      takeZh: [
        '這個缺真正的故事，是 ESG 正在從「企業要交的作業」變成「金融在交易的商品」。指數公司這幾年打的仗，就是把氣候與永續數據包裝成可交易、可收授權費的指數產品，賣給全世界的資產管理公司，一門毛利極高、規模贏者通吃的數據生意。所以它掛著永續，骨子裡是產品與商業負責人職，管的是 EMEA 這條變現線的最上游；職稱裡的「Index Head」比「Sustainability」重得多。',
        '它要的是三樣一起長：指數與因子方法論、氣候數據的技術底、加上把它賣進買方的商業手腕，只會寫報告書或做企業永續的人接不住。適合已經在 ESG 評級或數據商圈、想從分析師往「扛營收的產品負責人」跳的人。天花板高、倫敦總部，但要有心理準備：你的競爭者是一批已經在指數或數據業務練過的人，純永續背景一定要先補上「金融產品怎麼定價、怎麼賣」那一塊，不然面試第二輪就會被問倒。',
      ],
      takeEn: [
        'The real story here is ESG shifting from “homework companies file” to “a product finance trades”. What index houses have been fighting over is packaging climate and sustainability data into tradable, licensable index products sold to asset managers worldwide — a high-margin, winner-takes-scale data business. So this isn’t a sustainability job; it’s a product-and-commercial lead sitting at the top of the EMEA monetisation line. “Index Head” weighs far more than “Sustainability” in that title.',
        'It needs three things at once: index/factor methodology, real climate-data depth, and the commercial chops to sell it to the buy-side — a report-writer or corporate-sustainability person won’t hold it. It fits someone already in ESG ratings/data who wants to jump from analyst to a revenue-owning product lead. High ceiling, London HQ — but expect to compete with people who’ve run index or data businesses; a pure-sustainability background must first add “how financial products get priced and sold”, or the second interview round will expose it.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=MSCI%20Sustainability%20Climate%20Index%20Head',
    },
    {
      org: 'ISS STOXX',
      roleZh: '副總裁，永續與治理解決方案業務',
      roleEn: 'VP, Sales — Sustainability & Governance Solutions',
      market: 'HK',
      metaZh: '香港 · VP 級 · 更新 7/10',
      metaEn: 'Hong Kong · VP · updated 7/10',
      salaryZh: 'HK$950k–1.4M/年（推估；含業績獎金）',
      salaryEn: 'Est. HK$950k–1.4M/yr (incl. performance bonus)',
      salarySources: [
        { label: 'Glassdoor · 香港 VP', url: 'https://www.glassdoor.com.hk/Salaries/hong-kong-vice-president-salary-SRCH_IL.0,9_IC2308631_KO10,24.htm' },
      ],
      takeZh: [
        '先破題：職稱掛「永續與治理解決方案」，骨子裡的關鍵字是 Sales。ISS STOXX 是把代理投票、公司治理、ESG 數據賣給機構投資人的供應商，這個 VP 的工作，是把這些解決方案賣進香港與大中華的資產管理公司和資產所有人。它其實是個訊號：香港作為資產管理樞紐，買方對「治理與 ESG 數據」的付費需求正在被機構化，而這條需求是業務在接的，不是研究。',
        '這也是最容易投錯的一個缺。很多有永續背景的人看到「Sustainability」就撲上去，進去才發現 KPI 是業績、行事曆全是客戶會議。它真正適合的人，是懂永續與治理數據、客戶關係與口條強、享受把複雜的東西講成一句話讓客戶買單、又吃得下獎金壓力的那種。香港機構客群密度、獎金彈性是甜點。投之前只要誠實回答一題：你的成就感來自把單談成，還是把數據做深？這兩種人選這個缺，一年後會走到完全不同的地方。',
      ],
      takeEn: [
        'Cut to it: the title says “Sustainability & Governance Solutions”, but the operative word is Sales. ISS STOXX sells proxy voting, governance and ESG data to institutional investors, and this VP sells those into Hong Kong / Greater China asset managers and owners. It’s a signal: as an asset-management hub, HK’s buy-side demand for governance and ESG data is being institutionalised — and that demand is met by sales, not research.',
        'It’s also the easiest pick to mis-apply to: people with a sustainability background see “Sustainability” and pounce, then find the KPI is quota and the calendar is client meetings. The real fit: knows sustainability and governance data, strong on client relationships and articulation, enjoys turning complexity into one line a client will buy, and can take bonus-driven pressure. HK’s dense institutional base and elastic bonus are the sweeteners. Before applying, answer one question honestly — do you get satisfaction from closing the deal or from going deep on the data? Those two people end up worlds apart here a year in.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=ISS%20STOXX%20Sustainability%20Governance%20Sales%20Hong%20Kong',
    },
    {
      org: 'Brunswick Group',
      roleZh: '董事，永續業務',
      roleEn: 'Director, Sustainable Business',
      market: 'SG',
      metaZh: '新加坡 · 董事級 · 更新 7/11',
      metaEn: 'Singapore · director · updated 7/11',
      salaryZh: 'S$130k–175k/年（推估；參照資深 ESG 顧問帶）',
      salaryEn: 'Est. S$130k–175k/yr (benchmarked to senior ESG-consulting bands)',
      salarySources: [{ label: '薪資報告（本站）', url: '/zh-TW/salary-report' }],
      takeZh: [
        'Brunswick 是頂級的策略溝通顧問（危機、併購溝通、利害關係人管理那一掛），它開「永續業務董事」的意思是：大企業的永續問題，已經從「要不要做」變成「怎麼對投資人、監管、媒體、員工把它講清楚，而且經得起挑戰」。這個位子做的不是碳盤查，也不是報告書，是企業級的定位與敘事工程。說穿了，就是綠領 MRI 幫個人做的那件事，放大到一整家公司。',
        '適合的是稀有的雙棲款：一手有永續的實質底（懂 CSRD、懂淨零、聽得懂 CSO 在焦慮什麼），一手有溝通、公關、敘事的敏感度（能把它翻成 CEO 和董事會聽得進去的故事）。這種缺市場上很少，因為多數人只長一邊。門檻也在這：你得同時跟 CSO 談實質、跟 CEO 談故事，純技術背景會被嫌不會講，純公關背景會被嫌不懂。如果你剛好兩邊都沾，這正是把你的「雜」變成溢價的位子。',
      ],
      takeEn: [
        'Brunswick is a top strategic-communications firm (crisis, M&A comms, stakeholder management). Opening a “Director, Sustainable Business” means big companies’ sustainability problem has moved from “whether to do it” to “how to explain it to investors, regulators, media and staff in a way that survives scrutiny”. This seat isn’t inventory or reports — it’s corporate-scale positioning and narrative work. In plain terms, it’s what the green-collar MRI does for an individual, scaled to a whole company.',
        'The fit is a rare dual profile: real sustainability substance on one side (CSRD, net-zero, understanding what keeps a CSO up at night) and comms/PR/narrative instinct on the other (translating it into a story a CEO and board will take in). The role is scarce because most people grow only one side. That’s also the bar: you must talk substance with the CSO and story with the CEO — a pure-technical background gets called inarticulate, a pure-PR one gets called shallow. If you happen to straddle both, this is the seat that turns your “mixed” profile into a premium.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=Brunswick%20Sustainable%20Business%20Director%20Singapore',
    },
    {
      org: '雲智永續策略',
      roleZh: '永續管理師／專員（碳盤查、碳足跡）',
      roleEn: 'Sustainability Manager (GHG & carbon footprint)',
      market: 'TW',
      metaZh: '台北信義 · 1 年以上 · 更新 7/08',
      metaEn: 'Taipei · 1+ yrs · updated 7/08',
      salaryZh: '月薪面議；新進 1 到 3 年約 5.2 萬起，顧問型略高',
      salaryEn: 'Negotiable; entry (1–3 yr) from ~NT$52k/mo, consulting slightly higher',
      salarySources: [
        { label: '104 · 永續管理師', url: 'https://www.104.com.tw/jobs/search/?keyword=%E6%B0%B8%E7%BA%8C%E7%AE%A1%E7%90%86%E5%B8%AB' },
      ],
      takeZh: [
        '對 1 到 3 年的人，這種顧問型入門缺其實比進大公司值錢：一個職缺同時碰溫室氣體盤查、碳足跡、報告書，等於一次把三項最核心的硬技能一起練起來。在大企業裡你通常只會被塞其中一塊，兩年後履歷反而單薄。台灣現在的結構是機會爆量、薪資溢價還沒跟上，而顧問公司正是接案量最大、最快把你丟上戰場練的地方。',
        '「待遇面議」通常代表帶寬還沒鎖死。面試別急著背證照，講你實際盤過幾個廠、抓出過哪些數據對不上、幫客戶省下多少查驗成本，那才是顧問公司真正在買的能力。要有心理準備的是：顧問案雜、客戶多、節奏快、常要救火，想要穩定 SOP 和準時下班的人會不適應。但如果你要的是兩年內把技能練到能獨當一面，這種缺的學習曲線最陡，也最划算。',
      ],
      takeEn: [
        'For a 1–3-year person, this kind of entry-level consulting seat is worth more than joining a big firm: one role touching GHG inventory, carbon footprint and reporting at once stacks the three core hard skills together — at a large company you’d usually be handed one slice, leaving a thin CV two years on. Taiwan’s pattern right now is “opportunity exploding, pay premium not yet catching up”, and consultancies are where the case volume is highest and you get thrown onto the field fastest.',
        '“Negotiable pay” usually means the band isn’t locked — so don’t recite certificates in the interview; talk about the plants you’ve actually audited, the data mismatches you caught, the verification cost you saved the client. That’s the capability consultancies buy. Be ready for the trade-off: consulting work is messy, multi-client, fast, often firefighting — anyone wanting a stable SOP and on-time evenings will chafe. But if what you want is to become self-sufficient within two years, this is the steepest and best-value learning curve.',
      ],
      url: 'https://www.104.com.tw/jobs/search/?keyword=%E9%9B%B2%E6%99%BA%E6%B0%B8%E7%BA%8C',
    },
  ],
  // MBA / strategy track — from Michael's LinkedIn MBA alerts (7/09–7/10).
  mbaPicks: [
    {
      org: 'The LEGO Group',
      roleZh: 'APAC 策略夥伴',
      roleEn: 'Strategy Partner, APAC',
      market: 'SG',
      metaZh: '新加坡 · 更新 7/10',
      metaEn: 'Singapore · updated 7/10',
      salaryZh: 'S$150k–220k/年（推估；區域策略職，含獎金）',
      salaryEn: 'Est. S$150k–220k/yr (regional strategy role, incl. bonus)',
      salarySources: [
        { label: 'Glassdoor · Singapore strategy', url: 'https://www.glassdoor.sg/Salaries/singapore-strategy-manager-salary-SRCH_IL.0,9_IM1123_KO10,26.htm' },
      ],
      takeZh: [
        'LEGO 在新加坡設一個 APAC 策略夥伴，訊號很清楚：玩具和娛樂品牌把亞太當成下一段成長主戰場，而且要的是能坐在區域總部、直接跟高層做決策的人。這種「Strategy Partner」通常掛在 GM 或 CEO 底下，做的是市場進入、成長議題、跨部門的大專案，是典型的 MBA 後策略職，不是行銷執行。',
        '適合 MBA 剛畢業、或顧問想轉進品牌方策略端的人。面試打的牌是把一個模糊的成長問題結構化拆開的能力，不是產業年資。天花板看你能不能從「做分析」升級成「扛一條線的成長數字」；純顧問背景要小心被嫌只會做 deck、落不了地。',
      ],
      takeEn: [
        'LEGO opening an APAC Strategy Partner in Singapore is a clear signal: toy and entertainment brands are treating Asia-Pacific as the next growth battleground, and they want someone who can sit at the regional HQ and make calls with senior leadership. A role like this usually reports to a GM or CEO, working on market entry, growth questions and big cross-functional projects — a classic post-MBA strategy seat, not marketing execution.',
        'It fits a fresh MBA, or a consultant moving into a brand’s strategy side. The card you play in interviews is structuring a vague growth problem, not years in the industry. The ceiling is whether you can go from doing the analysis to owning a growth number; a pure-consulting background should watch out for being seen as deck-only and unable to land things.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=LEGO%20Strategy%20Partner%20APAC',
    },
    {
      org: 'Netflix',
      roleZh: '資深經理，市場經營（APAC）',
      roleEn: 'Senior Manager, Market Activation (APAC)',
      market: 'SG',
      metaZh: '新加坡 · 更新 7/10',
      metaEn: 'Singapore · updated 7/10',
      salaryZh: 'S$180k–300k+/年（推估；Netflix 薪酬偏高，含股票）',
      salaryEn: 'Est. S$180k–300k+/yr (Netflix pays high; incl. equity)',
      salarySources: [
        { label: 'Levels.fyi · Netflix', url: 'https://www.levels.fyi/companies/netflix/salaries' },
      ],
      takeZh: [
        'Netflix 在亞太找市場經營資深經理，是串流大戰進入「單一市場精耕」階段的訊號：內容備齊了，現在要把每個國家的訂閱和參與度一國一國催起來。這個位子偏商業和成長營運，工作是把全球策略落地到亞太各市場，講究數據感加執行力。',
        '適合有品牌、成長或顧問底、想進科技娛樂業做區域營運的人。要的不是純創意，是能把一個成長假設變成可跑的行動、再用數字證明它有效。股票和獎金是甜點，但 Netflix 節奏快、績效導向強、對「不留庸才」出了名，抗壓性不夠的人會很痛苦。',
      ],
      takeEn: [
        'Netflix hiring a Senior Manager for Market Activation in APAC signals the streaming war has moved into single-market cultivation: the content is there, now they lift subscriptions and engagement country by country. The seat leans commercial and growth-ops, landing global strategy into each APAC market, and it runs on data sense plus execution.',
        'It fits someone with a brand, growth or consulting base who wants regional ops in tech-entertainment. What it wants isn’t pure creative, it’s turning a growth hypothesis into a runnable plan and proving it with numbers. Equity and bonus are the sweetener, but Netflix is fast, performance-driven and famous for keeping only top performers — short on resilience and it hurts.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=Netflix%20Market%20Activation%20APAC',
    },
    {
      org: 'Meta',
      roleZh: '經濟政策經理，APAC',
      roleEn: 'Economic Policy Manager, APAC',
      market: 'SG',
      metaZh: '新加坡 · 更新 7/09',
      metaEn: 'Singapore · updated 7/09',
      salaryZh: 'S$180k–260k/年（推估；含股票）',
      salaryEn: 'Est. S$180k–260k/yr (incl. equity)',
      salarySources: [
        { label: 'Levels.fyi · Meta', url: 'https://www.levels.fyi/companies/facebook/salaries' },
      ],
      takeZh: [
        'Meta 在亞太設經濟政策經理，訊號是大型科技平台在監管壓力越來越大的環境下，需要一批懂經濟、又能跟政府和智庫對話的人來守政策這條線。這個職務交界在經濟研究和政府關係之間，做的是把平台的商業利益翻譯成政策語言，去影響法規怎麼寫。',
        '適合有經濟、政策、顧問或政府背景，想進科技巨頭做公共事務的人。打的牌是同時聽得懂商業和政策兩邊的話、再把它接起來。天花板高、影響力大，但要認清這是防守型職能：你的成就感來自擋掉風險、守住空間，不是做出一個產品。吃不吃這一套，投之前要想清楚。',
      ],
      takeEn: [
        'Meta setting up an Economic Policy Manager in APAC signals that under rising regulatory pressure, large tech platforms need people who understand economics and can hold a conversation with governments and think tanks to guard the policy line. The role sits between economic research and government relations, translating the platform’s commercial interests into policy language to shape how rules get written.',
        'It fits someone with an economics, policy, consulting or government background who wants public affairs at a tech giant. The card you play is hearing both the commercial and the policy side and connecting them. High ceiling, real influence — but be clear it’s a defensive function: your satisfaction comes from blocking risk and holding space, not from shipping a product. Whether that suits you is worth deciding before you apply.',
      ],
      url: 'https://www.linkedin.com/jobs/search/?keywords=Meta%20Economic%20Policy%20Manager%20APAC',
    },
  ],
};

export interface GreenJobsCopy {
  eyebrow: string;
  title: string;
  intro: string;
  updatedPrefix: string;
  weeklyTitle: string;
  weeklyEmpty: string;
  mbaTitle: string;
  mbaNote: string;
  employersLabel: string;
  boardsLabel: string;
  sourceNote: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  backToMri: string;
  marketNames: Record<MarketKey, string>;
}

export const greenJobsCopy: Record<Locale, GreenJobsCopy> = {
  'zh-TW': {
    eyebrow: '綠領職缺雷達',
    title: '亞太綠領職缺，一頁看清該去哪裡找。',
    intro:
      '我們不轉存、也不販售職缺。這頁把最值得盯的雇主和求職平台整理好，連結一律導向官方原始頁面，每週更新精選。',
    updatedPrefix: '更新於',
    weeklyTitle: '本週精選',
    weeklyEmpty: '本週精選整理中。訂閱《綠領情報》週刊，每週一收到當週 Top 10。',
    mbaTitle: 'MBA / 策略職',
    mbaNote: 'MBA 關鍵字掃到的策略、成長、政策職，跟綠領分開放。',
    employersLabel: '長期招募綠領的雇主',
    boardsLabel: '精選搜尋入口',
    sourceNote: '連結導向雇主官方頁或求職平台，職缺內容與薪資一律以原始頁面為準。',
    ctaTitle: '不確定自己該投哪一個？',
    ctaBody: '綠領 MRI 免費幫你把履歷對到市場缺口，三分鐘告訴你哪一類職缺最適合你、缺哪一塊。',
    ctaButton: '做一次綠領 MRI（免費）→',
    backToMri: '← 回到免費 MRI',
    marketNames: { SG: '新加坡', TW: '台灣', HK: '香港', UK: '英國' },
  },
  en: {
    eyebrow: 'Green-Collar Jobs Radar',
    title: 'APAC green-collar jobs — one page for where to actually look.',
    intro:
      'We don’t re-host or resell listings — this page curates the employers and job boards worth watching, and every link points to the original source. Picks refresh weekly.',
    updatedPrefix: 'Updated',
    weeklyTitle: 'This week’s picks',
    weeklyEmpty: 'This week’s picks are being curated. Subscribe to Green-Collar Intel Weekly to get the Top 10 every Monday.',
    mbaTitle: 'MBA / strategy track',
    mbaNote: 'Strategy, growth and policy roles from the MBA keyword, kept separate from green-collar.',
    employersLabel: 'Employers hiring green-collar consistently',
    boardsLabel: 'Curated search entry points',
    sourceNote: 'Links point to employer pages or job boards; listing details and salaries are per the original source.',
    ctaTitle: 'Not sure which one to go for?',
    ctaBody: 'The green-collar MRI maps your CV to the market gap for free — three minutes to see which roles fit you and what’s missing.',
    ctaButton: 'Take the green-collar MRI (free) →',
    backToMri: '← Back to the free MRI',
    marketNames: { SG: 'Singapore', TW: 'Taiwan', HK: 'Hong Kong', UK: 'United Kingdom' },
  },
};
