// 市場脈搏 — MRI 報告頁的當週市場訊號區塊。
// 資料紀律與 salaryBands 同級:人工策展、來源可指、絕不 LLM 生成;
// 每週日由 green-jobs-weekly 管線更新本檔(與職缺頁同一次獨立稽核、同一次放行)。
// updatedAt 超過 STALE_DAYS 未更新時區塊整個不渲染,寧可消失不可過期。

export const MARKET_PULSE_STALE_DAYS = 21;

export interface MarketPulseItem {
  /** 掛出日,YYYY-MM-DD */
  posted: string;
  roleZh: string;
  roleEn: string;
  org: string;
  /** 職缺自己揭露的月薪帶(Tier 1),原幣原樣;查無則整筆不收 */
  salary: string;
  /** 原始職缺頁,入檔前親測有效 */
  url: string;
}

export interface MarketPulseCopy {
  eyebrow: string;
  intro: string;
  reading: string;
  sourceNote: string;
  jobsCta: string;
}

export const marketPulse = {
  updatedAt: '2026-07-22',
  items: [
    {
      posted: '2026-07-21',
      roleZh: '氣候政策與碳市場專員(約聘)',
      roleEn: 'Climate Policy & Carbon Markets Specialist (Contract)',
      org: 'Manpower 代招/agency posting',
      salary: 'S$7,000–8,800/月',
      url: 'https://www.mycareersfuture.gov.sg/job/environment/climate-policy-carbon-markets-specialist-contract-manpower-staffing-services-b93d37281635c02717b3f44838661abd',
    },
    {
      posted: '2026-07-21',
      roleZh: 'ESG 顧問副總監(轉型與變革)',
      roleEn: 'Associate Director, ESG Consulting (Transition & Transformation)',
      org: 'KPMG',
      salary: 'S$9,000–17,000/月',
      url: 'https://www.mycareersfuture.gov.sg/job/consulting/associate-director-esg-consulting-kpmg-services-6b1d7a5f5b63f669d73518837aa0589d',
    },
    {
      posted: '2026-07-14',
      roleZh: '碳交易台計畫總監',
      roleEn: 'Program Director, Carbon Trading Desk',
      org: '129 Knots',
      salary: 'S$12,000–20,000/月',
      url: 'https://www.mycareersfuture.gov.sg/job/consulting/program-director-carbon-trading-desk-129-knots-2067dd222cd138e3f6231167c7261e57',
    },
  ] satisfies MarketPulseItem[],
  zh: {
    eyebrow: '市場脈搏',
    intro: '你的診斷不是對著真空講的。這份報告產出的當週,新加坡綠領市場真實掛出的含薪職缺:',
    reading: '本週抓到的含薪新掛集中在碳市場與 ESG 轉型顧問兩條線,職缺頁自己揭露的月薪帶如上。',
    sourceNote: '來源:MyCareersFuture(新加坡政府職缺庫,法規要求揭薪)。連結入檔當日逐一驗證,職缺隨時可能關閉。',
    jobsCta: '本週完整精選與點評 →',
  } satisfies MarketPulseCopy,
  en: {
    eyebrow: 'Market pulse',
    intro: 'Your diagnosis is not made in a vacuum. Salary-disclosed green roles posted in Singapore the week this report was generated:',
    reading: 'This week’s salary-disclosed postings cluster in carbon markets and ESG transition consulting; monthly bands above are disclosed by the postings themselves.',
    sourceNote: 'Source: MyCareersFuture (Singapore government job portal; salary disclosure required by regulation). Links verified the day of entry; postings can close at any time.',
    jobsCta: 'Full weekly picks and commentary →',
  } satisfies MarketPulseCopy,
};

/** 距離 updatedAt 超過 STALE_DAYS 就把整個區塊藏起來(寧可消失不可過期)。 */
export function isMarketPulseFresh(updatedAt: string, now: Date = new Date()): boolean {
  const updated = new Date(`${updatedAt}T00:00:00+08:00`).getTime();
  if (Number.isNaN(updated)) return false;
  const ageDays = (now.getTime() - updated) / 86_400_000;
  return ageDays >= 0 && ageDays <= MARKET_PULSE_STALE_DAYS;
}
