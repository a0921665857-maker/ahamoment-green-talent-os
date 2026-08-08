import type { Locale } from '@/lib/constants';
import { salaryIndexMeta } from '@/content/salaryIndex';

/**
 * Copy for /salary-index. Stand-alone, like nav and payment.
 *
 * NO COUNT AND NO CADENCE IS TYPED INTO A SENTENCE (2026-08-08 freshness audit).
 * The eyebrow used to read 「一手資料 · 每週更新」 and the method list used to say
 * 「目前庫裡的 98 筆全部是 2026-07-21 到 07-28 之間入庫的」. Both were true when
 * written and both rotted: the export stopped running for a week while the page
 * kept promising weekly, and the ledger reached 113 rows while the page kept
 * saying 98. Anything that is a fact about the snapshot is now read out of
 * `salaryIndexMeta`, which the exporter rewrites, so a sentence here cannot fall
 * behind the table beneath it. `updatedLine` carries the last export date, which
 * is the claim that can always be checked; the cadence is stated only next to it.
 */
export interface SalaryIndexCopy {
  eyebrow: string;
  /** Last-export disclosure. Contains {date}. Rendered beside the coverage span. */
  updatedLine: string;
  title: string;
  intro: string;
  methodTitle: string;
  method: string[];
  /** Verification status, kept separate so it can never be quietly dropped. */
  methodExtra: string;
  tableTitle: string;
  tableNote: string;
  colFunction: string;
  colSeniority: string;
  colN: string;
  colBand: string;
  notEnough: string; // {n}
  coverageTitle: string;
  coverageBody: string;
  gapTitle: string;
  gapBody: string;
  contributeTitle: string;
  contributeBody: string;
  contributeCta: string;
  taiwanTitle: string;
  taiwanBody: string;
  nextTitle: string;
  nextBody: string;
  nextCta: string;
}

export const salaryIndexCopy: Record<Locale, SalaryIndexCopy> = {
  'zh-TW': {
    eyebrow: '一手資料 · 逐筆來自職缺頁',
    updatedLine: '最後更新於 {date}（排程每週日重跑一次；沒有新觀測的那一週，這個日期就不會動）',
    title: '綠領揭薪指數',
    intro:
      '這裡的每一個數字，都來自一則真的把薪水寫出來的職缺。沒有推估、沒有自報、沒有從獵頭報告轉抄。代價是它很稀疏：多數格子還不能公布，而那些空格會照原樣留在頁面上。',
    methodTitle: '這份資料怎麼來的',
    method: [
      '只收職缺頁上逐字寫出來的薪資（posted）。模型推估與自報薪資一律不進資料庫。',
      `職缺頁沒寫清楚年資的，那一筆不進任何格子。目前有 ${salaryIndexMeta.excludedUnknownSeniority} 筆是這種狀況，它們只計入總數，不影響任何區間。`,
      '一個格子要累積到 5 則不同的職缺才公布區間。不到 5 筆的格子照樣顯示，只是不給數字，並寫出目前有幾筆。',
      `公布的是中位數與 P25–P75（第 25 到第 75 百分位），不是最低到最高。第一版曾經發過最低到最高，結果一則月薪 SGD 1,000 的實習職缺就把新加坡入門的下限拉到 1,000。那個數字誤導，2026-07-30 已修正。實習職缺現在直接排除，重複抓到的同一則職缺也排除（有 ${salaryIndexMeta.excludedDuplicate} 筆）。`,
      `誰在收、收多久：一個排程每週日自動掃三個市場的職缺板，不是人工逐筆輸入。這本帳從 ${salaryIndexMeta.ledgerOpenedOn} 才開始記，目前庫裡 ${salaryIndexMeta.totalObservations} 筆，最後一次重新匯出是 ${salaryIndexMeta.exportedOn}。它只有幾週大，不是幾年。下面標的 ${salaryIndexMeta.firstSeen} 到 ${salaryIndexMeta.lastSeen} 是「職缺被刊登／被看到的日期」，不是收集期間。`,
    ],
    methodExtra:
      '狀態誠實揭露：每一筆都是當時從職缺頁讀到的，但尚未逐筆重新開頁核對，所以整份標為「來源可查、未逐筆複驗」。在完成抽查之前，我們不會說它「經過稽核」。',
    tableTitle: '目前的格子',
    tableNote: '按樣本數排序。有數字的是已達門檻的格子；其餘照樣列出，讓你看見缺口在哪裡。',
    colFunction: '職能',
    colSeniority: '年資',
    colN: '樣本',
    colBand: '揭薪區間',
    notEnough: '還差 {n} 筆才公布',
    coverageTitle: '涵蓋範圍與它的偏斜',
    coverageBody:
      '樣本嚴重集中在新加坡。這不是設計，是資料來源的現實：新加坡的官方職缺平台強制揭露薪資，香港與英國沒有。所以這份指數目前應該被讀成「新加坡綠領揭薪指數，附香港與英國的零星觀測」，不是亞太全區。',
    gapTitle: '台灣為什麼沒有一欄',
    gapBody:
      '因為台灣的綠領職缺有 36% 是「薪資面議」（整體職缺是 16%，資料來源：環境部 × 104《2026 上半年綠領人才就業趨勢報告》）。用一個沒有揭露的市場去編一個區間，正是這個頁面存在的理由的反面。台灣這一欄會空著，直到有夠多真的寫出薪水的職缺為止。',
    contributeTitle: '你可以補上一格',
    contributeBody:
      '如果你手上有一則寫出薪水的綠領職缺，不管是你正在看的、還是你自己公司開的，把連結傳給我，下一期就會進來。要不要掛名由你決定，不掛名是預設。',
    contributeCta: '把職缺連結傳給我',
    taiwanTitle: '你自己的薪水在哪一格？',
    taiwanBody:
      '這張表講的是市場的招募帶寬，不是你的定價。要知道你這個組合現在被讀成哪一種人、落在哪一段，做一次免費的綠領 MRI。',
    nextTitle: '拿到 offer 了？',
    nextBody: '揭薪帶只能告訴你範圍。這個 offer 該不該接、能談多少、職級是平移還是降級，那要一場對談。',
    nextCta: '看 Offer 與路徑判讀',
  },
  en: {
    eyebrow: 'First-hand data · straight off the postings',
    updatedLine:
      'Last updated {date} (the sweep re-runs every Sunday; in a week with no new observations this date does not move)',
    title: 'Green-Collar Posted-Salary Index',
    intro:
      'Every number here comes from a job posting that actually printed a salary. Nothing is modelled, self-reported, or copied from a recruiter’s guide. The cost of that rule is sparseness — most cells cannot be published yet, and those empty cells stay on the page exactly as they are.',
    methodTitle: 'How this data is collected',
    method: [
      'Only salaries printed verbatim on the posting are recorded. Model estimates and self-reported figures never enter the database.',
      `If a posting does not make seniority readable, that row enters no cell — ${salaryIndexMeta.excludedUnknownSeniority} rows are currently in that state. They count towards the total and affect no range.`,
      'A cell publishes a range only once it holds 5 distinct postings. Below that the cell still appears, without numbers, showing how many it has.',
      `What is published is the median and the P25–P75 range, not the lowest-to-highest. The first version published lowest-to-highest, and a single SGD 1,000/month internship posting dragged Singapore’s entry floor down to 1,000 — that number was misleading and was corrected on 2026-07-30. Internships are now excluded outright, as are the ${salaryIndexMeta.excludedDuplicate} rows that turned out to be the same posting captured twice.`,
      `Who collects it, and for how long: a scheduled job sweeps three markets’ job boards every Sunday. Nothing is hand-entered. The ledger only opened on ${salaryIndexMeta.ledgerOpenedOn}, holds ${salaryIndexMeta.totalObservations} rows today, and was last re-exported on ${salaryIndexMeta.exportedOn} — weeks old, not years. The ${salaryIndexMeta.firstSeen} to ${salaryIndexMeta.lastSeen} span below is when the POSTINGS were seen, not how long collection has run.`,
    ],
    methodExtra:
      'Status, honestly: every row was read off the posting at capture time, and none has been re-opened since, so the whole snapshot is marked "source available, not individually re-verified". Until a spot-check is recorded we will not call it audited.',
    tableTitle: 'The cells as they stand',
    tableNote:
      'Sorted by sample size. Cells with numbers have cleared the threshold; the rest are listed anyway so you can see where the gaps are.',
    colFunction: 'Function',
    colSeniority: 'Experience',
    colN: 'Sample',
    colBand: 'Posted range',
    notEnough: '{n} more needed',
    coverageTitle: 'Coverage, and how skewed it is',
    coverageBody:
      'The sample is heavily concentrated in Singapore. That is not a design choice but a fact about the sources: Singapore’s government job platform requires salary disclosure, Hong Kong and the UK do not. So read this as "a Singapore posted-salary index with scattered Hong Kong and UK observations", not as pan-APAC.',
    gapTitle: 'Why there is no Taiwan column',
    gapBody:
      'Because 36% of Taiwan’s green-collar postings say "salary negotiable", against 16% across all postings (source: Ministry of Environment × 104, 2026 H1 green-collar employment report). Inventing a range for a market that does not disclose is the exact opposite of why this page exists. The Taiwan column stays empty until enough postings print a number.',
    contributeTitle: 'You can fill a cell',
    contributeBody:
      'If you have a green-collar posting that prints a salary — one you are looking at, or one your own company opened — send me the link and it goes into the next update. Attribution is your call; anonymous is the default.',
    contributeCta: 'Send me a posting',
    taiwanTitle: 'Which cell are you in?',
    taiwanBody:
      'This table shows what the market advertises, not what you are worth. To see how your particular combination gets read and where it sits, run the free Green Career MRI.',
    nextTitle: 'Holding an offer?',
    nextBody:
      'A posted range can only tell you the spread. Whether to take this one, what is negotiable, and whether the level is a lateral move or a downlevel — that takes a conversation.',
    nextCta: 'See Offer & Path Read',
  },
};
