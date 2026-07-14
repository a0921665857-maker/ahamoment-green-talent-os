import type { Locale } from '@/lib/constants';

/**
 * MBA ROI 計算器 — a free, client-side tool at /[locale]/mba-roi.
 * Standalone, locale-keyed content (mirrors greenJobs / salaryReport) so it stays
 * out of the getContent schema.
 *
 * No LLM, no API, no network: every number is typed by the reader and computed in
 * the browser. The honest caveats (`caveats`) are part of the product, not garnish.
 *
 * Style: zh-TW uses full-width punctuation（，。：？「」《》）, no em-dash「——」,
 * written in Michael's own voice. Figures carry a currency prefix, never an FX rate.
 */

/** Display-only. We never convert between these (see `caveats`). */
export const MBA_CURRENCIES = ['TWD', 'SGD', 'USD'] as const;
export type MbaCurrency = (typeof MBA_CURRENCIES)[number];

export const CURRENCY_PREFIX: Record<MbaCurrency, string> = {
  TWD: 'NT$',
  SGD: 'S$',
  USD: 'US$',
};

export type ProgrammeYears = 1 | 2;

export interface MbaRoiDefaults {
  currency: MbaCurrency;
  currentSalary: number;
  tuition: number;
  years: ProgrammeYears;
  scholarship: number;
  futureSalary: number;
}

interface Field {
  label: string;
  help: string;
}

export interface MbaRoiCopy {
  meta: { title: string; description: string };
  eyebrow: string;
  title: string;
  lede: string;
  scene: string;
  scenePunch: string;
  backToMri: string;

  /** Pre-filled so the page is useful before a single keystroke. All editable. */
  defaults: MbaRoiDefaults;

  formTitle: string;
  formNote: string;
  currencyLabel: string;
  fields: {
    currentSalary: Field;
    tuition: Field;
    years: Field & { one: string; two: string };
    scholarship: Field;
    futureSalary: Field;
  };
  salaryReportLinkLead: string;
  salaryReportLinkText: string;
  resetLabel: string;

  resultsTitle: string;
  results: {
    totalInvested: Field;
    netCost: Field;
    salaryLift: Field;
    payback: Field;
    tenYear: Field;
  };
  breakdownTuition: string;
  opportunityLabel: string;

  paybackUnit: string;
  /** Shown instead of a figure when the salary lift is ≤ 0. Never Infinity, never NaN. */
  paybackNever: string;
  /** {years} and {net} are substituted by the calculator. */
  verdictOk: string;
  verdictOkNegative: string;
  verdictNever: string;
  verdictInstant: string;

  caveatsTitle: string;
  caveats: string[];
  caveatsClose: string;

  greenTitle: string;
  greenBody: string;
  greenLink: string;

  ctaEyebrow: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  ctaSub: string;
}

const zhTW: MbaRoiCopy = {
  meta: {
    title: 'MBA ROI 計算器：這個 MBA 到底值不值得？',
    description:
      '把學費、機會成本、獎學金和預估畢業後年薪放進同一張表，算出回本年數與十年累積淨效益。純瀏覽器計算，不含稅、不換匯、不保證薪資。給正在考慮用 MBA 轉進綠領、永續、ESG 職涯的人。',
  },
  eyebrow: '免費工具',
  title: '這個 MBA，到底值不值得？',
  lede: '三十秒把帳算開。純瀏覽器計算，你填的數字不會離開這一頁，我們也不會存。',
  scene:
    '有人為了決定要不要去念這個 MBA，前後算了半年，每次算完的結論都不一樣。他一直漏掉同一筆錢：辭職去念書的那一兩年，他沒領到的薪水。學費是看得見的支出，那筆薪水看不見，但它常常比學費還大。',
  scenePunch: '這個計算器只做一件事：把兩筆錢一起放上桌，然後告訴你要幾年才拿得回來。',
  backToMri: '← 回到免費 MRI',

  defaults: {
    currency: 'TWD',
    currentSalary: 900_000,
    tuition: 2_500_000,
    years: 1,
    scholarship: 0,
    futureSalary: 1_600_000,
  },

  formTitle: '你的數字',
  formNote: '所有欄位請填同一個幣別。我們不做匯率換算，幣別只影響顯示。',
  currencyLabel: '幣別',
  fields: {
    currentSalary: {
      label: '目前年薪',
      help: '稅前，含固定獎金。這一格同時決定你的機會成本。',
    },
    tuition: {
      label: '學費總額',
      help: '整個學程加起來的學費，不只一年份。',
    },
    years: {
      label: '學制年數',
      help: '你會離開職場多久。兩年制的機會成本是一年制的兩倍。',
      one: '1 年',
      two: '2 年',
    },
    scholarship: {
      label: '獎學金金額',
      help: '沒有就填 0。這筆錢直接從成本裡扣掉。',
    },
    futureSalary: {
      label: '預估畢業後年薪',
      help: '別填夢想數字。用真實的薪資帶去填，算出來的東西才有用。',
    },
  },
  salaryReportLinkLead: '不知道綠領職缺實際開多少？',
  salaryReportLinkText: '看《2026 亞太綠領薪資報告》的真實薪資帶 →',
  resetLabel: '回到預設值',

  resultsTitle: '算出來的結果',
  results: {
    totalInvested: {
      label: '總投入',
      help: '學費，加上你為了去念書放棄的薪水。',
    },
    netCost: {
      label: '淨成本',
      help: '總投入扣掉獎學金。這才是你真正掏出去的錢。',
    },
    salaryLift: {
      label: '年薪增幅',
      help: '預估畢業後年薪減掉你現在的年薪。',
    },
    payback: {
      label: '回本年數',
      help: '淨成本除以年薪增幅。這裡假設加完那一次薪之後，你的薪水就停在原地不動。',
    },
    tenYear: {
      label: '10 年累積淨效益',
      help: '年薪增幅乘以十年，再扣掉淨成本。',
    },
  },
  breakdownTuition: '學費',
  opportunityLabel: '機會成本',

  paybackUnit: '年',
  paybackNever: '回不了本',
  verdictOk: '照這組數字，大約 {years} 年回本。撐到第十年結算，你比不去念多出 {net}。',
  verdictOkNegative:
    '照這組數字，大約 {years} 年回本。但十年還不夠久：第十年結算，你還差 {net} 才追平。',
  verdictNever:
    '照這組數字，這個 MBA 回不了本。你填的畢業後年薪沒有比現在高，成本就沒有東西可以攤。要嘛這個數字填低了，要嘛這個 MBA 的價值根本不在薪水上，而那一塊，這個計算器算不出來。',
  verdictInstant:
    '獎學金蓋掉了全部的成本，帳面上你第一天就回本。剩下要問的只有一件事：這一兩年你想怎麼過。',

  caveatsTitle: '這個計算器沒有算進去的東西',
  caveats: [
    '不含稅。學費、薪水、增幅全部是稅前數字，實際落袋的一定更少。',
    '不做匯率換算。三種幣別只是顯示用。你在台灣領台幣、去新加坡領新幣，這裡不會幫你換，請自己先統一成同一個幣別再填。',
    '不保證薪資。「預估畢業後年薪」是你自己填的假設，市場不欠你這個數字。',
    '機會成本假設你在學期間零收入。有在打工、有實習、有存款利息的人，實際成本會比這裡低。',
    '人脈、選擇權、換一種活法的可能，這些算不出來，所以沒放進來。它們可能才是你真正要買的東西。',
  ],
  caveatsClose:
    '這是一個幫你把帳算開的工具，不是一個叫你去念的工具。數字算完，決定還是你自己下。',

  greenTitle: '如果你是為了綠領職涯在考慮 MBA',
  greenBody:
    '「預估畢業後年薪」是最容易填錯的一格，因為多數人是用想像填的。綠色、永續、ESG 這幾條線實際開多少，我們把新加坡和台灣的公開薪資指南、官方就業報告、求職平台數據全翻過一遍，寫成一份報告。用裡面的真實薪資帶回來填這一格，你算出來的回本年數才不是幻覺。',
  greenLink: '打開《2026 亞太綠領薪資報告》→',

  ctaEyebrow: '算完之後',
  ctaTitle: '帳算得出來，故事算不出來。',
  ctaBody:
    '回本年數只回答「值不值」。真正決定你申請上不上、畢業後有沒有人要的，是你能不能把過去那些散落的經歷講成一條線。綠領 MRI 免費幫你把履歷對到市場缺口，三分鐘告訴你哪一塊撐得住、哪一塊還是空的。',
  ctaButton: '做一次綠領 MRI（免費）→',
  ctaSub: '不用付費，不用綁卡，三分鐘。',
};

const en: MbaRoiCopy = {
  meta: {
    title: 'MBA ROI calculator: is this MBA actually worth it?',
    description:
      'Put tuition, opportunity cost, scholarship and your expected post-MBA salary into one table, and get the payback period and 10-year net benefit. Runs in your browser. No tax, no FX conversion, no salary guarantees. Built for people weighing an MBA for a green, sustainability or ESG career.',
  },
  eyebrow: 'Free tool',
  title: 'Is this MBA actually worth it?',
  lede: 'Thirty seconds to get the maths on the table. It runs in your browser: the numbers you type never leave this page, and we never store them.',
  scene:
    'Someone spent half a year deciding whether to do an MBA and got a different answer every time he ran the numbers. He kept missing the same line item: the salary he would not earn during the year or two he was out of work. Tuition is the cost you can see. The forgone salary is the one you can’t, and it is usually the bigger of the two.',
  scenePunch:
    'This calculator does one thing: it puts both costs on the table and tells you how many years it takes to get them back.',
  backToMri: '← Back to the free MRI',

  defaults: {
    currency: 'SGD',
    currentSalary: 90_000,
    tuition: 120_000,
    years: 1,
    scholarship: 0,
    futureSalary: 140_000,
  },

  formTitle: 'Your numbers',
  formNote:
    'Use one currency for every field. We don’t convert FX; the currency only changes how figures are displayed.',
  currencyLabel: 'Currency',
  fields: {
    currentSalary: {
      label: 'Current annual salary',
      help: 'Pre-tax, including fixed bonus. This field also sets your opportunity cost.',
    },
    tuition: {
      label: 'Total tuition',
      help: 'The whole programme added up, not one year of it.',
    },
    years: {
      label: 'Programme length',
      help: 'How long you are out of the workforce. Two years doubles the opportunity cost.',
      one: '1 year',
      two: '2 years',
    },
    scholarship: {
      label: 'Scholarship',
      help: 'Enter 0 if you have none. It comes straight off the cost.',
    },
    futureSalary: {
      label: 'Expected post-MBA salary',
      help: 'Not the dream number. Use a real salary band or the result is fiction.',
    },
  },
  salaryReportLinkLead: 'Not sure what green-collar roles actually pay?',
  salaryReportLinkText: 'See the real bands in the 2026 APAC Green-Collar Salary Report →',
  resetLabel: 'Reset to defaults',

  resultsTitle: 'What the numbers say',
  results: {
    totalInvested: {
      label: 'Total invested',
      help: 'Tuition, plus the salary you give up to go.',
    },
    netCost: {
      label: 'Net cost',
      help: 'Total invested minus the scholarship. This is what actually leaves your pocket.',
    },
    salaryLift: {
      label: 'Salary lift',
      help: 'Expected post-MBA salary minus what you earn now.',
    },
    payback: {
      label: 'Years to break even',
      help: 'Net cost divided by the salary lift. It assumes that after that one raise, your pay stays flat.',
    },
    tenYear: {
      label: '10-year net benefit',
      help: 'Salary lift times ten, minus the net cost.',
    },
  },
  breakdownTuition: 'tuition',
  opportunityLabel: 'opportunity cost',

  paybackUnit: 'years',
  paybackNever: 'Never pays back',
  verdictOk:
    'On these numbers you break even in about {years} years. By year ten you are {net} ahead of not going.',
  verdictOkNegative:
    'On these numbers you break even in about {years} years. But ten years isn’t long enough: at year ten you are still {net} short.',
  verdictNever:
    'On these numbers this MBA never pays back. The post-MBA salary you entered is no higher than what you earn now, so there is nothing to amortise the cost against. Either that number is too low, or the value of this MBA sits somewhere other than salary, and that part is not something this calculator can price.',
  verdictInstant:
    'The scholarship covers the entire cost, so on paper you break even on day one. The only question left is how you want to spend the next year or two.',

  caveatsTitle: 'What this calculator leaves out',
  caveats: [
    'No tax. Tuition, salary and lift are all pre-tax figures, so what you actually keep is less.',
    'No FX conversion. The three currencies are display labels. If you earn in TWD and would be paid in SGD, convert the numbers yourself before entering them.',
    'No salary guarantee. “Expected post-MBA salary” is an assumption you typed in. The market doesn’t owe it to you.',
    'Opportunity cost assumes you earn nothing while studying. If you work, intern, or have interest income, your real cost is lower than this.',
    'Network, optionality, the chance to live a different life: none of it is countable, so none of it is in here. It may be the thing you are actually buying.',
  ],
  caveatsClose:
    'This tool exists to open the books, not to talk you into an MBA. Once the numbers are on the table, the decision is still yours.',

  greenTitle: 'If you are weighing an MBA for a green-collar career',
  greenBody:
    'The expected post-MBA salary is the field people get wrong, because most people fill it with a guess. We went through the public salary guides, official employment reports and job-board data for Singapore and Taiwan, and wrote up what green, sustainability and ESG roles actually pay. Take a number from there, come back, and your payback period stops being a fantasy.',
  greenLink: 'Open the 2026 APAC Green-Collar Salary Report →',

  ctaEyebrow: 'After the maths',
  ctaTitle: 'The books you can balance. The story you can’t.',
  ctaBody:
    'A payback period only answers “is it worth it”. What decides whether you get in, and whether anyone wants you afterwards, is whether you can tell your scattered experience as one line. The green-collar MRI maps your CV against the market gap for free: three minutes to see which parts hold up and which are still empty.',
  ctaButton: 'Take the green-collar MRI (free) →',
  ctaSub: 'No payment, no card, three minutes.',
};

export const mbaRoiCopy: Record<Locale, MbaRoiCopy> = { 'zh-TW': zhTW, en };
