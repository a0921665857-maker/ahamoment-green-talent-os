import type { Locale } from '@/lib/constants';

/**
 * 異地生活成本指南 — a public lead-magnet article at /[locale]/cost-of-living.
 * Companion to the salary report: that one says pay is 2 to 3× higher; this one
 * subtracts the cost of living and shows what actually reaches your pocket.
 *
 * Style: zh-TW full-width punctuation（，。：；？「」（）), no em-dash「——」,
 * Michael's own first-person voice. FX: 1 SGD ≈ 25 TWD (site-wide).
 * Every figure carries a source; ranges only, no false precision.
 */
export interface CostTable {
  head: string[];
  rows: string[][];
}

export interface VerdictRow {
  stage: string;
  nominal: string;
  disposable: string;
  note: string;
}

export interface CostOfLiving {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lede: string;
  byline: string;
  backToMri: string;
  hook: string;
  sgTitle: string;
  sgNote: string;
  sgTable: CostTable;
  sgAfter: string;
  twTitle: string;
  twNote: string;
  twTable: CostTable;
  twAfter: string;
  verdictTitle: string;
  verdictIntro: string;
  verdictHead: string[];
  verdictRows: VerdictRow[];
  insightLabel: string;
  insight: string;
  caveat: string;
  salaryReportCta: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  ctaSub: string;
  sourcesLabel: string;
  method: string;
  sources: { label: string; url: string; note: string }[];
  footer: string;
}

const zhTW: CostOfLiving = {
  meta: {
    title: '新加坡 vs 台北：薪水多兩三倍，一個月實際要花多少？',
    description:
      '薪資報告說綠領跨海薪水差 2 到 3 倍。這頁把房租、水電、交通、伙食一項一項扣掉，算出真正進到你口袋的倍數。附來源，只給區間，不做假精確。',
  },
  eyebrow: '綠領情報 · 異地生活成本',
  title: '薪水多兩三倍，那一個月到底要花多少？',
  lede: '我在薪資報告裡說，同職能同資歷，新加坡的名目薪水大約是台灣的 2 到 3 倍。這是真的。但每次有人看到那個數字就想訂機票，我都想補一句：先算算一個月要花多少。這頁就是把房租、水電、交通、伙食一項一項扣掉，看真正剩下多少。',
  byline: '資料時點 2026 年 7 月 · 匯率 1 SGD ≈ 25 TWD · 每個數字都附來源',
  backToMri: '← 回到免費 MRI',
  hook: '先講結論，因為它跟大部分人想的不一樣：新加坡的生活成本，幾乎把「入門段」的薪資優勢吃光；但資歷一上去，那個倍數才真的落到你口袋。下面是算式。',
  sgTitle: '新加坡：一個月要花多少',
  sgNote: '新加坡幣 / 月 · 三種生活方式',
  sgTable: {
    head: ['項目', '省一點（合租）', '一般（市郊一房）', '市中心一房'],
    rows: [
      ['房租', 'S$1,200–1,800', 'S$1,500–3,500', 'S$2,277–5,000'],
      ['水電網路', 'S$80–150', 'S$200–300', 'S$200–300'],
      ['交通', 'S$100–150', 'S$100–200', 'S$100–200'],
      ['伙食', 'S$500–700', 'S$700–1,000', 'S$800–1,200'],
      ['雜支', 'S$150–300', 'S$200–400', 'S$300–500'],
      ['一個月大約', 'S$2,100–3,100', 'S$2,700–5,400', 'S$3,700–7,200'],
    ],
  },
  sgAfter:
    'Numbeo 給的單身總計是每月 S$4,894（其中市中心一房租金 S$3,429），對照上表的「市中心」欄大致吻合。這裡我要老實說一件事：新加坡的租金區間拉得非常開，合租一個房間和市中心一房的差距可以到三倍，所以「新加坡生活費多少」這個問題沒有單一答案，取決於你願意住成什麼樣。',
  twTitle: '台北：一個月要花多少',
  twNote: '新台幣 / 月 · 兩種生活方式',
  twTable: {
    head: ['項目', '省一點', '一般'],
    rows: [
      ['房租（套房）', 'NT$9,000–15,000', 'NT$17,000–20,000'],
      ['水電網路與雜支', 'NT$3,000', 'NT$4,000–5,000'],
      ['交通', 'NT$1,200（都會通月票）', 'NT$1,200–2,000'],
      ['伙食', 'NT$8,000', 'NT$9,000–10,000'],
      ['一個月大約', 'NT$21,000–27,000', 'NT$31,000–37,000'],
    ],
  },
  twAfter:
    '主計處口徑與媒體整理的「北部單身基本開銷」大約落在每月 NT$32,000 到 35,000，跟上表的「一般」欄對得起來。房租的差距一樣很大：南港、大同的套房九千到一萬五就有，大安、中山的獨立套房中位數要一萬七到兩萬。',
  verdictTitle: '真正的倍數：扣掉生活成本之後',
  verdictIntro:
    '把上面的開銷扣掉，再把新加坡明顯較低的個人所得稅算進去，得到的是「實際可支配所得」的倍數。這才是你口袋裡真正的差距。',
  verdictHead: ['資歷段', '名目薪資倍數', '可支配倍數', '為什麼'],
  verdictRows: [
    {
      stage: '入門 1 到 3 年',
      nominal: '約 2.4 倍',
      disposable: '約 1.6 倍',
      note: '新加坡入門薪水不高，但生活成本是固定的一大塊，等於先被吃掉一大口。',
    },
    {
      stage: '中段 4 到 8 年',
      nominal: '約 3 倍',
      disposable: '約 2.5 倍',
      note: '薪水漲了，生活成本沒等比例漲，被吃掉的比例就變小。',
    },
  ],
  insightLabel: '這頁最重要的一句話',
  insight:
    '如果你 0 到 3 年就跳過去，帳面很香，口袋其實沒差多少。等到 4 年以上再跳，那個倍數才真的落到你手上。這跟薪資報告裡講的「EP 月薪門檻 S$5,600，4 年以上勝率才明顯提高」，其實是同一件事的兩面：市場和你的錢包，都在告訴你不要太早跳。',
  caveat:
    '幾個我得先講清楚的地方。第一，這裡的稅只做粗略估算，新加坡個人所得稅明顯低於台灣高薪級距，但實際金額看你的稅務居民身分與扣除額。第二，我沒有把匯率波動、寄錢回家、保險、醫療、回台機票這些算進去，你自己要加。第三，租金區間拉得很開，你住成什麼樣，會直接改寫整張表。這是一張幫你把帳算開的表，不是一個叫你跳或不跳的答案。',
  salaryReportCta: '先看薪資報告：那 2 到 3 倍是怎麼來的 →',
  ctaTitle: '那，以你現在的條件，值得跳嗎？',
  ctaBody:
    '這頁給的是成本的帳。你自己的那一半，要看你的技能組合、資歷和目標市場，這正是綠領 MRI 免費在做的事：把你放進真實的薪資帶，告訴你缺哪一塊、什麼時候跳才划算。',
  ctaButton: '做一次綠領 MRI（免費）→',
  ctaSub: '大約 5 分鐘 · 免費 · 免註冊',
  sourcesLabel: '來源與方法',
  method:
    '2026 年 7 月以公開來源交叉查證。所有數字一律給區間，不做假精確。匯率用 1 SGD ≈ 25 TWD（與本站薪資報告一致）。薪資帶取自本站的《2026 亞太綠領薪資報告》。可支配倍數是我用上面的開銷與粗估稅負算出來的，屬於推估，換一種生活方式數字就會變。',
  sources: [
    { label: 'Numbeo · Singapore', url: 'https://www.numbeo.com/cost-of-living/in/Singapore', note: '新加坡租金、水電、伙食、單身月開銷' },
    { label: 'Wise · Taipei', url: 'https://wise.com/us/cost-of-living/taiwan/taipei', note: '台北生活成本對照' },
    { label: '台北租金行情 2026', url: 'https://www.inn-taipei.com/rental-fee-2026/', note: '各行政區套房租金中位數' },
    { label: '風傳媒引主計處', url: 'https://www.storm.mg/lifestyle/11049312', note: '北部單身基本開銷約 NT$32,000–35,000' },
    { label: '2026 台灣生活費計算器', url: 'https://taiwanhousing.tw/tw/cost-of-living/taiwan', note: '台灣生活費分項' },
    { label: '本站薪資報告', url: '/zh-TW/salary-report', note: '名目薪資帶與 2 到 3 倍的來源' },
  ],
  footer:
    '© 2026 AhaMoment 綠領情報 · 本頁是市場資訊彙整，不是個人財務或移民建議 · 數字都附來源、保留區間，推估已標註。',
};

const en: CostOfLiving = {
  meta: {
    title: 'Singapore vs Taipei: the pay is 2–3× higher, but what does a month actually cost?',
    description:
      'The salary report says green-collar pay is 2–3× higher across the strait. This page subtracts rent, utilities, transport and food to show what actually reaches your pocket. Sourced, ranges only, no false precision.',
  },
  eyebrow: 'Green-Collar Intel · Cost of Living',
  title: 'The pay is 2–3× higher. So what does a month actually cost?',
  lede: 'In the salary report I said that for the same role and seniority, Singapore’s nominal pay is roughly 2 to 3× Taiwan’s. That’s true. But every time someone sees that number and starts pricing flights, I want to add one line: first work out what a month costs. This page subtracts rent, utilities, transport and food, item by item, to see what’s left.',
  byline: 'Data as of July 2026 · FX 1 SGD ≈ 25 TWD · Every figure cites a source',
  backToMri: '← Back to the free MRI',
  hook: 'The conclusion first, because it isn’t what most people expect: Singapore’s cost of living all but eats the entry-level pay advantage. Only once you have seniority does that multiple actually land in your pocket. Here’s the maths.',
  sgTitle: 'Singapore: what a month costs',
  sgNote: 'SGD / month · three ways to live',
  sgTable: {
    head: ['Item', 'Lean (shared)', 'Normal (suburb 1BR)', 'City-centre 1BR'],
    rows: [
      ['Rent', 'S$1,200–1,800', 'S$1,500–3,500', 'S$2,277–5,000'],
      ['Utilities & internet', 'S$80–150', 'S$200–300', 'S$200–300'],
      ['Transport', 'S$100–150', 'S$100–200', 'S$100–200'],
      ['Food', 'S$500–700', 'S$700–1,000', 'S$800–1,200'],
      ['Everything else', 'S$150–300', 'S$200–400', 'S$300–500'],
      ['Roughly per month', 'S$2,100–3,100', 'S$2,700–5,400', 'S$3,700–7,200'],
    ],
  },
  sgAfter:
    'Numbeo puts a single person at S$4,894/month (including S$3,429 for a city-centre one-bed), which lines up with the city-centre column. One honest note: Singapore rent spreads enormously. A room in a shared flat versus a city-centre one-bed can differ threefold, so “what does Singapore cost” has no single answer. It depends on how you’re willing to live.',
  twTitle: 'Taipei: what a month costs',
  twNote: 'TWD / month · two ways to live',
  twTable: {
    head: ['Item', 'Lean', 'Normal'],
    rows: [
      ['Rent (studio)', 'NT$9,000–15,000', 'NT$17,000–20,000'],
      ['Utilities, internet & bits', 'NT$3,000', 'NT$4,000–5,000'],
      ['Transport', 'NT$1,200 (metro pass)', 'NT$1,200–2,000'],
      ['Food', 'NT$8,000', 'NT$9,000–10,000'],
      ['Roughly per month', 'NT$21,000–27,000', 'NT$31,000–37,000'],
    ],
  },
  twAfter:
    'Official and media figures for a single person’s baseline cost in northern Taiwan land around NT$32,000–35,000/month, matching the “normal” column. Rent spreads here too: a studio in Nangang or Datong runs NT$9,000–15,000, while an independent studio in Daan or Zhongshan sits at a NT$17,000–20,000 median.',
  verdictTitle: 'The real multiple, net of living costs',
  verdictIntro:
    'Subtract the costs above, factor in Singapore’s markedly lower personal income tax, and you get the multiple on disposable income. That is the gap that actually reaches your pocket.',
  verdictHead: ['Stage', 'Nominal multiple', 'Disposable multiple', 'Why'],
  verdictRows: [
    {
      stage: 'Entry, 1–3 yrs',
      nominal: '~2.4×',
      disposable: '~1.6×',
      note: 'Entry pay in Singapore isn’t high, but living costs are a fixed block that takes a big bite up front.',
    },
    {
      stage: 'Mid, 4–8 yrs',
      nominal: '~3×',
      disposable: '~2.5×',
      note: 'Pay rises while living costs don’t rise proportionally, so the share they eat shrinks.',
    },
  ],
  insightLabel: 'The one line that matters',
  insight:
    'Move across at 0–3 years and the headline looks great while your pocket barely notices. Move at 4+ years and the multiple actually lands on you. This is the same thing the salary report says from another angle: the EP salary threshold is S$5,600, and your odds improve markedly at 4+ years. The market and your wallet are both telling you not to jump too early.',
  caveat:
    'A few things I need to be straight about. First, tax here is a rough estimate; Singapore’s personal income tax is clearly lower than Taiwan’s high brackets, but your actual bill depends on tax residency and reliefs. Second, I haven’t included FX swings, money sent home, insurance, healthcare or flights back to Taiwan; add your own. Third, rent spreads so widely that how you choose to live rewrites the whole table. This is a sheet to open up the maths, not an answer telling you to go or stay.',
  salaryReportCta: 'Read the salary report first: where the 2–3× comes from →',
  ctaTitle: 'So, given where you are, is it worth the move?',
  ctaBody:
    'This page gives you the cost side. Your half depends on your skill combination, seniority and target market, which is exactly what the free green-collar MRI does: it places you into the real bands and tells you what’s missing and when moving actually pays.',
  ctaButton: 'Take the green-collar MRI (free) →',
  ctaSub: 'About 5 min · Free · No signup',
  sourcesLabel: 'Sources & method',
  method:
    'Cross-checked against public sources in July 2026. Every figure is a range, with no false precision. FX: 1 SGD ≈ 25 TWD (consistent with the salary report on this site). Salary bands come from the 2026 APAC Green-Collar Salary Report here. The disposable multiples are my own estimate from the costs above plus a rough tax assumption; change how you live and the numbers move.',
  sources: [
    { label: 'Numbeo · Singapore', url: 'https://www.numbeo.com/cost-of-living/in/Singapore', note: 'SG rent, utilities, food, single-person monthly' },
    { label: 'Wise · Taipei', url: 'https://wise.com/us/cost-of-living/taiwan/taipei', note: 'Taipei cost-of-living comparison' },
    { label: 'Taipei rent guide 2026', url: 'https://www.inn-taipei.com/rental-fee-2026/', note: 'Median studio rent by district' },
    { label: 'Storm Media citing DGBAS', url: 'https://www.storm.mg/lifestyle/11049312', note: 'Single-person baseline ~NT$32,000–35,000/mo in northern Taiwan' },
    { label: '2026 Taiwan cost calculator', url: 'https://taiwanhousing.tw/tw/cost-of-living/taiwan', note: 'Taiwan cost breakdown' },
    { label: 'Salary report (this site)', url: '/en/salary-report', note: 'Nominal bands and the source of the 2–3×' },
  ],
  footer:
    '© 2026 AhaMoment Green-Collar Intel · Market information, not personal financial or immigration advice · Figures cite sources and keep ranges; estimates are flagged.',
};

export const costOfLiving: Record<Locale, CostOfLiving> = {
  'zh-TW': zhTW,
  en,
};
