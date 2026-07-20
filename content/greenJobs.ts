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
  boards: JobLink[]; // real, public search entry points (constructed, not scraped)
}

export interface SalarySource {
  label: string;
  labelEn?: string; // shown on /en; falls back to label (fine for proper names like Glassdoor)
  url: string; // internal links are locale-less ('/salary-report'); the renderer prefixes the locale
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
  // Only meaningful when salarySources is non-empty — tells the renderer which
  // header to show, so a Tier-1 disclosed figure never gets labelled "estimated"
  // and a future Tier-13 cross-jurisdiction reference price never does either
  // (see SKILL.md rule 13). Undefined + non-empty sources falls back to 'estimated'
  // for backward compatibility with older picks written before this field existed.
  salaryConfidence?: 'disclosed' | 'estimated' | 'reference';
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
  updatedAt: '2026-07-19',
  markets: [
    {
      key: 'SG',
      boards: [
        { label: 'LinkedIn · sustainability', url: 'https://sg.linkedin.com/jobs/sustainability-jobs' },
        { label: 'JobStreet · ESG', url: 'https://sg.jobstreet.com/ESG-jobs' },
        { label: 'MyCareersFuture · sustainability', url: 'https://www.mycareersfuture.gov.sg/search?search=sustainability&sortBy=new_posting_date' },
      ],
    },
    {
      key: 'TW',
      boards: [
        { label: '104 · 永續', url: 'https://www.104.com.tw/jobs/search/?keyword=%E6%B0%B8%E7%BA%8C' },
        { label: '104 · ESG', url: 'https://www.104.com.tw/jobs/search/?keyword=ESG' },
        { label: 'Indeed · ESG', url: 'https://tw.indeed.com/q-esg-%E8%81%B7%E7%BC%BA.html' },
      ],
    },
    {
      key: 'HK',
      boards: [
        { label: 'JobsDB · environmental', url: 'https://hk.jobsdb.com/environmental-jobs' },
        { label: 'LinkedIn · sustainability', url: 'https://hk.linkedin.com/jobs/sustainability-jobs' },
      ],
    },
    {
      key: 'UK',
      boards: [
        { label: 'LinkedIn · sustainability', url: 'https://uk.linkedin.com/jobs/sustainability-jobs' },
        { label: 'Indeed · sustainability & ESG', url: 'https://uk.indeed.com/q-sustainability-esg-jobs.html' },
      ],
    },
  ],
  // Human-approved weekly shortlist. DRAFT for Michael's review — sources:
  // his LinkedIn job-alert emails (SG/HK/UK, 7/11–7/19). TW excluded per
  // 2026-07-19 policy (see scheduled-tasks/green-jobs-weekly/SKILL.md).
  // Commentary follows docs/job-pick-playbook.md. Salaries only shown where
  // Tier 1 (disclosed on posting) or Tier 2 (named company/location data,
  // cross-checked) — everything else says "not disclosed" rather than guess.
  // All 9 links verified live and all JDs verified against the primary
  // posting (not a search summary) on 2026-07-19.
  weeklyPicks: [
    {
      org: 'Bank of Singapore, Asia’s Global Private Bank',
      roleZh: '永續夥伴專員（AVP/VP）',
      roleEn: 'Sustainability Partners Specialist (AVP/VP)',
      market: 'SG',
      metaZh: '新加坡 · AVP/VP · 更新 7/17',
      metaEn: 'Singapore · AVP/VP · updated 7/17',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這缺不是研究職，是 OCBC 集團在幫私人銀行補「永續怎麼落地到客戶資產配置」這一塊。私人銀行這幾年被推著要有講得出口的永續主張，這讀起來不像是監管推的，比較像超高淨值家族自己在要求，尤其是接班的二代，他們對錢要投去哪裡開始有立場，家族辦公室也會直接拿 ESG 框架來問。這職位掛在 CIO Office 底下，做的是把永續包裝成能對客戶說清楚、經得起追問的產品與論述，不是寫報告書。',
        '適合已經做過 ESG 研究、又聽得懂私人銀行語言的人，純分析師背景會卡在不知道怎麼把框架翻成一個 5000 萬新幣的家族要聽的話。面試該帶的是你怎麼把一套 ESG 邏輯講成客戶聽得懂、也願意動錢的故事，不是背了幾個框架。代價要先想清楚：這是 CIO Office 裡的支援與治理職，不是前線 RM，獎金天花板比真的在管錢、在跑業績的人低很多，你換到的是話語權，不是最高的那個數字。',
      ],
      takeEn: [
        'This isn’t a research seat — OCBC Group is building out the function that translates sustainability into actual client portfolio construction inside private banking. Private banks have been pushed toward a credible sustainability proposition, and this reads less like a regulatory push than ultra-high-net-worth families themselves driving it, especially next-gen heirs who now have opinions on where money goes, and family offices that show up with an ESG framework and hard questions. Sitting in the CIO Office, this role packages sustainability into something that survives client scrutiny, not a report.',
        'It fits someone who has done ESG research and can also speak private-banking language — a pure analyst background stalls at not knowing how to translate a framework into what a S$50M family actually wants to hear. Bring, in the interview, a story of turning ESG logic into something a client understood and acted on, not a list of frameworks memorised. Price the cost first: this is a support-and-governance seat inside CIO Office, not a front-line RM job — the bonus ceiling sits well below people actually running client money, so what you’re buying is a voice in the room, not the top number.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4414204287',
    },
    {
      org: 'BlackRock (Decarbonization Partners)',
      roleZh: '投資分析師，減碳夥伴投資平台',
      roleEn: 'Investment Analyst, Decarbonization Partners',
      market: 'SG',
      metaZh: '新加坡 · 分析師級 · 更新 7/17',
      metaEn: 'Singapore · analyst level · updated 7/17',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'Decarbonization Partners 是淡馬錫跟 BlackRock 合資的平台，這一點決定了這個分析師缺的份量。它投的是後期創投跟成長股權，標的是儲能、電網、次世代再生能源、電動車這種已經有真實資產負債表的公司，不是早期氣候科技賭注。訊號是：減碳投資已經走過「早期押注」階段，進到「主權財富規模的成長股權交易」階段，而新加坡會是這個平台的亞太錨點，因為淡馬錫本身就是共同發起人，不是單純一個地區辦公室。',
        '適合投銀、私募、成長股權或基建背景、對減碳有真實興趣的人，單純「關心環境」但沒做過財務建模、沒經歷過投資委員會流程的人接不住。這是全流程分析師職，從盡職調查到 IC 備忘錄到投後都要碰。面試該帶一個你算過數字的減碳子產業論點，不是一句「我很在乎氣候」。代價是：你是兩個巨頭合資平台裡的分析師，職涯路徑跟這個 JV 未來怎麼被兩邊股東重新設計綁在一起，不是你一個人能完全掌控的變數，而且淡馬錫這種利害關係人的溝通強度，新加坡的工時不會輕。',
      ],
      takeEn: [
        'Decarbonization Partners is a Temasek–BlackRock joint venture, and that fact sets the weight of this analyst seat. It invests in late-stage venture and growth equity — storage, grid, next-gen renewables, EV — companies with real balance sheets, not early climate-tech bets. The signal: decarbonization investing has moved past early-stage wagers into sovereign-wealth-scale growth-equity dealmaking, and Singapore is the platform’s APAC anchor because Temasek is a co-sponsor, not just a regional office.',
        'It fits someone from investment banking, private equity, growth equity or infrastructure with genuine interest in decarbonization — “caring about the environment” without financial-modeling reps or IC-process exposure won’t hold this. It’s a full-lifecycle analyst seat: due diligence, IC memos, portfolio monitoring. Bring, in the interview, a decarbonization sub-sector thesis with numbers you actually ran, not a line about caring. The cost: you’re an analyst inside a two-sponsor JV, so your career path is tied to how both shareholders reshape the platform over time, not something you fully control — and stakeholder management with Temasek means Singapore hours won’t be light.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4432484447',
    },
    {
      org: 'South Pole',
      roleZh: '合規碳市場資深主管',
      roleEn: 'Senior Lead, Compliance Carbon Markets',
      market: 'SG',
      metaZh: '新加坡 · 資深 · 更新 7/15',
      metaEn: 'Singapore · senior · updated 7/15',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'JD 明講要「維持跟亞洲各國環境部的關係」「追蹤政策趨勢」，還要「透過政府接觸找出商業機會」——這讀起來像 South Pole（全球最大的碳權開發與碳市場服務商之一）把「懂政府在想什麼、政策怎麼走」直接當成商業情報在用，不是單純賣碳權。要 6 年以上碳市場經驗，又要政治學或環境經濟學背景，還要懂亞洲各國環境部，這個組合讀起來像：公司在押注「合規碳市場」(政府強制那種，不是常被質疑漂綠的自願性碳權市場)會是接下來的成長線，政府關係就是能不能提前卡位的關鍵。',
        '適合同時懂政策分析跟碳市場商業邏輯的人，純學術政策背景接不住「識別商業機會」這塊，純商業背景也接不住要跟環境部打交道的深度。面試該帶一個你實際追蹤過的政策轉折、你怎麼提前判斷出來的，不是背誦碳市場架構。代價要認清：職缺沒揭露薪資，而且「政府關係」型職位的產出很難量化，考核標準通常比業務職模糊，升遷路徑也不如純交易或投資職清楚。',
      ],
      takeEn: [
        'The JD states plainly: maintain relationships with Asian environment ministries, track policy trends, identify business opportunities through government engagement — this reads like South Pole, one of the world’s largest carbon-credit developers and market-services firms, treating “knowing what governments are thinking” as commercial intelligence in its own right, not just credit sales. Requiring 6+ years in carbon markets plus a political-science or environmental-economics background plus expertise with Asian environment ministries reads like a bet that compliance carbon markets (the government-mandated kind, not the voluntary credits market that keeps drawing greenwashing scrutiny) are the next growth line, with government relationships as the way to get there early.',
        'It fits someone who can hold both policy analysis and carbon-market commercial logic — a pure academic-policy background won’t carry “identify business opportunities,” and a pure commercial background won’t carry the depth needed to engage environment ministries. Bring, in the interview, a specific policy shift you tracked and how you called it early, not a recitation of carbon-market frameworks. Price the cost: no salary disclosed, and “government relations” output is hard to quantify — review criteria tend to run vaguer than a sales role, and the promotion path is less clear than a pure trading or investment seat.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4422424737',
    },
    {
      org: 'Berge Bulk (Kibo Invest)',
      roleZh: '投資主管，氣候與能源轉型',
      roleEn: 'Head of Investments (Climate and Energy Transition)',
      market: 'SG',
      metaZh: '新加坡 · 主管級 · 更新 7/13',
      metaEn: 'Singapore · head level · updated 7/13',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'Berge Bulk 是全球最大的乾散貨航運公司之一，散貨航運本身是碳排大戶。JD 寫明這個位子掛在姊妹公司 Kibo Invest 底下，同時管「多資產投資組合優化」跟「氣候科技與能源轉型投資策略」——這讀起來像一家傳統航運巨頭，正透過獨立的投資公司，把本業賺的錢轉去押注氣候科技與能源轉型，是重資產、高排放產業常見的「用本業現金流投資轉型科技」打法，不是航運公司自己要轉型，而是拿獲利去別處下注。',
        '要 10 年以上機構投資經驗、做過退出、真的懂氣候科技或再生能源加 APAC 市場，還要 CFA、CA 或頂尖 MBA 學歷門檻——這是給履歷已經很硬的人的位子，不是轉職跳板。面試該帶一筆你實際盤到退出的投資案，不是「對氣候科技有熱情」這種話。代價要認清：公司主體是散貨航運，如果航運景氣循環下行，姊妹公司的投資預算跟人力配置很可能被連動影響，這不是一個跟航運景氣脫鉤的獨立職位。',
      ],
      takeEn: [
        'Berge Bulk is one of the world’s largest dry-bulk shipping companies, and dry-bulk shipping is itself a heavy emitter. The JD states this seat sits at sister company Kibo Invest, holding both “multi-asset portfolio optimization” and “climate tech and energy transition investment strategy” — this reads like a traditional shipping giant channeling its core-business profits, through an arm’s-length investment vehicle, into climate-tech and energy-transition bets: the classic heavy-asset, high-emissions-industry play of investing core cash flow into transition technology, not the shipping business transitioning itself.',
        'It requires 10+ years of institutional investment experience, a track record through exit, real climate-tech or renewable-energy experience plus APAC exposure, and a CFA, CA, or top-tier MBA — this is a seat for an already-strong CV, not a career pivot. Bring, in the interview, a specific investment you actually took through exit, not enthusiasm for climate tech. Price the cost: the parent business is dry-bulk shipping, so if the shipping cycle turns down, the sister investment vehicle’s budget and headcount can move with it — this isn’t a seat decoupled from shipping’s cycle.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4439114453',
    },
    {
      org: 'Macquarie Group',
      roleZh: '董事總經理，亞洲基礎建設',
      roleEn: 'Managing Director, Infrastructure Asia',
      market: 'HK',
      metaZh: '香港 · 董事總經理 · 更新 7/15',
      metaEn: 'Hong Kong · Managing Director · updated 7/15',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這不是管一個現成基金，是要從香港把整個亞洲基建版圖建起來，插旗印度、南韓、東南亞。兩條主力賽道是電力與公用事業(能源轉型)跟數位基建(資料中心、光纖網路)，等於 Macquarie 把 AI 熱潮拉高的用電需求跟亞洲能源轉型，當成同一筆生意在做。訊號是：全世界最大的基建投資者之一，把「AI 用電」跟「亞洲淨零」兩件事合併成一個賽道級的機會，而且要的是能把生意做出來的人，不是做交易執行的人。',
        '適合已經是 MD 級、在多個亞洲市場真的有人脈、有從零建立過一個單位或業務線紀錄的人，低一階的人接不住，因為這職缺考的是「你建過 franchise 嗎」，不是「你做過多少案子」。面試該帶一個你從零做起、算得出 AUM 或營收成果的案例，不是交易執行的英雄故事。代價很直接：這是高風險高報酬的建業務型職務，通常兩三年內就要看得到營收，市場沒起來，職務範圍或人事都可能被重新設計，薪資結構是基本盤加大額獎金，淡季會很有感，而且職缺本身沒揭露薪資數字。',
      ],
      takeEn: [
        'This isn’t running an existing fund — it’s building Macquarie’s entire Asia infrastructure franchise from Hong Kong, planting flags in India, South Korea and Southeast Asia. The two lead sectors are power and utilities (energy transition) and digital infrastructure (data centers, fiber), meaning one of the world’s largest infrastructure investors is treating AI’s rising power demand and Asia’s energy transition as the same trade. The signal: this pairing has become a franchise-scale opportunity, and the mandate wants someone who can build the business, not just execute deals.',
        'It fits someone already at MD level with real relationships across multiple Asian markets and a track record of building or scaling a unit from scratch — a rung below and you can’t carry this, because the bar is “have you built a franchise,” not “how many deals have you closed.” Bring, in the interview, something you built from zero with a real AUM or revenue outcome, not deal-execution war stories. The cost is direct: this is a high-risk, high-reward build mandate typically judged on revenue within two to three years, scope or headcount can be redesigned if the market doesn’t show up, pay is base-plus-large-bonus so a slow year bites, and no salary figure is disclosed on the posting itself.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4429859348',
    },
    {
      org: 'Societe Generale',
      roleZh: '副總裁，能源加集團暨電池礦業產業',
      roleEn: 'Vice President, Energy Plus Group & Battery, Mining and Industries',
      market: 'HK',
      metaZh: '香港 · VP · 更新 7/13',
      metaEn: 'Hong Kong · VP · updated 7/13',
      salaryZh: 'HK$0.9M–1.3M/年（總薪酬，Glassdoor 現頁估算；該公司該地區該職級具名數據）',
      salaryEn: 'Est. HK$0.9M–1.3M/yr total pay (per Glassdoor’s current company- and location-specific page)',
      salarySources: [
        { label: 'Glassdoor · SocGen VP Hong Kong', url: 'https://www.glassdoor.com.hk/Salary/Soci%C3%A9t%C3%A9-G%C3%A9n%C3%A9rale-Vice-President-Hong-Kong-Salaries-EJI_IE10350.0,16_KO17,31_IL.32,41_IC2308631.htm' },
      ],
      salaryConfidence: 'estimated',
      takeZh: [
        'JD 寫得很白：要中國客戶與交易經驗、要能跟中國國企或創辦人主導的公司打交道、要中英雙語。這是一家法國銀行在香港蓋一張專門服務中國資金、投向電池、礦業、潔淨科技這些硬資產的結構融資桌。訊號是：歐系銀行正在把香港辦公室，定位成專門承接「中國資本流向全球減碳相關硬資產」這條線，不是單純做境內中國業務，而是做境外部署。',
        '適合有真正中國客戶起源經驗、懂結構性融資與信用、中文流利到能談判的人，泛 ESG 銀行背景但沒做過中國客戶起源的人卡不進門檻。面試該帶你實際主導或支援過的一筆中國相關結構融資案，講清楚你的國企或創辦人關係網。代價要認清：這是地緣政治曝險很高的位子，中國資金流向電池、礦業這種被美中供應鏈競爭盯上的領域，制裁風險跟銀行對中國對手風險偏好隨時在變；而且是 VP 不是 MD，薪資紮實但不是市場天花板，要等升遷才會摸到。',
      ],
      takeEn: [
        'The JD says it plainly: China client and transaction experience, comfort dealing with Chinese SOEs or founder-led companies, Mandarin and English fluency. A French bank is building a Hong Kong structured-finance desk specifically to serve Chinese capital moving into batteries, mining and clean-tech hard assets. The signal: European banks are positioning Hong Kong desks to capture the line where Chinese capital flows into decarbonization-adjacent hard assets globally, not domestic PRC business but offshore deployment.',
        'It fits someone with real China client-origination experience, structured-finance and credit chops, and Mandarin fluent enough to negotiate — a generalist ESG banking background without China origination reps won’t clear the bar. Bring, in the interview, a China-linked structured deal you led or supported and be specific about your SOE or founder-network relationships. Price the cost: this is a geopolitically exposed seat — Chinese capital into batteries and mining sits right where US-China supply-chain competition and sanctions risk shift constantly, and bank risk appetite toward Chinese counterparties can move fast; it’s VP not MD, so pay is solid but not top-of-market until you’re promoted.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4411646644',
    },
    {
      org: 'Waymo',
      roleZh: '永續專案，合規',
      roleEn: 'Sustainability Programs, Compliance',
      market: 'UK',
      metaZh: '英國倫敦 · 中高階 · 更新 7/18',
      metaEn: 'London, UK · mid-senior · updated 7/18',
      salaryZh: '£88,000–92,500/年（職缺自己揭露）',
      salaryEn: '£88,000–92,500/yr (disclosed on the posting itself)',
      salarySources: [
        { label: 'LinkedIn 職缺揭露薪資', url: 'https://www.linkedin.com/jobs/view/4441395718' },
      ],
      salaryConfidence: 'disclosed',
      takeZh: [
        'Waymo(Alphabet 旗下自駕車公司)在倫敦開一個永續合規職，訊號是自駕車／機器人計程車業務規模化到需要單獨面對美國以外的環境法規體系(英國、歐盟這一套)，而且職缺裡提到「清潔能源與生命週期管理」，代表管的不只是文件合規，還碰車隊層級的能源與電池生命週期。這種職缺在純自駕車公司裡很少見，通常掛在母公司 Alphabet 層級，Waymo 自己開一個合規專職，等於在說「我們現在被當成一個獨立受監管的實體」。',
        '適合有環境合規、受監管產業(公用事業、航空、汽車)背景、能把多國標準翻成一份可執行內部合規計畫的人，單純「喜歡永續」接不住，20 到 25% 的出差比例代表這不是純辦公室職務，要真的下場碰營運。面試該帶一個你從一堆國際標準裡，實際組出一套合規計畫的案例。天花板：薪資揭露透明、倫敦水準算紮實，但比起 Waymo 核心自駕技術職還是低一截；而且這是這個快速擴張的業務單位裡第一批這類職缺，職務範圍很可能隨 Waymo 國際策略調整而重新定義。',
      ],
      takeEn: [
        'Waymo (Alphabet’s autonomous-vehicle unit) opening a sustainability compliance seat in London signals the robotaxi business has scaled to the point it needs to answer to environmental regulatory regimes beyond the US — UK and EU frameworks — and the listing’s mention of “clean energy and lifecycle management” means this touches fleet-level energy and battery lifecycle, not just paperwork. This kind of role is rare at a pure-play AV company, where sustainability headcount usually sits at the parent-company level — Waymo staffing its own dedicated compliance hire is a tell it’s now treated as a standalone regulated entity.',
        'It fits someone from environmental compliance in a regulated industry — utilities, aviation, auto — who can translate multi-jurisdiction standards into an actionable internal plan; “enthusiastic about sustainability” alone won’t carry it, and the 20–25% travel requirement signals real operational engagement, not a desk job. Bring, in the interview, an example of building a compliance program out of a patchwork of international standards. The ceiling: pay is disclosed and solid for London, but still a step below Waymo’s core AV engineering roles, and as one of the first roles of its kind in a fast-scaling unit, the mandate itself will likely get redefined as Waymo’s international strategy evolves.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4441395718',
    },
    {
      org: 'CarbonChain',
      roleZh: '合作夥伴總監',
      roleEn: 'Partnerships Director',
      market: 'UK',
      metaZh: '英國倫敦 · 總監級,首任 · 更新 7/13',
      metaEn: 'London, UK · director level, inaugural role · updated 7/13',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'CarbonChain 是幫重工業(金屬、礦業、能源)大宗商品供應鏈做碳會計軟體的公司，第一次開合作夥伴總監這個位子，訊號很清楚：產品已經靠直接銷售驗證過市場，現在要透過四大會計師事務所跟 Accenture 這種全球系統整合商去衝規模，這是氣候科技廠商從「產品跟市場對上了」走到「透過通路衝規模」的經典訊號。反過來看也是訊號：四大跟 Accenture 想把碳會計軟體包進自己的減碳顧問服務裡去轉售，而不是自己從頭做。',
        '適合真的從零建立過夥伴銷售管線、跟四大或系統整合商談過合作的人，不是「跟夥伴合作過」這種泛泛經驗接得住，JD 明講要「一年 100 萬美元以上的夥伴帶來的管線」這種硬指標。面試該帶你具體的管線數字跟你建立的那段顧問公司關係，這就是門檻本身。代價：職缺沒揭露薪資，這是新創第一個這種職位，內部沒有現成打法，薪資結構通常底薪不高、佣金或認股權占比重，而且成不成，取決於四大到底想不想真的跟你合作，執行風險還沒被驗證過。',
      ],
      takeEn: [
        'CarbonChain builds carbon-accounting software for heavy-industry commodity supply chains — metals, mining, energy — and is hiring its first-ever partnerships leader. The signal is clear: the product has already been validated through direct sales, and now it needs to scale distribution through Big 4 firms and global systems integrators like Accenture — the classic sign a climate-tech vendor is moving from product-market fit to go-to-market scale. Read the other way, it also signals Big 4 and Accenture want to resell carbon-accounting software bundled into their own decarbonization consulting rather than build it themselves.',
        'It fits someone who has actually built partner-sourced pipeline from scratch with named consultancies — “worked with partners” in general won’t clear the bar; the JD states the hard number outright: $1M+ in annual partner-sourced pipeline. Bring, in the interview, your specific pipeline figure and the named consultancy relationship you built — that is the bar itself. The cost: no salary disclosed, this is the startup’s first role of its kind with no internal playbook yet, pay typically runs lower base with heavier commission or equity, and whether it works depends on whether the Big 4 actually want to partner — the execution risk here hasn’t been proven yet.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4439578740',
    },
    {
      org: 'Airwallex',
      roleZh: '社會影響力資深經理',
      roleEn: 'Senior Manager, Social Impact',
      market: 'UK',
      metaZh: '英國倫敦 · 資深經理,首任職能 · 更新 7/12',
      metaEn: 'London, UK · senior manager, inaugural function · updated 7/12',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'JD 自己講得很白：這是「zero to one」、「startup within a startup」——代表 Airwallex(跨境支付獨角獸)現在才正式建立社會影響力這個職能，不是補強一個既有團隊。職責橫跨對外(非營利、社會企業的平台採用)跟對內(捐贈策略、志工計畫、ESG)，這讀起來像：一家快速成長的金融科技公司準備要有一套說得出口的社會責任敘事，可能是為了未來機構投資人盡職調查，也可能是為了跟監管機構打交道時有籌碼——JD 沒明講原因，但「現在才開始建」這件事本身就是訊號。',
        '適合真的跨過企業與影響力兩邊、待過快節奏環境、又能自己把一個新職能從零生出來的人，單純的 CSR 執行者接不住「zero to one」這個要求。面試該帶一個你從零建立過的職能或專案，不是你維護過一個現成方案的經驗。代價要先想清楚：這是新職能，沒有內部前例可循，考核標準跟資源都可能還在摸索，如果公司優先序一變，這種新設的軟職能常常是第一個被砍預算的，職缺本身也沒揭露薪資。',
      ],
      takeEn: [
        'The JD says it plainly: this is “zero to one,” “a startup within a startup” — meaning Airwallex, the cross-border payments unicorn, is only now formally building a social-impact function, not reinforcing an existing team. The remit spans external (platform adoption among nonprofits and social enterprises) and internal (giving strategy, volunteering, ESG) — this reads like a fast-growing fintech preparing a credible social-responsibility narrative, possibly for future institutional-investor diligence, possibly as leverage in regulatory conversations. The JD doesn’t say why, but the fact that it’s only being built now is itself the signal.',
        'It fits someone who has genuinely crossed between corporate and impact work, operated in fast-paced environments, and can generate a new function from scratch — a pure CSR-execution profile won’t carry a “zero to one” mandate. Bring, in the interview, a function or project you built from nothing, not experience maintaining an existing program. Price the cost: this is a new function with no internal precedent, so review criteria and resourcing are likely still being worked out, and newly created soft functions like this are often first to lose budget if company priorities shift; no salary is disclosed on the posting either.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4400177866',
    },
  ],
  // MBA / strategy track — emptied 2026-07-20. The 3 prior entries (LEGO,
  // Netflix, Meta; 7/09–7/10) all failed the current standard on inspection:
  // `url` pointed at a LinkedIn *search query*, not a real postable job page
  // (fails "link must lead back to an actual application"); salary was a
  // generic company-wide/city-level aggregate (exactly the Tier-3 pattern
  // rule 2 in SKILL.md bans); and Netflix/Meta are the literal examples the
  // MBA-keyword rule names as roles to filter out (no genuine sustainability/
  // climate/impact angle) — LEGO didn't have one either. Rather than patch
  // 3 unfit entries, the array is empty until a future weekly run sources and
  // verifies real MBA-track picks under the same rules as weeklyPicks (14-day
  // freshness, WebFetch-verified JD + link, salary Tier 1/2/MCF/reference-price
  // only). The page hides this section entirely when the array is empty — no
  // broken "empty state" to fix.
  mbaPicks: [],
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
    boardsLabel: 'Curated search entry points',
    sourceNote: 'Links point to employer pages or job boards; listing details and salaries are per the original source.',
    ctaTitle: 'Not sure which one to go for?',
    ctaBody: 'The green-collar MRI maps your CV to the market gap for free — three minutes to see which roles fit you and what’s missing.',
    ctaButton: 'Take the green-collar MRI (free) →',
    backToMri: '← Back to the free MRI',
    marketNames: { SG: 'Singapore', TW: 'Taiwan', HK: 'Hong Kong', UK: 'United Kingdom' },
  },
};
