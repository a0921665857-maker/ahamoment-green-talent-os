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
  updatedAt: '2026-07-22',
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
  // Human-approved weekly shortlist. Approved by Michael 2026-07-22 (midweek
  // bonus run) — sources: his LinkedIn job-alert emails (SG/HK/UK, 7/14–7/22
  // window) + MyCareersFuture cross-checks. TW excluded per 2026-07-19 policy
  // (see scheduled-tasks/green-jobs-weekly/SKILL.md). Commentary follows
  // docs/job-pick-playbook.md. Salary shown only where Tier 1 (disclosed on the
  // posting itself — Stavian); Temasek/PwC/IIX checked against MyCareersFuture
  // (rule 12) with no same-company-same-title match, so left "not disclosed"
  // rather than guessed. All 8 links verified live and all JDs verified against
  // the primary posting (not a search summary) on 2026-07-22.
  weeklyPicks: [
    {
      org: 'Temasek',
      roleZh: '永續高級助理／助理副總裁（永續方案）',
      roleEn: 'SA/AVP, Sustainability (Sustainable Solutions)',
      market: 'SG',
      metaZh: '新加坡 · SA/AVP · 掛出 7/21',
      metaEn: 'Singapore · SA/AVP · posted 7/21',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '職稱掛「Sustainability」，但 JD 的核心字是 technoeconomic modelling 跟 commercial thesis construction，這讀起來不是企業永續職，是投資評估職。Sustainable Solutions 這條線做的是把脫碳變成可投資的生意：找 Sustainable-Living 趨勢裡的機會、開發碳中和 pilot、對清潔能源部門做技術經濟分析。訊號是同一週淡馬錫連掛三個永續相關缺（這筆加上 Community Stewardship 約聘與 Investment Innovation 約聘），主權基金端的永續人力在擴，而且擴的是「會算數的那種」。',
        '適合能源工程或顧問出身、又真的建過財務模型的人；只做過永續報告書、沒碰過技術經濟分析的人接不住，JD 要六年以上清潔能源、投資或企業轉型經驗不是客套。面試別談理念，帶一個你算過的清潔能源技術路線經濟性分析，講你的假設哪裡最脆弱。代價講在前面：薪資未揭露（MCF 也查無此缺），SA/AVP 在淡馬錫的層級不算高，而 JD 裡 multi-stakeholder 這個詞出現的頻率預告了內部協調的比重。',
      ],
      takeEn: [
        'The title says Sustainability, but the JD keywords are technoeconomic modelling and commercial thesis construction — this reads as an investment-evaluation seat, not a corporate-sustainability one. The Sustainable Solutions line turns decarbonisation into investable business: sourcing Sustainable-Living trend opportunities, developing decarbonisation pilots, running technoeconomics across clean energy sectors. The signal: Temasek posted three sustainability-adjacent roles in the same week (this one, plus Community Stewardship and Investment Innovation contracts) — sovereign-fund sustainability headcount is expanding, and specifically the kind that runs numbers.',
        'It fits someone from energy engineering or consulting who has actually built financial models; a reporting-only sustainability background will not hold six-plus years of clean energy, investment or corporate-transition experience plus technoeconomic analysis. In the interview, skip the conviction speech — bring one clean-energy technoeconomic analysis you ran and name where your assumptions are weakest. The costs upfront: salary undisclosed (nothing on MyCareersFuture either), SA/AVP sits mid-table in Temasek’s hierarchy, and the frequency of “multi-stakeholder” in the JD forecasts the coordination load.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4440450319',
    },
    {
      org: 'Stavian Talent（代招，僱主為未具名跨商品貿易商）',
      roleZh: '資深碳交易員',
      roleEn: 'Senior Carbon Trader (Singapore)',
      market: 'SG',
      metaZh: '新加坡 · 資深 · 掛出 7/20',
      metaEn: 'Singapore · senior · posted 7/20',
      salaryZh: '月薪 S$15,000–20,000（職缺揭露，底薪）',
      salaryEn: 'S$15,000–20,000/month base (disclosed on posting)',
      salarySources: [
        { label: 'LinkedIn 職缺頁（揭露）', url: 'https://www.linkedin.com/jobs/view/4442038186' },
      ],
      salaryConfidence: 'disclosed',
      takeZh: [
        '這筆最值錢的是它把價碼印出來了：資深碳交易員在新加坡的底薪帶，月薪一萬五到兩萬新幣，這是本週唯一自揭薪資的精選。JD 讀起來是純交易職掛在碳資產上：自營加 flow 兩本書、結構化 offtake 與遠期、VaR 與資本限額管理，要十年商品交易資歷其中至少五年在碳市場，還明寫要「close 過結構化交易，不是只會報價」。訊號是又一家跨商品貿易商在新加坡建碳交易台，跟本月稍早 129 Knots 建 desk 是同一條線：碳在商品行眼裡已經是正式資產類別，不是 ESG 部門的副業。',
        '適合真的有 P&L 紀錄的商品交易員；ESG 分析或碳顧問背景請自動跳過，這個 JD 沒有留模糊空間。面試就是你的 P&L 跟一筆你從頭 close 到尾的結構化交易。代價有兩層：代招且僱主未具名，你在盡職調查自己未來雇主這件事上先天資訊不對稱；自營交易台的存續綁著老闆對碳行情的信念，desk 收掉的速度可以跟建起來一樣快。',
      ],
      takeEn: [
        'The most valuable thing here is the printed price: a senior carbon trader’s base band in Singapore, S$15,000–20,000 a month — the only salary-disclosed pick this week. The JD reads as a pure trading seat on carbon assets: proprietary plus flow books, structured offtakes and forwards, VaR and capital limits, ten years in commodities with at least five in carbon, and the explicit line about having closed structured deals, “not merely pricing them”. The signal: another cross-commodities merchant is standing up a carbon desk in Singapore, the same line as 129 Knots earlier this month — carbon is now a proper asset class to trading houses, not an ESG side project.',
        'This fits commodity traders with a real P&L record; ESG analysts and carbon consultants should skip — the JD leaves no ambiguity. The interview is your P&L and one structured deal you closed end to end. Two layers of cost: it is a recruiter posting for an unnamed employer, so you start with an information disadvantage in diligencing your own future firm; and a prop desk’s lifespan is tied to the owner’s conviction on carbon — desks can be shut as fast as they are built.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4442038186',
    },
    {
      org: 'PwC Singapore',
      roleZh: '永續與氣候變遷顧問 經理／資深經理（風險服務）',
      roleEn: 'Sustainability & Climate Change Advisory, Manager/Senior Manager (Risk Services)',
      market: 'SG',
      metaZh: '新加坡 · 經理級 · 掛出 7/21',
      metaEn: 'Singapore · manager level · posted 7/21',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這個缺掛在 Risk Services 底下，這個位置本身就是訊號：PwC 把永續當風險生意做，客戶買單的理由是 ISSB 與各地披露法規壓下來的合規焦慮，不是品牌形象。JD 的清單很誠實：碳盤查要算得準、重大性評估要帶得動、還要「被客戶當成 ESG 的 trusted advisor」，翻譯過來是既要技術底也要能賣案子。對非新加坡籍讀者最實際的一行字是 JD 明寫提供工作簽證贊助，這在本週八筆裡是唯一明示的。',
        '適合在企業端做過完整永續報告流程、想換到顧問槓桿上的人：你教過一家公司做完的事，顧問身分可以重複賣二十次。面試帶一個你實際算過的碳盤查或吵過的範疇三邊界，講你怎麼跟審計員或客戶把口徑吵定的。代價是顧問業的老三樣：工時、差旅、以及 Manager/Senior Manager 這個夾心層要同時背 delivery 跟帶團隊；薪資未揭露，MCF 上也查無同職缺。',
      ],
      takeEn: [
        'The seat hangs under Risk Services, and that placement is itself the signal: PwC sells sustainability as a risk business, and clients pay out of compliance anxiety driven by ISSB and local disclosure rules, not brand image. The JD’s list is honest — corporate carbon footprints calculated accurately, materiality assessments led, and being seen as a “trusted advisor on ESG & Sustainability matters” — which translates to technical depth plus the ability to sell work. For non-Singaporean readers the most practical line: work-visa sponsorship is explicitly available, the only pick of this week’s eight that says so.',
        'It fits someone who has run the full sustainability-reporting cycle in-house and wants the consulting leverage: what you taught one company to do, a consultant sells twenty times. Bring a carbon inventory you actually calculated or a Scope 3 boundary fight you settled, and how you closed the methodology argument. The costs are consulting’s usual three: hours, travel, and the Manager/Senior Manager squeeze of carrying delivery while managing a team; salary undisclosed, with no matching posting on MyCareersFuture.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4433675456',
    },
    {
      org: 'Impact Investment Exchange (IIX)',
      roleZh: '投資人關係副總監',
      roleEn: 'Associate Director, Investor Relations',
      market: 'SG',
      metaZh: '新加坡 · 副總監 · 掛出 7/21',
      metaEn: 'Singapore · associate director · posted 7/21',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '表面是 IR 職，實際是募資前線：JD 明寫要在 Orange Climate Fund 的 pre-close 到 first close 過程中「主動帶投資人互動」，基金正在關鍵募資期，這時候開 12 到 15 年資歷的資深 IR 缺，讀起來像找能直接上場的人不是來養的。IIX 做的是性別視角乘氣候的交叉產品（Women’s Livelihood Bonds、Orange Bonds），這個缺的存在本身是個訊號：這類產品在亞洲走到了機構資金願意進場、需要專業 IR 機制承接的階段。',
        '適合真的管過基金 IR 全流程的人：JD 點名 capital account、NAV 報告、waterfall 溝通、covenant 監控，這些是資管老手的肌肉記憶，純 ESG 或影響力敘事背景補不出來。面試帶你帶過的 first close 經驗跟一段你救回來的 LP 關係。代價要自己掂：IIX 是影響力平台不是商業資管，同樣年資的薪資帶大概率低一截且未揭露，你買的是這個交叉領域的先行者位置。',
      ],
      takeEn: [
        'On the surface an IR seat; in practice a fundraising front line. The JD says it plainly: take an active leadership role in investor engagement through the Orange Climate Fund’s pre-close and first close — the fund is mid-raise, and opening a 12-to-15-year senior IR seat now reads like hiring someone who can play immediately, not be developed. IIX runs gender-lens-times-climate products (Women’s Livelihood Bonds, Orange Bonds), and this opening is itself a signal: the category has reached the stage in Asia where institutional money shows up and demands professional IR mechanics.',
        'It fits someone who has genuinely run fund IR end to end — the JD names capital accounts, NAV reporting, waterfall communications, covenant monitoring, the muscle memory of asset-management veterans that no amount of impact narrative substitutes for. Bring a first close you carried and an LP relationship you rescued. Weigh the cost yourself: IIX is an impact platform, not commercial asset management — the band for equivalent tenure likely sits a notch lower and is undisclosed; what you are buying is the front-runner seat in this crossover.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4442603350',
    },
    {
      org: 'Nan Fung Group 南豐集團',
      roleZh: '永續與共享價值助理經理',
      roleEn: 'Assistant Manager, Sustainability and Shared Value',
      market: 'HK',
      metaZh: '香港 · 助理經理 · 掛出 7/21',
      metaEn: 'Hong Kong · assistant manager · posted 7/21',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'JD 裡最有訊息量的一句是要對「internal and external clients」做影響力測量顧問服務：一家香港家族地產集團把社會價值測量做成能對外輸出的能力，不只是自家 ESG 報告的一個章節。要求會 SROI 這類具體方法學、還點名 Certified Social Value Practitioner 認證是加分，這讀起來像團隊在把「社會影響」從敘事轉成可審計的數字。JD 結尾要求能在專案裡用 AI 工具，2026 年的香港永續職缺已經把這條寫成標配。',
        '適合做過影響力測量、能同時跟企業跟 NGO 兩邊講話的人：這個缺的日常是把兩種語言互相翻譯。面試帶一個你算過的 SROI 或影響測量案例，講清楚你的假設跟折現怎麼設的。代價明擺著：Assistant Manager 是執行層，掛出一天 160 人申請的擁擠度，加上薪資未揭露，議價空間要靠你把方法學的稀缺性講出來。',
      ],
      takeEn: [
        'The most informative line in the JD: impact measurement and management consultancy for “internal and external clients” — a Hong Kong family property group packaging social-value measurement as an exportable capability, not a chapter in its own ESG report. Requiring concrete methodology (SROI) and naming the Certified Social Value Practitioner credential as an advantage reads like a team converting “social impact” from narrative into auditable numbers. The closing requirement to apply AI-enabled approaches in projects — in 2026 Hong Kong sustainability JDs now list that as standard equipment.',
        'It fits someone who has done impact measurement and can speak both corporate and NGO — the daily work is translating between the two languages. Bring one SROI or impact measurement you actually computed, and be clear on how you set assumptions and discounting. The costs are in plain sight: Assistant Manager is the execution layer, 160 applicants within a day marks the crowd, and with salary undisclosed your leverage comes from making the methodology scarcity legible.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4431066092',
    },
    {
      org: 'Carbon Exchange (Hong Kong) Limited',
      roleZh: 'ESG 研究員（大灣區）',
      roleEn: 'ESG Researcher (Greater Bay Area Focus)',
      market: 'HK',
      metaZh: '香港 · 專員級 · 12–18 個月約聘 · 掛出 7/21',
      metaEn: 'Hong Kong · associate · 12–18-month contract · posted 7/21',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '職稱是 Researcher，JD 讀起來是 ESG 軟體的產品研究職：找中小企的永續痛點跟資料缺口、跟技術團隊一起設計自動化報告功能、把 HKEX 跟大灣區的法規要求「翻譯成清楚可執行的工作流」。訊號在後面那層：港交所的披露規則正在往供應鏈下沉，中小企撐不起永續部門，就會有人把合規做成軟體賣給他們，這個缺就是那條生產線在補人。',
        '適合懂 GRI、ISSB 這些框架、又想從寫報告轉去做產品的人：這是一張從「ESG 文書」跳去「ESG 工具」的轉軌票。面試帶一個你把框架翻成流程或工具的實例，哪怕只是你自己做的試算表模板。代價要睜眼看：12 到 18 個月約聘、Associate 級、掛出 16 小時 193 人申請，這是一個入口不是一個歸宿，進去是為了兩年後帶著產品經驗出來。',
      ],
      takeEn: [
        'The title says Researcher; the JD reads product research for ESG software: identify SMEs’ sustainability pain points and data gaps, work with the tech team to design automated-reporting features, and translate HKEX and Greater Bay Area regulatory requirements “into clear, actionable, and logical workflows”. The signal sits one layer back: HKEX disclosure rules are sinking down supply chains, SMEs cannot carry sustainability departments, so someone turns compliance into software sold to them — this posting is that production line hiring.',
        'It fits someone fluent in GRI and ISSB who wants to move from writing reports to building product — a transfer ticket from ESG paperwork to ESG tooling. Bring one example of turning a framework into a workflow or tool, even a spreadsheet template you built yourself. Keep eyes open on the costs: a 12-to-18-month contract, associate level, 193 applicants in sixteen hours — this is an entrance, not a destination; you go in to come out two years later with product experience.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4425264871',
    },
    {
      org: 'MUFG',
      roleZh: '永續客戶方案 分析師／副理',
      roleEn: 'Analyst/Associate, Sustainable Client Solutions',
      market: 'UK',
      metaZh: '倫敦 · 入門級 · 掛出 7/19',
      metaEn: 'London · entry level · posted 7/19',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        '這是日系銀行在倫敦補永續金融「知識中樞」的缺：做客戶簡報素材、追蹤 taxonomy 跟監管動態、幫 relationship manager 找永續金融的商機。別把它讀成後台 CSR，JD 明寫 desirable 是 front office 經驗，這個位子是幫前台找 deal 的內容引擎。訊號是連日系行都把永續金融的內容力當獲客工具在建制化，而且從 entry 級開始養，管線思維。',
        '適合想進永續金融正門的新人：這個入口不要求你先是銀行家，要求你能把監管跟市場動態寫成「讓客戶想約下一次會」的東西。面試帶一份你自己寫過的市場或監管解讀，證明你能產內容不是只會轉述。代價：entry 級薪資帶配倫敦生活成本要自己精算，掛出兩天破兩百人申請；薪資未揭露，美國同職缺查無可比對象（同公司同職稱在強制揭露轄區沒有掛），照規矩留白。',
      ],
      takeEn: [
        'This is a Japanese bank building its sustainable-finance knowledge hub in London: client engagement materials, tracking taxonomies and regulation, helping relationship managers spot sustainable-finance opportunities. Do not read it as back-office CSR — the JD lists front-office experience as desirable; the seat is a content engine that finds deals for the front line. The signal: even Japanese banks are institutionalising sustainable-finance content as a client-acquisition tool, and they are growing it from entry level — pipeline thinking.',
        'It fits someone entering sustainable finance through the front door: the entrance does not require you to already be a banker, it requires turning regulation and market movement into something a client wants a second meeting about. Bring a market or regulatory read-out you wrote yourself, proving you produce content rather than relay it. The costs: an entry-level band against London living costs needs your own arithmetic, and applications passed two hundred within two days; salary undisclosed, and no same-company same-title posting exists in a mandatory-disclosure jurisdiction to reference, so the field stays blank by our rules.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4424617502',
    },
    {
      org: 'ISS STOXX Sustainability',
      roleZh: '客戶成功專員（永續解決方案）',
      roleEn: 'Client Success Specialist, Sustainability Solutions',
      market: 'UK',
      metaZh: '倫敦 · 中階 · 掛出 7/19',
      metaEn: 'London · mid-senior · posted 7/19',
      salaryZh: '薪資未揭露，建議面談時直接詢問',
      salaryEn: 'Not disclosed — ask directly at interview',
      salarySources: [],
      takeZh: [
        'ESG 數據商開客戶成功缺，是這個行業商業模式的一面鏡子：資料庫賣出去只是開始，客戶會不會用、用得深不深，決定明年續不續約，所以需要有人專職「讓機構投資人真的把數據用起來」。JD 是標準 CSM 配置：訓練客戶、管詢問、把市場需求回傳給 ISS 業務主管，工具是 Salesforce。訊號是 ESG 數據業從搶新客轉向顧留存，這個轉向會持續產生這類職缺。',
        '適合有金融服務客戶端經驗、又懂 responsible investment 語彙的人：不用寫程式，要會把數據翻成客戶的決策語言。面試帶一個你把快流失的客戶救回來、或把用量推深的實例，數字講清楚。代價：CSM 在數據商內部的話語權通常排在產品跟銷售後面，升遷要靠把客戶聲音變成產品決策的能力；薪資未揭露，我們查過 ISS 在美國的掛缺，職稱職能不同不能比照，留白。',
      ],
      takeEn: [
        'An ESG data house hiring client success is a mirror of the industry’s business model: selling the database is only the start — whether clients use it, and how deeply, decides next year’s renewal, so someone owns “making institutional investors actually use the data”. The JD is standard CSM kit: train clients, own inquiries, communicate market requirements to ISS business leaders, on Salesforce. The signal: ESG data is shifting from chasing new logos to defending retention, and that shift will keep producing seats like this.',
        'It fits someone with client-facing financial-services experience who speaks responsible-investment vocabulary: no coding required, but you must translate data into clients’ decision language. Bring one save — a churning client you recovered or usage you deepened — with the numbers. The costs: CSM voice inside data vendors usually ranks behind product and sales, and promotion runs through converting client signal into product decisions; salary undisclosed — we checked ISS postings in the US and the titles and functions differ, so no reference band applies and the field stays blank.',
      ],
      url: 'https://www.linkedin.com/jobs/view/4424726325',
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
