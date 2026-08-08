import type { Locale } from '@/lib/constants';

/**
 * 綠領職缺雷達 (Green-Collar Jobs Radar) — a curated launchpad, NOT a scraped feed.
 * We never re-host or resell listings: every link points to an employer's own
 * page or a public job board's search. `weeklyPicks` is a small, human-approved
 * shortlist (empty is fine — the page then nudges the newsletter).
 *
 * Data is language-neutral (orgs, URLs); chrome/labels live in `greenJobsCopy`.
 *
 * THE FIELD IS STILL CALLED `weeklyPicks`, THE COPY NO LONGER IS (2026-08-08
 * freshness audit). The reader-facing strings used to say 「本週精選」 and "Picks
 * refresh weekly" while the pick set had not moved since 07-28, so the page was
 * dating itself wrong on its own front. What the page now shows is `updatedAt`
 * plus 「最後更新於」, which is true at whatever cadence the sweep actually runs.
 * The field name is left alone on purpose: renaming it would touch the scheduled
 * pipeline that writes this file, for no reader-visible gain.
 */
/**
 * 「更新於」單獨存在時,讀者只知道它有多舊,不知道還要不要再回來(2026-08-09,
 * 鐵律 5 要求兩者都給)。所以現在也印下次更新——但只在管線真的在跑的時候。
 *
 * 掃描線是每日 10:40 的 green-jobs-daily。給到 3 天是因為它自己就會因為工作區
 * 不乾淨而中止,連兩天不動屬正常;連三天不動就是壞了。壞掉的時候頁面**不改口
 * 也不報警,單純不再承諾**——只留日期,讓讀者自己判斷。承諾一個沒在跑的節奏,
 * 比什麼都不承諾更傷:那正是 07-28 那批在頁面上寫著「本週精選」躺了 11 天的事故。
 */
export const JOBS_SWEEP_TOLERANCE_DAYS = 3;

/** 掃描線是否仍在節奏上;false 時 `nextUpdate` 那句不得渲染。 */
export function isJobsSweepOnSchedule(updatedAt: string, now: Date = new Date()): boolean {
  const updated = new Date(`${updatedAt}T00:00:00+08:00`).getTime();
  if (Number.isNaN(updated)) return false;
  const ageDays = (now.getTime() - updated) / 86_400_000;
  return ageDays >= 0 && ageDays <= JOBS_SWEEP_TOLERANCE_DAYS;
}

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
  updatedAt: '2026-07-28',
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
  // Human-approved weekly shortlist. Curated 2026-07-26 (Sunday run), approved
  // by Michael 2026-07-28. Sources: his LinkedIn job-alert emails (SG/HK/UK,
  // 7/19–7/24 window) + MyCareersFuture cross-checks. TW excluded per 2026-07-19
  // policy (see scheduled-tasks/green-jobs-weekly/SKILL.md). Commentary follows
  // docs/job-pick-playbook.md. All 9 picks salary-undisclosed: no posting
  // discloses a band, the 3 SG picks have no same-company-same-title match on
  // MyCareersFuture (rule 12), and the 2 UK picks have no comparable posting in
  // a US mandatory-disclosure jurisdiction (rule 13) — so every salary field is
  // honestly blank rather than guessed. All JDs verified against the primary
  // posting page and all links re-verified by the independent rule-14 audit at
  // upload time (2026-07-28).
  weeklyPicks: [
    // ── 🇸🇬 SG ──────────────────────────────────────────────────────────────
    {
      org: 'Temasek',
      roleZh: '永續策略助理副總裁（政策與洞察）',
      roleEn: 'Assistant Vice President, Sustainability Strategy (Policy & Insights)',
      market: 'SG',
      metaZh: '新加坡 · AVP · 掛出 7/22',
      metaEn: 'Singapore · AVP · posted 7/22',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺掛在 Temasek 的 Sustainability Strategy 團隊、直接匯報 Director of Sustainability Strategy，JD 的核心動作是 horizon scanning：掃全球永續政策、法規、框架與市場趨勢，再把它 distill 成給領導層與投資團隊的可行建議。這讀起來是主權基金的政策情報職，離報告撰寫很遠，要的是能跨 climate、nature、social 三條 workstream 把外部訊號翻成內部決策輸入的人。訊號是 Temasek 這個月在永續線連開多個缺，而這筆開到 AVP 級、還明列要 partner 投資團隊，讀起來像永續政策正在往投資決策桌靠。',
        '適合真的做過政策或法規分析、又聽得懂投資語言的人；JD 要最低 8 年永續政策、策略或法規分析經驗，只做過企業永續報告的人接不住這個「翻譯給投資團隊聽」的要求。面試別談理念，帶一段你把某條新法規翻成具體投資或營運動作的實例，講你怎麼判斷哪些訊號值得升級到領導層。代價講在前面：薪資未揭露、MCF 查無此缺；掛出沒多久已約 200 人申請，是熱缺；而且 horizon scanning 是幕僚職，影響力靠說服投資團隊採納，不是自己下決策。',
      ],
      takeEn: [
        'This seat sits in Temasek’s Sustainability Strategy team, reporting to the Director of Sustainability Strategy, and the JD’s core verb is horizon scanning: scan global sustainability policy, regulation, frameworks and market trends, then distill them into actionable recommendations for leadership and investment teams. It reads less like a reporting job and more like a sovereign-fund policy-intelligence seat — one that turns external signal into internal decision input across climate, nature and social workstreams. The signal: Temasek posted several sustainability roles this month, and this one opening at AVP level while explicitly partnering investment teams reads like sustainability policy moving closer to the investment table.',
        'It fits someone who has genuinely done policy or regulatory analysis and speaks the language of investment; the JD asks for a minimum of 8 years in sustainability policy, strategy or regulatory analysis, and a reporting-only background will not hold the “translate for the investment team” demand. Skip the conviction speech — bring one example of turning a new regulation into a concrete investment or operating action, and how you decide which signals deserve to be escalated to leadership. Costs upfront: salary undisclosed, nothing on MyCareersFuture; roughly 200 applicants already, so it is hot; and horizon scanning is a staff role — your leverage is persuading the investment team to adopt, not making the call yourself.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4421999859',
    },
    {
      org: 'HP',
      roleZh: '永續與合規計畫經理',
      roleEn: 'Sustainability and Compliance Program Manager',
      market: 'SG',
      metaZh: '新加坡 · 計畫經理 · 掛出 7/23',
      metaEn: 'Singapore · program manager · posted 7/23',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺是把「永續」放進產品工程的位子，不是企業 CSR。JD 的核心是 Design-for-Environment：用環境要求去定義並落實 DfE 目標、在產品設計決策點上找環境改善機會、追蹤環境目標進度、還要 lead 產品合規策略去滿足全球法規與自願性要求。這讀起來像硬體公司把「產品要能賣進各地市場」的環境合規壓力，變成一個橫跨設計與法遵的常設職能。訊號是連消費電子大廠都把產品環境合規做成專職 program manager，而不是丟給外部顧問。',
        '適合工程或環境科學底、又懂產品開發節奏的人；JD 要 3 年以上產品合規、永續或工程經驗，學歷點名工程、材料或環境科學，純永續報告背景會發現這裡談的是產品規格不是揭露書。面試帶一個你實際推動過的產品環境改善，或講一條你熟的法規（能耗、材料限制、回收）怎麼牽動設計決策。代價：這是 program manager 執行層、要跨設計與法遵兩邊協調；薪資未揭露、MCF 查無此缺。',
      ],
      takeEn: [
        'This role puts “sustainability” inside product engineering, not corporate CSR. The JD’s core is Design-for-Environment: apply environmental requirements to define and implement DfE goals, find environmental-improvement opportunities at product-design decision points, track progress against environmental targets, and lead product-compliance strategies to meet global regulatory and voluntary requirements. It reads like a hardware company turning the pressure of “our products must be sellable into every market” into a standing function that straddles design and compliance. The signal: even a consumer-electronics major now staffs product environmental compliance as a dedicated program manager rather than outsourcing it.',
        'It fits an engineering or environmental-science background that understands product-development cadence; the JD asks for 3+ years in product compliance, sustainability or engineering, and names engineering, materials or environmental science degrees — a reporting-only sustainability background will find this is about product specs, not disclosure documents. Bring one product environmental improvement you actually drove, or explain how one regulation you know (energy, material restrictions, recycling) moves design decisions. Cost: this is an execution-layer program-manager seat coordinating across design and compliance; salary undisclosed, nothing on MyCareersFuture.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4444421271',
    },
    {
      org: 'UOB',
      roleZh: '資料分析經理（集團批發銀行）',
      roleEn: 'Manager, Data Analytics, Group Wholesale Banking',
      market: 'SG',
      metaZh: '新加坡 · 經理 · 掛出 7/23',
      metaEn: 'Singapore · manager · posted 7/23',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺表面是數據分析師，但 JD 明寫要 support「sector-specific 與 ESG analytics」的開發與交付、跟 ESG stakeholders 一起釐清分析需求，還要試 GenAI 驅動的分析自動化。這讀起來像批發銀行把 ESG 數據從人工整理，推進到工程化、可重複產出的階段：ESG 是它幾條 sector analytics 之一，不是全部，但已經被寫進核心職責而不是點綴。訊號是銀行端的 ESG 工作正在「資料工程化」，需要的是會寫 code 的人，不只是懂框架的人。',
        '適合會 Python、SQL、又聽得懂 ESG 語彙的資料人：JD 要 3 到 5 年資料分析經驗、偏好銀行或受監管環境。面試別強調你懂 ESG 框架，帶一個你把某類分析從人工變成自動 pipeline 的實例，講清楚 ETL 怎麼設計。誠實代價：ESG 只是這個 wholesale banking 分析職能的一塊，想做純永續的人會覺得比重不夠；掛出沒多久已 200 人以上申請；薪資未揭露、MCF 查無同職缺。',
      ],
      takeEn: [
        'On the surface a data analyst, but the JD explicitly asks you to support the development and delivery of “sector-specific and ESG analytics,” clarify analytical requirements with ESG stakeholders, and experiment with GenAI-enabled analytics automation. It reads like a wholesale bank moving ESG data from manual assembly toward engineered, repeatable output — ESG is one of several sector-analytics lines, not the whole job, but it is written into the core responsibilities rather than tacked on. The signal: bank-side ESG work is being “data-engineered,” and it needs people who write code, not just people who know frameworks.',
        'It fits a data person who knows Python and SQL and speaks ESG vocabulary; the JD asks for 3–5 years in data analytics, preferably in banking or a regulated environment. Do not lead with framework knowledge — bring one example of turning a class of analysis from manual into an automated pipeline, and be specific about the ETL design. Honest cost: ESG is only one slice of this wholesale-banking analytics function, so anyone wanting pure sustainability will find the weighting thin; 200+ applicants already; salary undisclosed, no matching MyCareersFuture posting.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4407028275',
    },
    // ── 🇭🇰 HK ──────────────────────────────────────────────────────────────
    {
      org: 'The Bank of East Asia (BEA) 東亞銀行',
      roleZh: '永續經理（資料與分析）',
      roleEn: 'Sustainability Manager (Data and Analytics)',
      market: 'HK',
      metaZh: '香港 · 經理 · 掛出 7/24',
      metaEn: 'Hong Kong · manager · posted 7/24',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺的核心字是 financed emissions：JD 要 support 銀行的 net zero roadmap、measure 集團的 financed emissions、做放貸與投資組合的 sectorial baselining，還要跟 Data Science & Governance 部門一起建 data dictionary、data lineage、找資料缺口。這讀起來不是寫永續報告，是幫一家銀行把「我們貸出去的錢排了多少碳」變成可量測、可追蹤的資料基礎建設。訊號是香港的銀行正在把淨零承諾從口號推到 financed emissions 的實際帳，需要同時懂碳會計與資料工程的人。',
        '適合會用 Tableau、Python、又懂碳排放核算的人；JD 要 5 年以上經驗、學歷接受資料科學或綠色金融、環境管理相關，並明寫 Cantonese is a must。面試帶一個你算過或建過的排放資料流程，講你怎麼處理資料缺口這個 financed emissions 最痛的環節。代價：這是 support 角色、匯報 Senior Sustainability Manager，執行比重高；薪資未揭露；廣東話為硬門檻，非粵語者直接排除。',
      ],
      takeEn: [
        'The core phrase here is financed emissions: the JD asks you to support the bank’s net-zero roadmap, measure the Group’s financed emissions, run sectorial baselining across lending and investment portfolios, and work with the Data Science & Governance department to build a data dictionary, data lineage and identify data gaps. This is not report-writing — it is building the data infrastructure to make “how much carbon does our lending finance” measurable and trackable. The signal: Hong Kong banks are pushing net-zero pledges from slogan to the actual financed-emissions ledger, and they need people who understand both carbon accounting and data engineering.',
        'It fits someone with Tableau and Python who understands emissions accounting; the JD asks for 5+ years, accepts data-science or green-finance/environmental-management degrees, and states plainly that Cantonese is a must. Bring one emissions data process you computed or built, and how you handled data gaps — the most painful part of financed-emissions work. Cost: this is a support role reporting to a Senior Sustainability Manager, execution-heavy; salary undisclosed; Cantonese is a hard gate that rules out non-speakers.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4444329089',
    },
    {
      org: 'Hongkong Land 置地公司',
      roleZh: '集團永續治理、報告與系統資深經理',
      roleEn: 'Senior Manager, Group Sustainability Governance, Reporting & Systems',
      market: 'HK',
      metaZh: '香港 · 資深經理 · 掛出 7/22',
      metaEn: 'Hong Kong · senior manager · posted 7/22',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這是一家上市地產集團把 ESG 治理與揭露當成 senior manager 級的常設專職：JD 要 lead 年度永續報告與 Board、管理層揭露、管 GRESB、MSCI、DJSI 這些 ESG 評級與投資人揭露、還要 oversee 永續資料系統的持續改善。這讀起來像公司在回應投資人與評級機構的壓力：ESG 評分直接影響它在資本市場被怎麼看，所以要一個能同時搞定報告品質與資料系統的人。訊號是 ESG 揭露在上市公司這端，已經從「合規任務」變成「投資人關係的一部分」。',
        '適合真的 lead 過上市公司永續報告全流程的人：JD 要 10 年以上、且點名要有帶上市跨國公司永續報告的實績，資淺的人接不住這個 governance 層級。面試帶你經手過的一份完整永續報告、或你把某個 ESG 評級分數拉上去的具體做法。代價：這是報告與治理職，不是策略或投資職，天花板在「把數字管好」；薪資未揭露；需要英文加粵語與普通話。',
      ],
      takeEn: [
        'This is a listed property group staffing ESG governance and disclosure as a standing senior-manager seat: the JD asks you to lead the annual sustainability report and Board/management disclosures, manage ESG ratings and investor disclosures across GRESB, MSCI and DJSI, and oversee continuous improvement of sustainability data systems. It reads like a company answering pressure from investors and rating agencies — its ESG scores directly shape how capital markets see it, so it wants someone who can handle both reporting quality and data systems. The signal: for listed companies, ESG disclosure has shifted from a compliance task to part of investor relations.',
        'It fits someone who has genuinely led the full sustainability-reporting cycle at a listed company; the JD asks for 10+ years and a proven track record leading reporting for a listed multinational — junior candidates will not hold this governance level. Bring a full sustainability report you owned, or a specific move that lifted an ESG rating score. Cost: this is a reporting-and-governance role, not strategy or investment, and the ceiling is “manage the numbers well”; salary undisclosed; English plus Cantonese and Mandarin required.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4443104933',
    },
    {
      org: 'EY',
      roleZh: '氣候變遷與永續服務 資深顧問（核數）',
      roleEn: 'Climate Change and Sustainability Service, Senior (Core Assurance)',
      market: 'HK',
      metaZh: '香港 · 資深（顧問級） · 掛出 7/22',
      metaEn: 'Hong Kong · senior (associate) · posted 7/22',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'Big 4 的氣候與永續服務開 senior 缺，是這個行業需求的溫度計：JD 要幫客戶編 ESG 報告並給對齊資本市場期待的管理建議、協助制定 ESG 策略與碳目標、還要做 ESG 風險管理含供應鏈與 EHS。這讀起來是標準的 ESG 顧問配置：技術要夠、又要能面對客戶。訊號是香港企業的 ESG 合規需求還在擴，撐得起 Big 4 持續補顧問人力。',
        '適合在企業或顧問端做過 ESG、想要顧問槓桿的人：JD 要 4 年以上顧問或商業經驗、且要有 ESG、CSR、碳管理、EHS 或再生能源其中的實戰底。面試帶一個你實際做過的碳盤查或 ESG 策略案，講你怎麼跟客戶把方法學口徑講定。代價是顧問業老三樣：工時、專案壓力，以及 senior 這層要同時 delivery 又開始帶人；薪資未揭露。',
      ],
      takeEn: [
        'A Big Four climate-and-sustainability practice opening a senior role is a thermometer for the sector: the JD asks you to compile clients’ ESG reports with management advice aligned to capital-market expectations, help formulate ESG strategies and carbon targets, and run ESG risk management including supply chain and EHS. It reads like a standard ESG-consulting kit — technical depth plus client-facing ability. The signal: Hong Kong corporate ESG-compliance demand is still expanding, enough to sustain Big Four adding advisory headcount.',
        'It fits someone who has done ESG in-house or in consulting and wants the consulting leverage; the JD asks for 4+ years of consultancy or commercial experience and real ground in ESG, CSR, carbon management, EHS or renewable energy. Bring a carbon inventory or ESG strategy you actually delivered, and how you settled methodology with the client. The cost is consulting’s usual three: hours, project pressure, and the senior-level squeeze of delivering while starting to manage others; salary undisclosed.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4442962419',
    },
    {
      org: 'Climind',
      roleZh: '永續顧問與成長專員',
      roleEn: 'Sustainability Consulting and Growth Specialist',
      market: 'HK',
      metaZh: '香港 · 專員級 · 掛出 7/23',
      metaEn: 'Hong Kong · associate · posted 7/23',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺把「永續顧問」跟「climate tech 產品」綁在同一張職缺上：JD 要 lead 永續顧問專案（氣候風險評估、策略、脫碳規劃），同時要 participate 在 climate LLM 的開發，做需求評估、方案設計、產品功能發布，還要管跟學術機構與氣候金融研究組織的外部合作。這讀起來像一家 climate tech 公司在找能同時做顧問交付與產品開發的複合型人。訊號是氣候顧問正在跟 AI 產品化收斂，這類「顧問加產品」的混合職會愈來愈多。',
        '適合懂永續框架、又想碰產品的人：JD 要金融、經濟或永續相關學歷、有永續顧問或氣候風險評估經驗、會用 Python。面試帶一個你把某個氣候方法學變成流程或工具的實例。代價要睜眼看：Climind 是規模較小的 climate tech 公司，公開資訊有限，進去前值得自己查清楚它的產品與資金狀況；且掛出沒多久已 178 人申請，這個利基職競爭意外地擠；薪資未揭露。',
      ],
      takeEn: [
        'This role binds “sustainability consulting” and “climate-tech product” into one posting: the JD asks you to lead sustainability consulting projects (climate risk assessment, strategy, decarbonisation planning) while participating in developing climate LLMs — needs assessment, solution design, product feature releases — and managing external collaboration with academic institutions and climate-finance research organisations. It reads like a climate-tech firm hiring a hybrid who can do both consulting delivery and product development. The signal: climate consulting is converging with AI productisation, and these “consulting-plus-product” hybrid roles will multiply.',
        'It fits someone fluent in sustainability frameworks who wants to touch product; the JD asks for a finance/economics/sustainability degree, sustainability-consulting or climate-risk-assessment experience, and Python. Bring one example of turning a climate methodology into a workflow or tool. Keep eyes open on the cost: Climind is a smaller climate-tech firm with limited public information, so check its product and funding before committing; 178 applicants already make this niche seat surprisingly crowded; salary undisclosed.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4426183778',
    },
    // ── 🇬🇧 UK ──────────────────────────────────────────────────────────────
    {
      org: 'HSBC Asset Management',
      roleZh: '另類投資責任投資資深專員',
      roleEn: 'Senior Alternatives Responsible Investment Specialist',
      market: 'UK',
      metaZh: '倫敦 · 資深 · 掛出 7/23',
      metaEn: 'London · senior · posted 7/23',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這是資產管理端把 ESG 直接放進另類投資決策的位子，不是後台。JD 要 support ESG 整合到 NZA 與 Alternative Solutions 的投資策略、design 並維護 sustainable investment frameworks、提供 ESG 洞見與數據給投資決策，還要在資深層級 engage GP 去推動重大 ESG 議題的改善。這讀起來像 HSBC Asset Management 在把責任投資從政策文件，落到實際跟 GP 談判、影響底層資產的層級。訊號是另類資產的 ESG 整合正在補專業人力，因為這塊最難用公開數據評估。',
        '適合真的在另類投資裡做過 ESG 整合的人：JD 要 extensive 的責任投資、ESG 整合實績，且要能 develop 並 apply sustainable investment frameworks，泛用 ESG 敘事背景補不出「跟 GP 談判」這個肌肉。面試帶一個你實際影響過某個 GP 或某筆投資 ESG 條件的實例。代價：地點在倫敦，倫敦生活成本要自己算；薪資未揭露，且我們查過 HSBC 在美國強制揭露轄區沒有掛同職稱的可比職缺，照規矩留白。',
      ],
      takeEn: [
        'This puts ESG directly into alternative-investment decisions on the asset-management side, not the back office. The JD asks you to support integrating ESG across NZA and Alternative Solutions investment strategies, design and maintain sustainable-investment frameworks, provide ESG insight and data for investment decisions, and engage GPs at senior levels to drive improvement on material ESG issues. It reads like HSBC Asset Management moving responsible investment from policy documents down to actually negotiating with GPs and shaping underlying assets. The signal: ESG integration in alternatives is adding specialist headcount, because it is the hardest space to assess with public data.',
        'It fits someone who has genuinely done ESG integration inside alternatives; the JD asks for an extensive responsible-investment/ESG-integration track record and the ability to develop and apply sustainable-investment frameworks — a generic ESG-narrative background cannot fake the “negotiate with GPs” muscle. Bring one example where you actually moved a GP or an investment’s ESG terms. Cost: London-based, so run the cost-of-living arithmetic yourself; salary undisclosed, and we checked — HSBC has no same-title posting in a US mandatory-disclosure jurisdiction to reference, so the field stays blank by our rules.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4444498573',
    },
    {
      org: 'J.P. Morgan Asset Management',
      roleZh: '永續投資與盡責管理 產品經理（副理）',
      roleEn: 'Product Manager, Sustainable Investing & Stewardship, Associate',
      market: 'UK',
      metaZh: '倫敦 · 副理 · 掛出 7/22',
      metaEn: 'London · associate · posted 7/22',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺要先看懂它是什麼、不是什麼：JD 掛在 SI&S Product Management 團隊，核心是幫 Stewardship 業務做 product management，set 產品願景、跑 product cabinet 與 agile ceremony、用 code（Python、SQL、R）做原型分析、維護 backlog 與 roadmap。這讀起來是 stewardship（盡責管理、代理投票）這個功能的產品與工具層，ESG 分析只佔很小一塊。訊號是大型資管把 stewardship 從人工流程，推向有產品、有 roadmap、有 KPI 的內部工具化，這塊需要的是懂產品又懂 stewardship 的人。',
        '適合有金融服務產品管理經驗、又懂 stewardship 或 proxy voting 的人：JD 要 4 年以上金融服務（偏財管或資管）經驗、product management 加 Agile、還要真的會寫 code 做分析。面試別把自己講成 ESG 專家，講你把某個內部工具從構想帶到上線的產品故事。代價：這是 PM 職、綠色成分是透過工具間接接觸而非直接做永續分析，想做純 ESG 的人會覺得隔了一層；地點倫敦、掛出沒多久已 200 人以上申請；薪資未揭露，美國同職稱同職能可比職缺查無，留白。',
      ],
      takeEn: [
        'Read this one for what it is and is not: the JD sits in the SI&S Product Management team, and the core is product management for the Stewardship business — set the product vision, run product cabinets and agile ceremonies, build prototype analytics in code (Python, SQL, R), and maintain the backlog and roadmap. This is not an ESG-analysis role; it is the product and tooling layer of stewardship (responsible ownership, proxy voting). The signal: large asset managers are moving stewardship from manual process to internal tooling with product, roadmap and KPIs — and that needs someone who understands both product and stewardship.',
        'It fits someone with financial-services product-management experience who knows stewardship or proxy voting; the JD asks for 4+ years in financial services (preferably wealth or asset management), product management plus Agile, and genuine coding for analysis. Do not pitch yourself as an ESG expert — tell the product story of taking an internal tool from idea to launch. Cost: this is a PM seat where the green content is reached through tooling rather than direct sustainability analysis, so anyone wanting pure ESG will feel a layer removed; London-based, 200+ applicants already; salary undisclosed, no comparable same-title same-function US posting found, left blank.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4369493797',
    },
  ],
  // MBA / strategy track — stays empty this week (2026-07-28 refresh). The MBA
  // keyword surfaced only generic strategy/growth roles (Google APAC Strategy,
  // McKinsey Associate, State Street, Mastercard VP, Morgan Stanley, Temasek
  // Portfolio Development) with no genuine sustainability/climate/impact angle,
  // so all were filtered per the MBA special rule. The one sustainability-angled
  // hybrid (Climind) is listed under HK weeklyPicks instead. The page hides this
  // section entirely when the array is empty.
  mbaPicks: [],
};

export interface GreenJobsCopy {
  eyebrow: string;
  title: string;
  intro: string;
  updatedPrefix: string;
  /** 只在 `isJobsSweepOnSchedule()` 為真時渲染,見上方註解。 */
  nextUpdate: string;
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
      '我們不轉存、也不販售職缺。這頁把最值得盯的雇主和求職平台整理好，連結一律導向官方原始頁面。精選由排程掃描後更新，最後一次更新的日期就標在下面。',
    updatedPrefix: '最後更新於',
    nextUpdate: '每天掃描一次',
    weeklyTitle: '精選職缺',
    weeklyEmpty: '精選整理中。留個 email 給《綠領情報》，下一批出來的時候我寄給你。',
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
      'We don’t re-host or resell listings — this page curates the employers and job boards worth watching, and every link points to the original source. Picks are refreshed by a scheduled sweep; the date of the last refresh is printed below.',
    updatedPrefix: 'Last updated',
    nextUpdate: 'swept daily',
    weeklyTitle: 'Curated picks',
    weeklyEmpty: 'Picks are being curated. Leave an email for Green-Collar Intel and I’ll send the next batch when it goes out.',
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
