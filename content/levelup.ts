import type { Locale } from '@/lib/constants';

/**
 * 《綠領晉級地圖 2026 H2》— the salary report's sequel, rendered on-site at
 * /[locale]/levelup. Standalone locale-keyed content (mirrors salaryReport.ts)
 * so it stays out of the getContent schema.
 *
 * Every figure was verified against its original source page (2026-07 night
 * run; see docs/threads-levelup-seeds-2026-07-21.md and the sources block).
 * Skills with no clean public premium stay explicitly unmeasured — never
 * estimated. zh-TW: full-width punctuation, no em-dash, Michael's voice.
 */

export interface LevelupRung {
  name: string;
  val: string;
  src: string;
  /** Bar width % when a clean premium figure exists. */
  width?: number;
  /** Unmeasured-state note when the market claims more but publishes nothing. */
  flag?: string;
}

export interface LevelupReport {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lede: string;
  byline: string;
  backToMri: string;
  verdict: string;
  sceneTag: string;
  scene: string;
  scenePunch: string;
  bigstat: { fig: string; cap: string; src: string };
  s1Title: string;
  s1Intro: string;
  rungs: LevelupRung[];
  whyTitle: string;
  whyBody1: string;
  whyBody2: string;
  s2Title: string;
  triad: { fig: string; cap: string }[];
  s2Body: string;
  s2Src: string;
  s3Title: string;
  s3Intro: string;
  certTable: { head: string[]; rows: string[][] };
  certBoxTitle: string;
  certBoxBody1: string;
  certBoxBody2: string;
  s4Title: string;
  paths: { who: string; head: string; body: string }[];
  s5Title: string;
  s5Intro: string;
  proofNoLabel: string;
  proofYesLabel: string;
  proofs: { no: string; yes: string }[];
  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  ctaSub: string;
  prequelLine: string;
  prequelCta: string;
  sourcesLabel: string;
  method: string;
  verify: string;
  sources: { code: string; name: string; note: string }[];
  footer: string;
}

const zhTW: LevelupReport = {
  meta: {
    title: '綠領晉級地圖 2026 H2：哪個技能、哪張證照後面真的有錢',
    description:
      '薪資報告講完你值多少，這份講怎麼變更值錢。查遍公開調查，只有碳核算 × Scope 3 有乾淨的薪資溢價數字（+12 到 18%）；證照買到的是門不是加薪；三種人各自的兩年路線。每個數字都逐字查證原始出處。',
  },
  eyebrow: '綠領情報 · 薪資報告第二話',
  title: '你值多少講完了。這份講：怎麼變更值錢。',
  lede: '上一份報告把星台綠領的薪資帶攤開，結論是「頭銜不值錢，技能組合才值錢」。那接下來每個人都問同一句：那我到底該把時間押在哪個技能、哪張證照上？這份地圖就是回答這一題，而且只放我親手打開原始頁、逐字確認過的數字。',
  byline: '《綠領晉級地圖 2026 H2》· 資料截至 2026 年 7 月 · 每個數字附出處',
  backToMri: '← 回到免費 MRI',
  verdict:
    '一句話結論：在所有綠色技能裡，只有一個有乾淨、跨來源、查得到出處的薪資溢價：碳核算 × Scope 3，比同儕多領 12 到 18%。其他技能市場都說「更值錢」，卻沒人給得出一個乾淨數字。這件事本身，就是這份報告最重要的情報。',
  sceneTag: '場景 · 依真實市場資訊構成',
  scene:
    '書桌上攤著五份簡章：ISO 14064、CFA ESG、GARP SCR、GRI、還有一張連你自己都說不清楚在幹嘛的碳管理平台認證。每一份的封面都印著「搶手」「高薪」「未來十年最缺的人」。你手上有的，只有兩年的下班時間和一筆有限的學費。',
  scenePunch: '問題從來不是「哪張證照好」，是「哪一張後面，真的有錢」。',
  bigstat: {
    fig: '12–18%',
    cap: '碳核算 × Scope 3 排放的專長，比同資歷、沒有這技能的同儕多領的幅度。這是我查遍公開調查後，唯一有乾淨數字、還能指回原始頁的綠色技能溢價。',
    src: 'SRC｜OneStop ESG《2026 Sustainability Salary Survey》n=2,147 · 42 國 · 已逐字查證',
  },
  s1Title: '技能溢價階梯：誰後面真的有數字',
  s1Intro:
    '同一份全球調查、同一個問法（「有這技能的人比沒有的多領多少」）。實心的金條，是查得到乾淨數字的；斜線的空條，是市場明說「更高」、卻沒有一份公開調查敢掛出一個數字的。空條不是沒價值，是還沒被標準化。',
  rungs: [
    {
      name: '碳核算 × Scope 3',
      val: '+12–18%',
      width: 88,
      src: 'OneStop ESG 2026 · 逐字查證 · 唯一有乾淨數字',
    },
    {
      name: 'AI × 綠色技能',
      val: '+10–15%（亞太 18%）',
      width: 74,
      src: 'OneStop ESG 2026 · 逐字查證',
    },
    {
      name: 'LCA · 氣候風險建模 · ESG 數據分析',
      val: '更高 · 無公開數字',
      flag: '市場說「更明顯的溢價」，但沒給數字',
      src: 'OneStop ESG 2026 原話：「even sharper premium」· 質化，不編數字',
    },
    {
      name: '法規合規 CSRD · ESRS · ISSB',
      val: '顯著更高 · 無公開數字',
      flag: '市場說「顯著更高薪」，但沒給數字',
      src: 'OneStop ESG 2026 原話：「significantly higher pay」· 質化，不編數字',
    },
  ],
  whyTitle: '為什麼一半的格子是空心的？',
  whyBody1:
    '市場明明在搶會做 LCA、會接 CSRD 的人，卻查不到一個乾淨的溢價數字。這不是我偷懶，是這些技能太新、樣本太散，沒有一份公開調查敢替它掛上一個具體百分比。',
  whyBody2:
    '我把空條留白，是因為有過教訓：搜尋引擎的摘要會把不同來源拼在一起，生出一個「聽起來很合理、但翻遍全網查無出處」的數字。所以這份報告的內規只有一條：任何要給你看的數字，我都得親手打開那個原始頁、親眼看到它逐字寫在上面，才敢放。空心的格子，就是還沒有人能負責任地標價的藍海。',
  s2Title: '先看方向：綠色技能正在變成「加值層」',
  triad: [
    { fig: '+46.6%', cap: '綠色技能者的錄用率，比整體勞動力高出的幅度' },
    { fig: '53%', cap: '綠色技能的錄用，發生在「非綠色職稱」上（史上第一次過半）' },
    { fig: '7.7 / 4.3', cap: '綠色招聘年成長 7.7%，技能供給只成長 4.3%，需求快兩倍' },
  ],
  s2Body:
    '翻成白話：你不必轉職去當一個「永續專員」。真正划算的是，把綠色技能焊到你現在的專業上：會計、供應鏈、資料、金融，讓你在原本的職稱裡變得更難被取代。綠色技能現在是加值層，不是一個要你從零開始的新職業。',
  s2Src: 'SRC｜LinkedIn《2025 Global Green Skills Report》· 經 ESG Today 逐字查證',
  s3Title: '證照的真相：它買到的是門，不是加薪',
  s3Intro:
    '三張最常被問到的證照，把成本、時間、和它到底買到什麼，一次攤開。費用都是官方頁逐字查證，換算前的原幣。',
  certTable: {
    head: ['證照', '費用', '時間', '它到底買到什麼'],
    rows: [
      [
        'GARP SCR（氣候風險）',
        'USD 525–750，重考 350',
        '一次考試 · 自學數月 · 2026 考窗 10/17–25',
        '氣候風險的共同語言。對金融、風控、資產管理這條線最有用；讓你能跟風控部門用同一套詞講話。',
      ],
      [
        'CFA ESG（永續投資）',
        'USD 890',
        '100+ 小時 · 6 個月 · 自學線上',
        '投資端 ESG 的系統框架。對想進資管、銀行、財管的人最直接；CFA 招牌加上 ESG，是金融轉綠的標準敲門磚。',
      ],
      [
        'ISO 14064（主導查驗員）',
        '依機構，星可用 SkillsFuture',
        '約 4 天課 · 操作型資格',
        '「能查驗一份碳盤查」的操作資格。對顧問、製造業、供應鏈這條線最實戰；也是碳核算那 12–18% 溢價的入場工具。',
      ],
    ],
  },
  certBoxTitle: '上一份報告藏著的那個數字，這份把話講完',
  certBoxBody1:
    '證照讓你的面試邀約多 5.4 倍，薪水只多 5.3%。所以別誤會你買的是什麼：證照負責開門，加薪靠的是門後那個技能，是不是真的長在你身上。',
  certBoxBody2:
    '你花 USD 890 買的不是那 12–18% 溢價，是「有資格去賺那 12–18%」的入場券。真正把溢價拿到手的，是下一段：你能不能拿出戰績。',
  s4Title: '三種人，各自的兩年路線',
  paths: [
    {
      who: '路徑一 · 台灣永續顧問 · 1–4 年',
      head: '把製造業碳盤查練成別人搶不走的實戰',
      body: '你的槓桿是台灣電子供應鏈的碳盤查實戰，這正是新加坡顧問公司最缺的。押碳核算 × Scope 3（唯一有乾淨溢價的那條），拿 ISO 14064 當操作敲門磚。兩年的目標寫成一句話：「獨立跑過 N 個廠的 Scope 3」。別再去收第五張證照。',
    },
    {
      who: '路徑二 · 新加坡企業 ESG 經理 · 4–8 年',
      head: '把永續焊上財務與法規，才爬得上塔尖',
      body: '你的天花板不在「永續」兩個字，在你能不能把永續數字接進財報。押 CSRD／ISSB 合規加碳會計，往「能把永續接進財務揭露」的位置走。這是往總監、CSO 塔尖，公開數據裡唯一看得到的那道梯子。',
    },
    {
      who: '路徑三 · 金融背景 · 想轉氣候',
      head: '你的護城河是別人不會的財務，別丟掉它',
      body: '別從零去跟人拚碳盤查。你的價值在「懂錢又懂碳」，不是「又一個會算碳的人」。用 CFA ESG 或 SCR 把氣候風險的語言補上，鎖定新加坡永續金融：MAS 在推、缺口最硬、塔尖薪水也最高。',
    },
  ],
  s5Title: '技能怎麼「證明」：戰績大於證照',
  s5Intro:
    '溢價不是付給「你知道什麼」，是付給「你用它做出過什麼」。同一項技能，換個寫法，議價力差一個量級。',
  proofNoLabel: '別寫',
  proofYesLabel: '要寫',
  proofs: [
    {
      no: '持有 ISO 14064 證照',
      yes: '用 ISO 14064-3 查驗過 8 個製造廠的 Scope 1+2 盤查，抓出關鍵排放源的計算誤差',
    },
    {
      no: '熟悉 CSRD／ISSB 準則',
      yes: '帶團隊把一家公司的永續揭露從 GRI 轉接 ISSB S1／S2，通過會計師查核',
    },
    {
      no: '會碳會計、懂 Scope 3',
      yes: '建過一套 Scope 3 上游計算模型，把供應商數據涵蓋率從 30% 拉到 80%',
    },
  ],
  ctaEyebrow: '那，你現在在哪一段？',
  ctaTitle: '這是市場的地圖。你站在哪，MRI 三分鐘告訴你。',
  ctaBody:
    '你該押哪張證照、補哪個技能，要看你現在的組合、資歷和目標市場。這正是免費綠領 MRI 在做的事：把你放進上面這張地圖，指出你缺哪一塊、下一步押哪裡最划算。',
  ctaButton: '做一次綠領 MRI（免費）→',
  ctaSub: '約 5 分鐘 · 免費 · 免註冊',
  prequelLine: '還沒看過第一話？先看你值多少：',
  prequelCta: '《2026 亞太綠領薪資報告》→',
  sourcesLabel: '方法論與來源',
  method:
    '2026 年 7 月，以公開網路來源交叉查證。每個數字保留原始區間、不做假精確；查不到乾淨公開數字的技能（LCA、氣候風險建模、法規合規），直接標「無公開數字」，不推估、不硬湊。ISO 14064 費用因訓練機構而異，此處只述格式與新加坡 SkillsFuture 可補助，不掛未查證的價格。',
  verify:
    '查證紀律：本報告所有具體數字，都經打開宣稱出處的原始頁面、逐字確認後才收錄。過程中已剔除三個「搜尋摘要看似正確、原始頁卻查無或不同」的數字。搜尋摘要只用來找路，不當證據。',
  sources: [
    {
      code: 'OS',
      name: 'OneStop ESG《2026 Sustainability Salary Survey》',
      note: 'n=2,147 · 42 國（北美 52%／歐 28%／中東非 11%／亞太 9%）· 碳核算 Scope 3 +12–18%、AI×綠 +10–15%（亞太 18%）',
    },
    {
      code: 'MP',
      name: 'Michael Page《Singapore Salary Guide 2026》',
      note: '永續／ESG 職位 2026 調薪 7–10%、高階 15%（reporting／脫碳／永續金融）',
    },
    {
      code: 'LI',
      name: 'LinkedIn《2025 Global Green Skills Report》',
      note: '綠色人才錄用率 +46.6%、非綠職稱佔綠色技能錄用 53%、招聘成長 7.7% vs 供給 4.3%',
    },
    {
      code: 'RC',
      name: 'Reeracoen《Singapore Salary Guide 2026》',
      note: 'ESG 經理／碳核算分析師整體調薪 +5–6%（該機構自報）',
    },
    {
      code: 'GARP',
      name: 'GARP 官方 SCR 費用頁',
      note: '2026 考試 USD 525–750（依會員身分）· 重考 350 · 考窗 10/17–25',
    },
    {
      code: 'CFA',
      name: 'CFA Institute 官方頁',
      note: 'Sustainable Investing Certificate（前 ESG Certificate）USD 890 · 100+ 小時 · 6 個月',
    },
  ],
  footer:
    '© 2026 AhaMoment 綠領情報 · 本報告是市場資訊彙整，不是個人職涯、投資或移民建議 · 數字皆附來源、保留區間，查不到乾淨數字的技能一律標明「無公開數字」而非推估。溢價數字反映調查當下，證照費用與考程以各機構官方公告為準。',
};

const en: LevelupReport = {
  meta: {
    title: 'Green-Collar Level-Up Map 2026 H2: which skills and certificates actually pay',
    description:
      'The salary report covered what you are worth; this one covers how to become worth more. Across public surveys only carbon accounting × Scope 3 carries a clean, verifiable premium (+12–18%). Certificates buy the door, not the raise. Two-year routes for three profiles. Every figure verified against its original source.',
  },
  eyebrow: 'Green-collar intelligence · Salary report, part two',
  title: 'The salary report told you what you are worth. This one: how to become worth more.',
  lede: 'The last report laid out the Singapore and Taiwan pay bands and landed on one conclusion: titles are cheap, skill combinations are not. The next question everyone asks is the same: which skill, which certificate, actually deserves my next two years? This map answers that, and it only carries numbers I opened the original source page and verified word for word.',
  byline: 'Green-Collar Level-Up Map 2026 H2 · data as of July 2026 · every figure carries a source',
  backToMri: '← Back to the free MRI',
  verdict:
    'One-line verdict: across every green skill, exactly one carries a clean, cross-source, traceable salary premium: carbon accounting × Scope 3, at 12–18% over peers. For everything else the market says "worth more" without ever publishing a clean number. That fact is itself the most important intelligence in this report.',
  sceneTag: 'Scene · composed from real market information',
  scene:
    'Five brochures on the desk: ISO 14064, CFA ESG, GARP SCR, GRI, and a carbon-platform certificate you cannot quite explain even to yourself. Every cover says the same things: in demand, high pay, the talent of the next decade. What you actually have is two years of evenings and a limited budget.',
  scenePunch: 'The question was never "which certificate is good". It is "which one actually has money behind it".',
  bigstat: {
    fig: '12–18%',
    cap: 'What specialists in carbon accounting × Scope 3 emissions earn over peers with the same experience and no such skill. After going through the public surveys, this is the only green-skill premium with a clean number that points back to an original page.',
    src: 'SRC | OneStop ESG, 2026 Sustainability Salary Survey · n=2,147 · 42 countries · verified word for word',
  },
  s1Title: 'The premium ladder: which skills have real numbers behind them',
  s1Intro:
    'Same global survey, same question: how much more do people with this skill earn? Solid bars have clean, verifiable numbers. Hatched empty bars are skills the market openly calls "worth more" while no public survey dares to attach a figure. Empty does not mean worthless; it means not yet standardised.',
  rungs: [
    {
      name: 'Carbon accounting × Scope 3',
      val: '+12–18%',
      width: 88,
      src: 'OneStop ESG 2026 · verified · the only clean number',
    },
    {
      name: 'AI × green skills',
      val: '+10–15% (APAC 18%)',
      width: 74,
      src: 'OneStop ESG 2026 · verified',
    },
    {
      name: 'LCA · climate-risk modelling · ESG data analysis',
      val: 'Higher · no public number',
      flag: 'The market says "an even sharper premium" but publishes no figure',
      src: 'OneStop ESG 2026, verbatim: "even sharper premium" · qualitative; we do not invent numbers',
    },
    {
      name: 'Regulatory compliance CSRD · ESRS · ISSB',
      val: 'Significantly higher · no public number',
      flag: 'The market says "significantly higher pay" but publishes no figure',
      src: 'OneStop ESG 2026, verbatim: "significantly higher pay" · qualitative; we do not invent numbers',
    },
  ],
  whyTitle: 'Why is half the ladder empty?',
  whyBody1:
    'The market is visibly fighting over people who can run an LCA or land CSRD compliance, yet no clean premium number exists. That is not laziness; these skills are too new and the samples too scattered for any public survey to responsibly attach a percentage.',
  whyBody2:
    'I leave the empty bars empty because of a hard lesson: search-engine summaries stitch sources together into numbers that sound plausible and trace back to nothing. So this report has one internal rule: no figure appears here unless I opened the original page and saw it written there, word for word. The empty bars are the blue ocean no one can yet responsibly price.',
  s2Title: 'Direction first: green skills are becoming a value layer',
  triad: [
    { fig: '+46.6%', cap: 'Hiring-rate advantage of green-skilled workers over the overall workforce' },
    { fig: '53%', cap: 'Share of green-skill hires that landed in non-green job titles (first time above half)' },
    { fig: '7.7 / 4.3', cap: 'Green hiring grows 7.7% a year while skill supply grows 4.3%: demand runs almost twice as fast' },
  ],
  s2Body:
    'In plain terms: you do not need to change careers and become a "sustainability specialist". The better trade is welding green skills onto the profession you already have: accounting, supply chain, data, finance, so you become harder to replace inside your current title. Green skills are now a value layer, not a career restart.',
  s2Src: 'SRC | LinkedIn, 2025 Global Green Skills Report · verified via ESG Today',
  s3Title: 'The truth about certificates: they buy the door, not the raise',
  s3Intro:
    'The three certificates people ask about most, with cost, time, and what they actually buy, laid out side by side. All fees verified on official pages, in original currency.',
  certTable: {
    head: ['Certificate', 'Cost', 'Time', 'What it actually buys'],
    rows: [
      [
        'GARP SCR (climate risk)',
        'USD 525–750, retake 350',
        'One exam · months of self-study · 2026 window Oct 17–25',
        'The shared language of climate risk. Most useful on the finance, risk and asset-management track; it lets you talk to a risk desk in its own words.',
      ],
      [
        'CFA ESG (sustainable investing)',
        'USD 890',
        '100+ hours · 6 months · online self-study',
        'A systematic frame for investment-side ESG. The most direct route into asset management, banking and wealth; the CFA brand plus ESG is the standard door-knock for finance moving green.',
      ],
      [
        'ISO 14064 (lead verifier)',
        'Varies by provider; SkillsFuture-claimable in Singapore',
        'About a 4-day course · an operational qualification',
        'The operational licence to verify a carbon inventory. Most practical on the consulting, manufacturing and supply-chain track; it is also the entry tool for that 12–18% carbon-accounting premium.',
      ],
    ],
  },
  certBoxTitle: 'The number the last report left hanging: here is the rest of the sentence',
  certBoxBody1:
    'Certificates get you 5.4× more interview invitations and only 5.3% more pay. So be clear about what you are buying: the certificate opens the door; the raise depends on whether the skill behind that door actually lives in you.',
  certBoxBody2:
    'Your USD 890 does not buy the 12–18% premium. It buys eligibility to compete for it. What actually collects the premium is the next section: whether you can show a track record.',
  s4Title: 'Three profiles, three two-year routes',
  paths: [
    {
      who: 'Route one · Taiwan sustainability consultant · 1–4 yrs',
      head: 'Turn manufacturing carbon inventories into experience nobody can take from you',
      body: 'Your leverage is hands-on carbon-inventory work across Taiwan’s electronics supply chain, exactly what Singapore consultancies are short of. Bet on carbon accounting × Scope 3 (the one skill with a clean premium) and use ISO 14064 as the operational door-knock. Write the two-year goal as one sentence: "independently ran Scope 3 for N plants". Do not collect a fifth certificate.',
    },
    {
      who: 'Route two · Singapore corporate ESG manager · 4–8 yrs',
      head: 'Weld sustainability onto finance and regulation to reach the top of the tower',
      body: 'Your ceiling is not the word "sustainability"; it is whether you can plug sustainability numbers into financial statements. Bet on CSRD/ISSB compliance plus carbon accounting and move toward the role that connects sustainability to financial disclosure. In the public data, that is the only visible ladder to director and CSO.',
    },
    {
      who: 'Route three · finance background · moving into climate',
      head: 'Your moat is the finance others lack. Do not throw it away',
      body: 'Do not start from zero and compete on carbon inventories. Your value is "understands money and carbon", not "another person who can count carbon". Use CFA ESG or SCR to add the language of climate risk, and aim at Singapore sustainable finance: MAS is pushing it, the gap is hardest, and the top of that tower pays best.',
    },
  ],
  s5Title: 'Proving a skill: track record beats certificate',
  s5Intro:
    'The premium is not paid for what you know; it is paid for what you have done with it. The same skill, written differently, changes your leverage by an order of magnitude.',
  proofNoLabel: 'Not this',
  proofYesLabel: 'This',
  proofs: [
    {
      no: 'Holds ISO 14064 certification',
      yes: 'Verified Scope 1+2 inventories for 8 manufacturing plants under ISO 14064-3 and caught calculation errors in key emission sources',
    },
    {
      no: 'Familiar with CSRD/ISSB standards',
      yes: 'Led the migration of a company’s sustainability disclosure from GRI to ISSB S1/S2 and passed auditor review',
    },
    {
      no: 'Knows carbon accounting and Scope 3',
      yes: 'Built an upstream Scope 3 model and raised supplier data coverage from 30% to 80%',
    },
  ],
  ctaEyebrow: 'So, where are you on this map?',
  ctaTitle: 'This is the market’s map. The MRI places you on it in three minutes.',
  ctaBody:
    'Which certificate to bet on and which skill to close depends on your current combination, experience and target market. That is exactly what the free green-career MRI does: it places you on the map above and names the one gap most worth closing next.',
  ctaButton: 'Run the free green-career MRI →',
  ctaSub: 'About 5 minutes · free · no sign-up',
  prequelLine: 'New here? Part one covers what you are worth today:',
  prequelCta: '2026 APAC Green-Collar Salary Report →',
  sourcesLabel: 'Method and sources',
  method:
    'Cross-checked against public web sources in July 2026. Every figure keeps its original range; no false precision. Skills without a clean public number (LCA, climate-risk modelling, regulatory compliance) are labelled "no public number" rather than estimated. ISO 14064 fees vary by training provider, so we state the format and Singapore SkillsFuture claimability without quoting an unverified price.',
  verify:
    'Verification discipline: every specific figure in this report was confirmed by opening the claimed source’s original page and reading it word for word. Three numbers that looked right in search summaries but could not be found, or differed, on the original pages were dropped. Search summaries are used for wayfinding, never as evidence.',
  sources: [
    {
      code: 'OS',
      name: 'OneStop ESG, 2026 Sustainability Salary Survey',
      note: 'n=2,147 · 42 countries (NA 52% / EU 28% / MEA 11% / APAC 9%) · carbon accounting Scope 3 +12–18%, AI×green +10–15% (APAC 18%)',
    },
    {
      code: 'MP',
      name: 'Michael Page, Singapore Salary Guide 2026',
      note: 'Sustainability/ESG roles: 2026 raises of 7–10%, senior roles 15% (reporting / decarbonisation / sustainable finance)',
    },
    {
      code: 'LI',
      name: 'LinkedIn, 2025 Global Green Skills Report',
      note: 'Green-talent hiring rate +46.6%, 53% of green-skill hires in non-green titles, hiring growth 7.7% vs supply 4.3%',
    },
    {
      code: 'RC',
      name: 'Reeracoen, Singapore Salary Guide 2026',
      note: 'ESG manager / carbon-accounting analyst overall raises +5–6% (agency self-reported)',
    },
    {
      code: 'GARP',
      name: 'GARP official SCR fee page',
      note: '2026 exam USD 525–750 (by membership) · retake 350 · window Oct 17–25',
    },
    {
      code: 'CFA',
      name: 'CFA Institute official page',
      note: 'Sustainable Investing Certificate (formerly ESG Certificate) USD 890 · 100+ hours · 6 months',
    },
  ],
  footer:
    '© 2026 AhaMoment green-collar intelligence · This report is a synthesis of market information, not personal career, investment or migration advice · Every figure carries its source and keeps its range; skills without a clean number are marked "no public number" rather than estimated. Premiums reflect the survey moment; certificate fees and exam schedules follow official announcements.',
};

export const levelupReports: Record<Locale, LevelupReport> = { 'zh-TW': zhTW, en };
