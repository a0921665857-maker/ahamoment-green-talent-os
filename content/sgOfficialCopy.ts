import type { Locale } from '@/lib/constants';
import { SG_OFFICIAL_STALE_DAYS, sgOfficial } from '@/content/sgOfficial';
import { costOfLiving } from '@/content/costOfLiving';

/**
 * 官方數據區塊的雙語文案 — hand-written. The companion generated file is
 * content/sgOfficial.ts; the split mirrors salaryIndex.ts / salaryIndexCopy.ts,
 * so regenerating the data never touches a sentence and editing a sentence never
 * touches a number.
 *
 * NO NUMBER IS TYPED INTO THE PROSE. Every figure is a `{token}` filled at render
 * time from sgOfficial by `fillSgOfficial()`. That is the point: after a refresh
 * the copy cannot keep quoting last quarter's rent, because the copy never held
 * a figure in the first place. tests/sgOfficial.test.ts fails if any token is
 * left unfilled, and if any token has no value behind it.
 *
 * THE THREE THINGS THIS COPY EXISTS TO KEEP HONEST:
 *   1. Unit. The official rent is a WHOLE FLAT, 4-room, usually two or three
 *      people. The estimate table above it on the page is ONE PERSON'S monthly
 *      budget. Numbers from the two layers may never be added, averaged or
 *      swapped, and `caliberWarning` says so in the reader's own words.
 *   2. Provenance. First-hand (data.gov.sg) and second-hand (Numbeo, Wise, blog
 *      surveys) are labelled and rendered in separate sections. Nothing derived
 *      by me is presented as an official publication.
 *   3. Licence. Singapore Open Data Licence v1.0 requires attribution and a
 *      statement of non-affiliation. `licenceNote` carries both and is rendered
 *      unconditionally. Do not make it collapsible and do not delete it.
 *
 * TWO FIGURES HERE ARE NOT FROM THESE DATASETS, and both say so on the page:
 *   - The S$5,600 Employment Pass salary threshold in the income card. It is a
 *     rule, not a statistic, quoted from this site's own salary report where the
 *     reader can check it, and attributed there explicitly rather than left to
 *     read as a data.gov.sg number.
 *   - The S$3,429 city-centre one-bed in the comparison card. That is the
 *     second-hand estimate this section is contrasting itself against, it comes
 *     from the estimate layer in costOfLiving.ts, and it is labelled
 *     "second-hand estimate" rather than named after any one aggregator.
 *     tests/costOfLiving.test.ts fails if costOfLiving's own copy stops stating
 *     it, so the two files cannot drift apart.
 * Nothing else in this file comes from outside the snapshot.
 *
 * WHERE THIS FILE QUOTES THE ESTIMATE TABLE (the `reconcile` paragraph), it
 * reads the cell and the column heading out of costOfLiving.ts through tokens
 * instead of retyping them. Editing that table therefore edits this sentence.
 *
 * PUNCTUATION: zh-TW uses full-width marks throughout and no em dash「——」.
 * The English copy avoids the em dash too and uses curly apostrophes, matching
 * the existing en copy in costOfLiving.ts.
 */

export interface SgOfficialCopy {
  eyebrow: string;
  title: string;
  badgeOfficial: string;
  badgeEstimate: string;
  intro: string;
  /** The unit trap, in the reader's words. Rendered above the ranking, never collapsed. */
  caliberWarning: string;
  compareEstimateLabel: string;
  compareEstimateValue: string;
  compareEstimateDetail: string;
  compareOfficialLabel: string;
  compareOfficialValue: string;
  compareOfficialDetail: string;
  rentListLabel: string;
  rentUnit: string;
  rentCaption: string;
  expandLabel: string;
  derivedTag: string;
  reconcile: string;
  trendNote: string;
  statsTitle: string;
  stats: { key: 'cpi' | 'income' | 'unemployment'; label: string; value: string; reading: string }[];
  salaryReportLink: string;
  sourceLinePrefix: string;
  periodLabel: string;
  fetchedLabel: string;
  licenceNote: string;
  staleNote: string;
}

/* ------------------------------------------------------------------ *
 * Period formatting. Each locale writes a period its own way, but both
 * read it off the same snapshot field, so a refresh moves both at once.
 * ------------------------------------------------------------------ */

const ZH_MONTHS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const EN_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** '2026-Q2' → '2026 年第 2 季' / '2026 Q2' */
function quarter(period: string, locale: Locale): string {
  const [year, q] = period.split('-Q');
  return locale === 'zh-TW' ? `${year} 年第 ${q} 季` : `${year} Q${q}`;
}

/** '2026-06' → '2026 年 6 月' / 'June 2026' */
function month(period: string, locale: Locale): string {
  const [year, mm] = period.split('-');
  const i = Number(mm) - 1;
  return locale === 'zh-TW' ? `${year} 年 ${ZH_MONTHS[i]} 月` : `${EN_MONTHS[i]} ${year}`;
}

/** '2026-08-06T16:34:15+08:00' → '2026 年 8 月 6 日' / '2026-08-06' */
function fetchedDate(iso: string, locale: Locale): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return locale === 'zh-TW' ? `${y} 年 ${Number(m)} 月 ${Number(d)} 日` : `${y}-${m}-${d}`;
}

/**
 * Render whichever period shape a dataset uses. The datasets do not agree with
 * each other on granularity, which is the point: rent is quarterly, CPI and
 * unemployment monthly, income annual. Each figure shows its own.
 * Used for the editorial line on each card. The source line beneath keeps the
 * raw ISO period so a reader can match it to data.gov.sg character for character.
 */
export function sgOfficialPeriodLabel(period: string, locale: Locale): string {
  if (period.includes('-Q')) return quarter(period, locale);
  if (/^\d{4}-\d{2}$/.test(period)) return month(period, locale);
  if (/^\d{4}$/.test(period)) return locale === 'zh-TW' ? `${period} 年` : period;
  return period;
}

const num = (n: number): string => n.toLocaleString('en-US');
const one = (n: number): string => n.toFixed(1);

/**
 * Every `{token}` the copy may use, resolved from the generated snapshot.
 * Values that are mine rather than the agency's are marked in the copy with
 * `derivedTag`; the maths is done here so it is visible in one place.
 */
export function sgOfficialVars(locale: Locale): Record<string, string> {
  const { rent, cpi, income, unemployment } = sgOfficial;
  const zh = locale === 'zh-TW';
  const t = rent.trend;

  const vars: Record<string, string> = {
    townCount: String(rent.byTown.length),
    flatTypeLabel: zh ? '四房式' : '4-room',
    quarter: quarter(rent.quarter, locale),
    trendFrom: quarter(t[0]?.fromQuarter ?? '', locale),
    highestTown: zh ? (rent.byTown[0]?.townZh ?? '') : (rent.byTown[0]?.town ?? ''),
    highest: num(rent.highest),
    lowest: num(rent.lowest),
    medianOfTowns: num(rent.medianOfTowns),
    p25: num(rent.p25),
    p75: num(rent.p75),
    spread: rent.spread.toFixed(2),
    // Derived by me, labelled as mine wherever it appears: a whole flat split
    // between two people. Never presented as an official per-person figure.
    halfMedian: num(Math.round(rent.medianOfTowns / 2)),
    halfHighest: num(Math.round(rent.highest / 2)),

    // The six-year rent range, min and max of the very series trendNote prints
    // town by town below. Written as tokens because a typed-in range is how the
    // CPI card ended up claiming a ceiling the paragraph above it had already
    // exceeded. Rounding is monotonic, so these always match the t{i}Pct rows.
    trendMinPct: String(Math.round(Math.min(...t.map((row) => row.changePct)))),
    trendMaxPct: String(Math.round(Math.max(...t.map((row) => row.changePct)))),

    // Quoted out of the estimate table on the same page rather than retyped, so
    // the reconciliation sentence cannot go on describing a column that has been
    // renamed or a range that has been repriced. rows[0] is the rent row.
    leanColumn: costOfLiving[locale].sgTable.head[1],
    leanRent: costOfLiving[locale].sgTable.rows[0][1],

    cpiMonth: month(cpi.month, locale),
    cpiAll: one(cpi.yoyAllItems),
    cpiFood: one(cpi.yoyFood),
    cpiHousing: one(cpi.yoyHousingUtilities),
    cpiTransport: one(cpi.yoyTransport),
    cpiPeak: one(cpi.peakYoy),
    cpiPeakMonth: month(cpi.peakYoyMonth, locale),
    cpiCum5: one(cpi.cumulativeFiveYearPct),

    incomeYear: zh ? `${income.year} 年` : income.year,
    incomeIncl: num(income.medianMonthlyInclEmployerCpf),
    incomeExcl: num(income.medianMonthlyExclEmployerCpf),

    unempPeriod: month(unemployment.period, locale),
    unempRate: one(unemployment.seasonallyAdjustedRate),
    unempQuarters: String(unemployment.quartersInBand),
    unempLow: one(unemployment.tenYearLow),
    unempHigh: one(unemployment.tenYearHigh),

    fetchedDate: fetchedDate(rent.source.fetchedAt, locale),
    staleDays: String(SG_OFFICIAL_STALE_DAYS),
    agencies: zh ? 'HDB、SingStat、MOM' : 'HDB, SingStat, MOM',
    // Read back off the copy so the badge on the page and the word quoted in the
    // licence note can never say two different things.
    derivedTag: sgOfficialCopy[locale].derivedTag,
  };

  t.forEach((row, i) => {
    vars[`t${i}Town`] = zh ? row.townZh : row.town;
    vars[`t${i}From`] = num(row.fromRent);
    vars[`t${i}To`] = num(row.toRent);
    // Rounded for reading; the precise value stays in sgOfficial.ts.
    vars[`t${i}Pct`] = String(Math.round(row.changePct));
  });

  return vars;
}

/** Replace every `{token}`. An unknown token is left visible on purpose so a test catches it. */
export function fillSgOfficial(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in vars ? vars[key] : whole,
  );
}

/* ------------------------------------------------------------------ *
 * Copy
 * ------------------------------------------------------------------ */

const zhTW: SgOfficialCopy = {
  eyebrow: 'HDB 官方 · {flatTypeLabel}整戶月租中位數 · {quarter}',
  title: '官方數字：新加坡人實際租的組屋，各鎮租多少',
  badgeOfficial: '官方一手數據',
  badgeEstimate: '二手估計',
  intro:
    '上面那句「沒有單一答案」，其實官方資料可以回答一半。這一區跟上面那兩張表不一樣：上面是我從 Numbeo、Wise 這類公開估計整理出來的，這裡的每個數字都是新加坡政府自己發布的，你可以點連結去原始資料集核對。新加坡建屋發展局（HDB）每季公布各鎮、各房型的整戶租金中位數，是依實際登記的租約算出來的，不是估計值。我把 {quarter}的{flatTypeLabel}整戶月租，{townCount} 個鎮全部列在下面。要先說明的是，這份資料只涵蓋組屋，私人公寓與有地住宅完全不在裡面。',
  caliberWarning:
    '在看數字之前，先講清楚這張表跟上面那張表的差別，因為兩者不能互相取代，也不能相加。上面二手估計的「市中心一房 S$3,429」是私人公寓、一房一廳，通常一個人住；這裡的「{highestTown} S${highest}」是整戶{flatTypeLabel}組屋、三房一廳，通常兩三個人分住。產權不同、房型不同、分攤的人數也不同。把這兩個數字擺在一起比大小，會得到剛好相反的結論：S${highest} 兩個人分，一個人約 S${halfHighest}，其實比那間一房一廳還便宜。所以官方那張表是整戶的價錢，不是一個人一個房間的價錢，兩張表要分開讀。',
  compareEstimateLabel: '二手估計 · 市中心一房',
  compareEstimateValue: 'S$3,429',
  compareEstimateDetail: '私人公寓 · 一房一廳 · 通常一個人住',
  compareOfficialLabel: 'HDB 官方 · {highestTown}',
  compareOfficialValue: 'S${highest}',
  compareOfficialDetail: '組屋 · 整戶{flatTypeLabel} · 通常兩三個人分住',
  rentListLabel: '{quarter} · {flatTypeLabel}整戶月租中位數（新加坡幣）',
  rentUnit: 'S$／月，整戶',
  rentCaption:
    '單位是整戶月租，不是單人房租。最高 {highestTown} S${highest}，最低 S${lowest}，高低差 {spread} 倍。',
  expandLabel: '看完整 {townCount} 鎮',
  derivedTag: '我算的',
  reconcile:
    '真正可以對照的是這個。{townCount} 個鎮的中位數是 S${medianOfTowns}，第一四分位到第三四分位是 S${p25} 到 S${p75}，兩個人分攤大約每人 S${halfMedian}，正好落在我上面那張表「{leanColumn}」的 {leanRent} 區間裡。這個除法和這個中位數都是我自己從官方資料算的，不是官方發布的數字，但它至少說明上面那張表沒有離譜。要注意官方中位數是已登記租約的成交價，不含仲介費、押金、家具與水電，中位數也不等於平均數，更不等於你會付的價。',
  trendNote:
    '另一組官方數字更值得看。同樣是{flatTypeLabel}整戶，{t0Town}在 {trendFrom}的中位數是 S${t0From}，到 {quarter}變成 S${t0To}，六年漲了約 {t0Pct}%。同期{t1Town}漲約 {t1Pct}%、{t2Town}約 {t2Pct}%、{t3Town}約 {t3Pct}%、{t4Town}約 {t4Pct}%。這些漲幅是我從官方季度序列算的。這是租金自己的漲幅，跟下面那個通膨數字完全是兩回事，我下一段就講為什麼。',
  statsTitle: '另外三個官方數字，決定你這筆帳會不會愈算愈薄',
  stats: [
    {
      key: 'cpi',
      label: '整體消費者物價年增率',
      value: '+{cpiAll}%',
      reading:
        '新加坡整體物價比去年同月高 {cpiAll}%。分項裡食物 +{cpiFood}%、交通 +{cpiTransport}%、住房與水電 +{cpiHousing}%。這個 +{cpiHousing}% 要特別小心：官方的住房分項涵蓋自住者的設算租金與政府水電回扣，不等於新租客實際要付的租金，上面那組六年漲 {trendMinPct}% 到 {trendMaxPct}% 的官方租金數字才是。另外，CPI 是全國家庭的籃子，不是外派單身租客的籃子。對照一下高低點：{cpiPeakMonth}的高峰是 +{cpiPeak}%，近五年累計漲了約 {cpiCum5}%。',
    },
    {
      key: 'income',
      label: '本地全職受僱居民月入中位數',
      value: 'S${incomeIncl}',
      reading:
        '這個數字含雇主公積金（CPF）。不含雇主公積金的官方中位數是 S${incomeExcl}，兩個都是官方公布的，用哪一個要看你在跟什麼比。要注意母體：這是全體本地居民（公民與永久居民）、所有職業的中位數，不是綠領職缺的薪資帶，也不是外籍雇員的薪資，三者是不同的母體，不能互相驗證。一個值得看的對照：本站薪資報告引用的就業准證（EP）月薪門檻是 S$5,600，比本地居民不含雇主公積金的中位數 S${incomeExcl} 還高。那個門檻是移民法規，不在這份統計裡，但兩個放在一起看，等於政府把外籍白領的門檻訂在本地中間值之上。',
    },
    {
      key: 'unemployment',
      label: '整體失業率（經季節調整）',
      value: '{unempRate}%',
      reading:
        '最近 {unempQuarters} 季都落在 1.9% 到 2.0% 之間，過去十年的區間是 {unempLow}% 到 {unempHigh}%，所以現在是偏緊的那一端。但這個數字有個限制要講明：它是整體失業率，包含非居民，而非居民一旦失業通常就離開新加坡、不再計入勞動力，所以它會系統性低估外籍求職者的難度，不能拿來當「外國人好不好找工作」的指標。',
    },
  ],
  salaryReportLink: '看綠領職能的實際薪資帶 →',
  sourceLinePrefix: '來源：',
  periodLabel: '資料期別',
  fetchedLabel: '抓取日期',
  licenceNote:
    '以上官方數字取自 data.gov.sg（{agencies}），依 Singapore Open Data Licence v1.0 使用，抓取日期 {fetchedDate}，各數字的最新期別已標在旁邊。本頁是衍生分析，不是官方發布，本站與新加坡政府沒有任何隸屬關係。標示為「{derivedTag}」的中位數、四分位與漲幅由我自官方序列算出，如與官方發布數字有出入，以官方為準。超過 {staleDays} 天沒有重新抓取，這一區會自己標示出來，請以官方連結為準。',
  staleNote:
    '這一區的官方數據最後一次抓取是 {fetchedDate}，距今已超過 {staleDays} 天沒有重抓。數字本身仍是當時官方公布的內容，沒有被隱藏，但可能已有更新的期別，請點下面的來源連結確認。',
};

const en: SgOfficialCopy = {
  eyebrow: 'HDB official · median whole-flat {flatTypeLabel} rent · {quarter}',
  title: 'The official numbers: what Singaporeans actually pay to rent an HDB flat',
  badgeOfficial: 'Official, first-hand',
  badgeEstimate: 'Second-hand estimate',
  intro:
    'That line about there being no single answer, official data can answer half of it. This section is not like the two tables above: those I assembled from public estimates such as Numbeo and Wise, while every figure here is published by the Singapore government and you can follow the link to check it in the original dataset. The Housing & Development Board (HDB) publishes a median whole-flat rent for each town and flat type every quarter, computed from actual registered tenancies rather than estimated. Below are all {townCount} towns at the {quarter} median for a {flatTypeLabel} whole flat. One thing to say first: this dataset covers public housing only, so private condominiums and landed housing are not in it at all.',
  caliberWarning:
    'Before the numbers, the difference between this and the table above, because the two cannot replace each other and cannot be added together. The second-hand “city-centre one-bed at S$3,429” above is a private condominium, one bedroom, usually one person. The “{highestTown} at S${highest}” here is a whole {flatTypeLabel} HDB flat, three bedrooms, usually shared by two or three people. Different tenure, different flat, different number of people splitting it. Line the two up and you get the opposite conclusion: split S${highest} between two people and it is about S${halfHighest} each, which is cheaper than that one-bed. So the official table is the price of a whole flat, not the price of one person’s room, and the two tables have to be read separately.',
  compareEstimateLabel: 'Second-hand estimate · city-centre 1BR',
  compareEstimateValue: 'S$3,429',
  compareEstimateDetail: 'Private condo · one bedroom · usually one person',
  compareOfficialLabel: 'HDB official · {highestTown}',
  compareOfficialValue: 'S${highest}',
  compareOfficialDetail: 'Public housing · whole {flatTypeLabel} flat · usually two or three people',
  rentListLabel: '{quarter} · median whole-flat {flatTypeLabel} rent (SGD)',
  rentUnit: 'S$/month, whole flat',
  rentCaption:
    'The unit is a whole flat per month, not one person’s room. Highest is {highestTown} at S${highest}, lowest S${lowest}, a spread of {spread}×.',
  expandLabel: 'Show all {townCount} towns',
  derivedTag: 'my calculation',
  reconcile:
    'Here is what can actually be compared. The median across the {townCount} towns is S${medianOfTowns}, with a P25 to P75 range of S${p25} to S${p75}. Split between two people that is roughly S${halfMedian} each, which lands inside the {leanRent} rent range in the “{leanColumn}” column of my table above. That division and that median are both mine, computed from the official series rather than published by the agency, but it does suggest the table above is not wildly off. Note that the official median is what registered tenancies transacted at, excluding agent fees, deposits, furniture and utilities, and that a median is neither an average nor the price you will personally pay.',
  trendNote:
    'Another set of official numbers is worth more of your attention. For the same whole {flatTypeLabel} flat, {t0Town} had a median of S${t0From} in {trendFrom} and S${t0To} by {quarter}, up about {t0Pct}% in six years. Over the same period {t1Town} rose about {t1Pct}%, {t2Town} about {t2Pct}%, {t3Town} about {t3Pct}% and {t4Town} about {t4Pct}%. Those changes are mine, computed from the official quarterly series. This is what rent itself did, which is a completely different thing from the inflation figure below, and the next paragraph explains why.',
  statsTitle: 'Three more official numbers that decide whether this sum keeps shrinking',
  stats: [
    {
      key: 'cpi',
      label: 'All-items consumer price inflation, year on year',
      value: '+{cpiAll}%',
      reading:
        'Overall prices are {cpiAll}% higher than the same month a year earlier. Within that, food is +{cpiFood}%, transport +{cpiTransport}% and housing & utilities +{cpiHousing}%. That +{cpiHousing}% needs care: the official housing component includes owner-occupied imputed rent and government utility rebates, so it is not what a new tenant actually pays. The official rents above, up roughly {trendMinPct}% to {trendMaxPct}% over six years, are that. Also, the CPI basket is the national household basket, not a single expat tenant’s basket. For scale, the peak was +{cpiPeak}% in {cpiPeakMonth}, and the cumulative five-year rise is about {cpiCum5}%.',
    },
    {
      key: 'income',
      label: 'Median gross monthly income, full-time employed residents',
      value: 'S${incomeIncl}',
      reading:
        'This figure includes employer CPF contributions. Excluding employer CPF, the official median is S${incomeExcl}; both are published, and which one you want depends on what you are comparing against. Mind the population: this is all residents (citizens and permanent residents) across all occupations, not a green-collar band and not foreign-employee pay. Three different populations, so none of them can verify another. One comparison worth making: the Employment Pass salary threshold quoted in this site’s salary report is S$5,600 a month, above the S${incomeExcl} resident median excluding employer CPF. That threshold is immigration rule rather than part of this statistic, but put side by side, the bar for a foreign professional sits above the local middle.',
    },
    {
      key: 'unemployment',
      label: 'Overall unemployment rate, seasonally adjusted',
      value: '{unempRate}%',
      reading:
        'The last {unempQuarters} quarters have all sat between 1.9% and 2.0%, against a ten-year range of {unempLow}% to {unempHigh}%, so this is the tight end of it. One limit has to be said out loud: this is the overall rate including non-residents, and a non-resident who loses a job usually leaves Singapore and drops out of the labour force. It therefore understates how hard a foreign job search is, and it is not an indicator of how easy it is for a foreigner to get hired.',
    },
  ],
  salaryReportLink: 'See the actual bands for green-collar roles →',
  sourceLinePrefix: 'Source: ',
  periodLabel: 'Reporting period',
  fetchedLabel: 'Retrieved',
  licenceNote:
    'Official figures above are from data.gov.sg ({agencies}), used under the Singapore Open Data Licence v1.0. Retrieved {fetchedDate}; each figure carries its own reporting period beside it. This page is derived analysis, not an official publication, and this site is not affiliated with the Singapore government. Medians, quartiles and rates of change flagged as “{derivedTag}” are computed by me from the official series; where they differ from officially published figures, the official figures stand. If more than {staleDays} days pass without a refresh, this section says so itself, and the official links are the thing to trust.',
  staleNote:
    'The official figures in this section were last retrieved on {fetchedDate}, more than {staleDays} days ago. They are still what the agencies published at that time and nothing has been hidden, but a newer reporting period may exist. Follow the source links below to check.',
};

export const sgOfficialCopy: Record<Locale, SgOfficialCopy> = { 'zh-TW': zhTW, en };
