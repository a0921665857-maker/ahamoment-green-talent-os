/**
 * CONSTITUTION LINT — the rule engine.
 *
 * Why this exists (2026-08-08 conversion-UX audit): three copy defects survived
 * for months and were only ever caught by a human reading every page —
 *   1. 「今天的 MRI 名額已額滿，我們刻意限量以維持品質」 (manufactured scarcity)
 *   2. 「報告會即時顯示」 (a timing promise the pipeline cannot keep)
 *   3. the privacy page describing Stripe checkout that no buyer ever used
 * Michael maintains two locales alone with about three hours a week. Anything
 * that depends on him re-reading every string will rot again. So the written
 * rules become machine-enforced here.
 *
 * Every rule below quotes the document it comes from. No rule is invented: if
 * it is not in docs/UX_PRINCIPLES.md, content/index.ts LOCALE_STYLE_NOTES,
 * lib/services.ts or a recorded founder decision, it does not belong in this file.
 *
 * Design notes that matter when you extend this:
 * - Rules run over *rendered copy*, never over source code or comments, so a
 *   `!==` operator or an explanatory comment can never trip a rule.
 * - Every exemption is a named, documented entry. Nothing is silenced just to
 *   make the suite green; an exemption is a claim that the string is compliant,
 *   not a claim that the string is unimportant.
 */

/* ------------------------------- rule catalogue ------------------------------ */

export type RuleId =
  | 'retired-offer-id'
  | 'exclamation'
  | 'scarcity'
  | 'hype'
  | 'price-drift'
  | 'em-dash-zh'
  | 'self-checkout';

export interface RuleDoc {
  id: RuleId;
  /** One line, in the voice of the source document. */
  says: string;
  /** Where the rule is written down. */
  source: string;
}

export const RULE_DOCS: Record<RuleId, RuleDoc> = {
  'retired-offer-id': {
    id: 'retired-offer-id',
    says: 'A public surface may only name a service that is still sold: the two ids in PUBLIC_PAID_OFFER_IDS plus the free intro call.',
    source: 'lib/services.ts (Gate 8, 2026-07-29)',
  },
  exclamation: {
    id: 'exclamation',
    says: 'No exclamation marks. Calm premium, not motivational.',
    source: 'docs/UX_PRINCIPLES.md #7; content/index.ts LOCALE_STYLE_NOTES (both locales)',
  },
  scarcity: {
    id: 'scarcity',
    says: 'Never fake countdowns or scarcity. Countdown timers and "only 3 spots left" are hard bans.',
    source: 'docs/UX_PRINCIPLES.md #5 and the Anti-patterns section',
  },
  hype: {
    id: 'hype',
    says: 'Avoid 「保證」「秒懂」「爆款」-style wording; no outcome guarantees anywhere (admissions, salary, offers); no hype words in English.',
    source: 'docs/UX_PRINCIPLES.md (Chinese craft rules + Trust surface checklist); content/index.ts LOCALE_STYLE_NOTES',
  },
  'price-drift': {
    id: 'price-drift',
    says: 'A public price exists in exactly one place — lib/services.ts. A price rendered on a selling surface must match it.',
    source: 'lib/services.ts header comment; already partly guarded by tests/contentSchema.test.ts',
  },
  'em-dash-zh': {
    id: 'em-dash-zh',
    says: '嚴禁破折號「——」（改用「：」或「，」斷句）。',
    source: 'content/index.ts LOCALE_STYLE_NOTES["zh-TW"]',
  },
  'self-checkout': {
    id: 'self-checkout',
    says: 'No self-serve checkout and no payment processor named to the reader; the path is LINE → call → scope → then pay.',
    source: 'Founder decision 2026-07-29 (副業商業模式常數, global CLAUDE.md); docs/PAID_OFFER_STRATEGY.md',
  },
};

/* --------------------------------- findings --------------------------------- */

export interface Finding {
  rule: RuleId;
  /** Dotted path of the string, e.g. `zh-TW.errors.dailyCapReached` or `app/(site)/[locale]/page.tsx:120`. */
  surface: string;
  /** The exact substring that broke the rule. */
  match: string;
  /** Surrounding text so a human can judge it without opening the file. */
  excerpt: string;
}

export interface LintOptions {
  /**
   * True when the surface is part of the selling path (offer copy, payment
   * pages, service CTAs). Only these surfaces are price-checked, because the
   * site also publishes salary bands and cost-of-living tables that are full of
   * legitimate NT$ figures having nothing to do with what Michael charges.
   */
  sellingSurface?: boolean;
  /**
   * True for persuasion copy (landing, flow, report, offers, emails, nav…),
   * false for the knowledge corpora (judgement cases, salary report, cost of
   * living, official Singapore data). Used only by the 保證 rule — see the note
   * on GUARANTEE_ALLOWED for why that one word needs the distinction.
   */
  marketingSurface?: boolean;
}

const CJK = /[㐀-䶿一-鿿豈-﫿々〆]/;

function excerptAround(text: string, index: number, length: number): string {
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + length + 40);
  return (start > 0 ? '…' : '') + text.slice(start, end).replace(/\s+/g, ' ') + (end < text.length ? '…' : '');
}

/* ------------------------------ rule 1: offer ids ----------------------------- */

/**
 * Kept as a literal list rather than imported from lib/services.ts so this file
 * stays dependency-free (the CLI can lint raw files without loading the app).
 * tests/constitutionLint.test.ts asserts this list is identical to
 * ARCHIVED_OFFER_IDS, so it cannot silently drift.
 */
export const RETIRED_OFFER_IDS = [
  'deep_read',
  'consult_60',
  'teardown_90',
  'cv_linkedin_review',
  'climate_positioning_sprint',
  'mba_story_sprint',
  'mock_interview_pack',
  'offer_negotiation',
  'climate_finance_transition',
  'full_package',
] as const;

/**
 * Word-boundary matching on purpose. `mba_story_sprint` is a substring of the
 * result category `ready_for_mba_story_sprint`, which is a live, correct
 * identifier — matching it would be a false positive on eight report pages.
 */
const RETIRED_OFFER_RE = new RegExp(`(?<![A-Za-z0-9_])(${RETIRED_OFFER_IDS.join('|')})(?![A-Za-z0-9_])`, 'g');

/* ----------------------------- rule 3: scarcity ------------------------------ */

/**
 * Unconditional scarcity vocabulary. These words have no non-marketing use on
 * this site: there is no waiting list, no cohort, no seat count.
 */
const SCARCITY_HARD: { re: RegExp; label: string }[] = [
  { re: /名額/g, label: '名額' },
  { re: /限量/g, label: '限量' },
  { re: /額滿/g, label: '額滿' },
  { re: /倒數/g, label: '倒數' },
  { re: /席次/g, label: '席次' },
  { re: /last chance/gi, label: 'last chance' },
  { re: /limited (?:spots?|seats?|places?|slots?)/gi, label: 'limited spots' },
  { re: /(?:only|just)\s+\d+\s+(?:spots?|seats?|places?|slots?|left)/gi, label: 'only N left' },
  { re: /(?:spots?|seats?|places?|slots?)\s+left/gi, label: 'spots left' },
  { re: /while (?:supplies|spots) last/gi, label: 'while supplies last' },
];

/**
 * 只剩 is conditional. It is ordinary analytical Chinese — 「到第 15 年售電收入
 * 只剩 9,322 萬元」 in the judgement corpus is a cash-flow fact, not a sales
 * tactic. It only becomes scarcity when what is running out is a slot or a
 * clock, so the term is flagged only in front of a countable-seat or time noun.
 */
const SCARCITY_COUNTDOWN = /只剩(?:下)?\s*[\d０-９一二三四五六七八九十兩幾]*\s*(?:個?名額|位|席|組|份|天|小時|分鐘|檔期)/g;

/**
 * A denial of scarcity is the opposite of scarcity and must stay legal, or the
 * lint would forbid the honest fix it is meant to encourage. The live example:
 * 「這是每日成本上限，不是名額限制。」 — the word 名額 appears precisely in order
 * to tell the reader that no such limit exists.
 */
const ZH_NEGATION_BEFORE = /(?:不是|沒有|並非|不設|不會有|未設|非|無|不)\s*$/;
/** Same clause only: a negation two sentences back does not make a claim honest. */
const EN_NEGATION_BEFORE = /\b(?:no|not|never|without|nor)\b[^.,;?!]{0,12}$/i;

function negatedBefore(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 30), index);
  return ZH_NEGATION_BEFORE.test(before) || EN_NEGATION_BEFORE.test(before);
}

/* -------------------------------- rule 4: hype ------------------------------- */

const HYPE_HARD: { re: RegExp; label: string }[] = [
  { re: /秒懂/g, label: '秒懂' },
  { re: /爆款/g, label: '爆款' },
  { re: /包你/g, label: '包你' },
  { re: /\binstantly\b/gi, label: 'instantly' },
  // The banned English form is the promise, not the word. "guaranteed" and
  // "we guarantee" are claims to the reader; "what an assurance opinion actually
  // guarantees" is the assurance syllabus describing someone else's undertaking,
  // and it appears in the judgement corpus for exactly that reason.
  { re: /\bguaranteed\b/gi, label: 'guaranteed' },
  { re: /\b(?:we|i)\s+guarantee\b/gi, label: 'we guarantee' },
];

/**
 * 保證 is the hard case, and the reason this rule has two triggers instead of a
 * word list.
 *
 * As marketing it is banned outright (「避免『保證』…-style wording」 in the
 * Chinese craft rules; 「No outcome guarantees anywhere (admissions, salary,
 * offers)」 in the trust-surface checklist). But it is also the ordinary
 * Chinese term for an assurance level or a contractual undertaking, and the
 * judgement corpus uses it about thirty times in exactly that sense: 合理保證
 * and 有限保證 are the ISAE 3000 assurance levels, 履約保證 is a performance
 * bond, 「政府保證用固定價格把電全部收購」 describes a feed-in tariff. Banning
 * those would either delete correct teaching or force the author to paraphrase
 * legal terms — both worse than the defect being prevented.
 *
 * So the word is flagged when it is a promise rather than a term:
 *   (a) an outcome or second-person marker sits within six characters of it
 *       (「保證錄取」「保證你會拿到 offer」), or
 *   (b) it appears on a persuasion surface at all (landing, flow, offers,
 *       emails, report copy) — where the word has no technical job to do.
 * The knowledge corpora (judgement cases, salary report, cost of living,
 * official Singapore data, job listings) are exempt from (b) only.
 *
 * A denial (不保證 / 沒有保證) is never flagged: it is the disclaimer this rule
 * exists to encourage. Handled by the shared negation guard.
 */
export const GUARANTEE_PROMISE_MARKERS = /(?:你|妳|您|錄取|上榜|offer|薪資|薪水|加薪|成功|有效|見效|拿到|找到工作|面試邀約|結果)/i;

/** Documented technical collocations, exempt from trigger (a) as well. */
export const GUARANTEE_ALLOWED: { re: RegExp; why: string }[] = [
  { re: /合理保證/, why: 'ISAE 3000「合理保證」assurance level — technical term in the judgement corpus' },
  { re: /有限保證/, why: 'ISAE 3000「有限保證」assurance level, taught alongside 合理保證' },
  { re: /保證等級/, why: 'the name of the assurance-level field printed in an assurance statement' },
  { re: /履約保證/, why: 'performance bond — contract vocabulary in the project-finance cases' },
  { re: /母公司保證/, why: 'parent-company guarantee — credit-support vocabulary in the same cases' },
  { re: /可用率保證/, why: 'availability guarantee in an O&M contract, part of the DSCR worked example' },
  { re: /(?:節能量?|績效)保證/, why: 'energy performance contract (ESCO) term: the vendor underwrites the savings' },
  { re: /保證張數/, why: 'REC contracting term — guaranteed certificate volume vs. as-generated delivery' },
  { re: /保證(?:了)?什麼/, why: 'a question about what an assurance statement actually covers' },
  { re: /(?:不|沒有|並非|未|無法|不做|不能)\s*保證/, why: 'a denial of a guarantee — the disclaimer this rule wants more of' },
];

/* ----------------------------- rule 5: price drift --------------------------- */

const PRICE_TOKEN = /(?:NT\$|NTD\s?|US\$|USD\s?|SGD\s?|S\$|TWD\s?)[\d][\d,]*(?:\s*\+)?/g;

/**
 * A price is also checked outside the selling surfaces when the sentence itself
 * is talking about Michael's own service — that is how a stale figure escapes
 * into an article or an email and starts contradicting the payment page.
 * Salary bands, rent tables and MBA-ROI inputs carry no such marker.
 */
const SERVICE_CONTEXT =
  /(?:一對一|定位對談|路徑判讀|故事(?:單次)?拆解|付費服務|我的服務|服務費用|諮詢費用|one-on-one|Offer 與路徑判讀|MBA 故事)/i;

/* ---------------------------- rule 7: self-checkout -------------------------- */

const SELF_CHECKOUT: { re: RegExp; label: string }[] = [
  { re: /\bstripe\b/gi, label: 'Stripe' },
  { re: /自助結帳/g, label: '自助結帳' },
  { re: /線上刷卡/g, label: '線上刷卡' },
  { re: /加入購物車/g, label: '加入購物車' },
];

/* --------------------------------- the engine -------------------------------- */

export interface LintContext extends LintOptions {
  /** Prices that lib/services.ts currently authorises, plus the free door. */
  allowedPrices?: string[];
}

function push(out: Finding[], rule: RuleId, surface: string, text: string, index: number, match: string) {
  out.push({ rule, surface, match, excerpt: excerptAround(text, index, match.length) });
}

function scan(re: RegExp, text: string, fn: (m: RegExpExecArray) => void) {
  const r = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m: RegExpExecArray | null;
  while ((m = r.exec(text)) !== null) {
    fn(m);
    if (m[0] === '') r.lastIndex++;
  }
}

/** Lint one rendered string. Returns every rule it breaks. */
export function lintText(surface: string, text: string, ctx: LintContext = {}): Finding[] {
  const out: Finding[] = [];
  const hasCjk = CJK.test(text);

  scan(RETIRED_OFFER_RE, text, (m) => push(out, 'retired-offer-id', surface, text, m.index, m[0]));

  scan(/[!！]/g, text, (m) => push(out, 'exclamation', surface, text, m.index, m[0]));

  for (const { re, label } of SCARCITY_HARD) {
    scan(re, text, (m) => {
      if (negatedBefore(text, m.index)) return;
      push(out, 'scarcity', surface, text, m.index, label === m[0] ? m[0] : `${m[0]} (${label})`);
    });
  }
  scan(SCARCITY_COUNTDOWN, text, (m) => {
    if (negatedBefore(text, m.index)) return;
    push(out, 'scarcity', surface, text, m.index, m[0]);
  });

  for (const { re, label } of HYPE_HARD) {
    scan(re, text, (m) => {
      if (negatedBefore(text, m.index)) return;
      push(out, 'hype', surface, text, m.index, label === m[0] ? m[0] : `${m[0]} (${label})`);
    });
  }
  scan(/保證/g, text, (m) => {
    if (negatedBefore(text, m.index)) return;
    const collocation = text.slice(Math.max(0, m.index - 6), m.index + 8);
    if (GUARANTEE_ALLOWED.some((a) => a.re.test(collocation))) return;
    const promiseWindow = text.slice(Math.max(0, m.index - 6), m.index + 8);
    const isPromise = GUARANTEE_PROMISE_MARKERS.test(promiseWindow);
    if (!isPromise && !ctx.marketingSurface) return;
    push(out, 'hype', surface, text, m.index, '保證');
  });

  if (hasCjk) {
    // 「——」 is two U+2014 characters; match the run so one dash reports once.
    scan(/—+/g, text, (m) => push(out, 'em-dash-zh', surface, text, m.index, `U+2014 ${m[0]}`));
  }

  {
    const allowed = new Set((ctx.allowedPrices ?? []).map((p) => p.replace(/\s+/g, '')));
    scan(PRICE_TOKEN, text, (m) => {
      // The service marker must sit next to the figure, not merely somewhere in
      // the same blob: the Singapore guide is one long string containing both
      // work-pass salary thresholds and the word 收費, and a whole-string test
      // turned every government figure into a false price violation.
      const nearby = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40);
      if (!ctx.sellingSurface && !SERVICE_CONTEXT.test(nearby)) return;
      if (allowed.has(m[0].replace(/\s+/g, ''))) return;
      push(out, 'price-drift', surface, text, m.index, m[0]);
    });
  }

  for (const { re, label } of SELF_CHECKOUT) {
    scan(re, text, (m) => push(out, 'self-checkout', surface, text, m.index, label));
  }

  return dedupe(out);
}

/** Same rule, same string, same excerpt is one problem to fix, not several. */
function dedupe(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.rule}|${f.surface}|${f.match}|${f.excerpt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function formatFindings(findings: Finding[]): string {
  if (findings.length === 0) return 'no violations';
  const byRule = new Map<RuleId, Finding[]>();
  for (const f of findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);
  const lines: string[] = [];
  for (const [rule, list] of [...byRule.entries()].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`\n[${rule}] ${list.length} violation(s) — ${RULE_DOCS[rule].says}`);
    lines.push(`  rule written in: ${RULE_DOCS[rule].source}`);
    for (const f of list) lines.push(`  · ${f.surface}\n      match: ${f.match}\n      text : ${f.excerpt}`);
  }
  return lines.join('\n');
}
