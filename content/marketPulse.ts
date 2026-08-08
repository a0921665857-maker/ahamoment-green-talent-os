// 市場脈搏 — MRI 報告頁的當週市場訊號區塊。
// 資料紀律與 salaryBands 同級:人工策展、來源可指、絕不 LLM 生成;
// 每週日由 green-jobs-weekly 管線更新本檔(與職缺頁同一次獨立稽核、同一次放行)。
// updatedAt 超過 STALE_DAYS 未更新時區塊整個不渲染,寧可消失不可過期。
//
// 文案不寫「本週」(2026-08-08 內容鮮度盤點)。這張卡最長可以活 21 天,所以
// 「本週抓到的」在第 20 天就是假話;而且它的 CTA 原本叫「本週完整精選」,指向的
// /jobs 已經改叫「精選職缺」,連名字都對不上。現在一律寫「最近一次掃描」,那句話
// 在整個 21 天視窗內都為真,而卡片自己就印著 updatedAt 讓讀者自己判斷有多新。

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
  updatedAt: '2026-08-09',
  items: [
    {
      posted: '2026-08-07',
      roleZh: '永續溝通經理／主管',
      roleEn: 'Sustainability Communications Manager / Lead',
      org: 'Michael Page 代招／agency posting（金融業）',
      salary: 'S$12,500–14,000/月',
      url: 'https://www.mycareersfuture.gov.sg/job/banking-finance/sustainability-communications-manager-lead-michael-page-7d128c9695745f03700e8c77051a569c',
    },
    {
      posted: '2026-08-05',
      roleZh: '策略永續經理（永續天然橡膠）',
      roleEn: 'Strategic Sustainability Manager — Sustainable Natural Rubber',
      org: 'Continental Tires',
      salary: 'S$7,500–12,000/月',
      url: 'https://www.mycareersfuture.gov.sg/job/others/strategic-sustainability-manager-sustainable-natural-rubber-continental-tires-holding-singapore-fb03e232c74f3a2c57ce5779333c9b69',
    },
    // 2026-08-09 換批。上一批兩則的下場正好說明這張卡為什麼要有保存期限：
    // KPMG 那則 08-04 已 Closed（讀者當天點進去就撲空），Manpower 那則 08-11 到期。
    // 本批兩則於 2026-08-09 在 MCF 頁面上逐字驗過薪資與未關閉狀態，
    // closing date 分別是 09-06 與 08-19（MCF 頁面自己印出來的，不用猜 30 天）。
  ] satisfies MarketPulseItem[],
  zh: {
    eyebrow: '市場脈搏',
    intro: '你的診斷不是對著真空講的。這是最近一次掃描時，新加坡綠領市場真實掛出的含薪職缺：',
    reading: '這一批含薪新掛落在企業永續與永續溝通兩條線，經理級起跳，職缺頁自己揭露的月薪帶如上。',
    sourceNote: '來源:MyCareersFuture(新加坡政府職缺庫,法規要求揭薪)。連結入檔當日逐一驗證,職缺隨時可能關閉。',
    jobsCta: '完整精選與點評 →',
  } satisfies MarketPulseCopy,
  en: {
    eyebrow: 'Market pulse',
    intro: 'Your diagnosis is not made in a vacuum. These are salary-disclosed green roles that were live in Singapore as of the last sweep:',
    reading: 'This batch of salary-disclosed postings sits in corporate sustainability and sustainability communications, both at manager level and up; the monthly bands above are disclosed by the postings themselves.',
    sourceNote: 'Source: MyCareersFuture (Singapore government job portal; salary disclosure required by regulation). Links verified the day of entry; postings can close at any time.',
    jobsCta: 'Full picks and commentary →',
  } satisfies MarketPulseCopy,
};

/** 距離 updatedAt 超過 STALE_DAYS 就把整個區塊藏起來(寧可消失不可過期)。 */
export function isMarketPulseFresh(updatedAt: string, now: Date = new Date()): boolean {
  const updated = new Date(`${updatedAt}T00:00:00+08:00`).getTime();
  if (Number.isNaN(updated)) return false;
  const ageDays = (now.getTime() - updated) / 86_400_000;
  return ageDays >= 0 && ageDays <= MARKET_PULSE_STALE_DAYS;
}
