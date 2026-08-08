/**
 * CONSTITUTION LINT — the test.
 *
 * The 2026-08-08 conversion-UX audit found three copy defects that had been
 * live for months and were caught only because a human read every page:
 * manufactured scarcity in the daily-cap error, a promise that the report
 * "appears immediately", and a privacy page describing a Stripe checkout nobody
 * used. Michael maintains two locales alone, roughly three hours a week. A
 * rule that only a careful reader enforces is a rule that decays.
 *
 * So the written rules run here instead. Rule definitions and their citations
 * live in scripts/constitution/rules.ts; the surfaces they run over live in
 * scripts/constitution/surfaces.ts. The same code powers
 * `npx tsx scripts/constitution-lint.ts`, so a violation can be listed without
 * reading vitest output.
 *
 * The suite is deliberately split one-test-per-rule: a failure names the rule,
 * quotes the doc it comes from, and prints every offending string with its
 * dotted path, so the fix needs no investigation.
 */
import { describe, expect, it } from 'vitest';
import {
  type Finding,
  type RuleId,
  GUARANTEE_ALLOWED,
  RETIRED_OFFER_IDS,
  RULE_DOCS,
  formatFindings,
  lintText,
} from '@/scripts/constitution/rules';
import { allSurfaces, allowedPrices, extractLiterals, looksLikeCode } from '@/scripts/constitution/surfaces';
import { ARCHIVED_OFFER_IDS } from '@/lib/services';

const surfaces = allSurfaces();
const prices = allowedPrices();

const findings: Finding[] = surfaces.flatMap((s) =>
  lintText(s.path, s.text, { sellingSurface: s.selling, marketingSurface: s.marketing, allowedPrices: prices }),
);

function of(rule: RuleId): Finding[] {
  return findings.filter((f) => f.rule === rule);
}

function report(rule: RuleId): string {
  return `\n${RULE_DOCS[rule].says}\n(written in ${RULE_DOCS[rule].source})\n${formatFindings(of(rule))}\n`;
}

/* ------------------------------- sanity first -------------------------------- */

describe('the lint is actually wired to something', () => {
  it('collects the whole public copy surface, not a stub', () => {
    // Two locales of full page copy plus fifteen stand-alone modules plus the
    // hard-coded page literals. If this collapses, every rule below passes
    // vacuously — which is exactly how a lint dies quietly.
    expect(surfaces.length).toBeGreaterThan(1500);
    expect(surfaces.some((s) => s.path.startsWith('zh-TW.'))).toBe(true);
    expect(surfaces.some((s) => s.path.startsWith('en.'))).toBe(true);
    expect(surfaces.some((s) => s.path.endsWith('.html'))).toBe(true);
    expect(surfaces.some((s) => s.path.includes('.tsx:'))).toBe(true);
  });

  it('still detects every rule on a deliberately violating string', () => {
    const caught = (text: string, selling = false) =>
      lintText('probe', text, { sellingSurface: selling, marketingSurface: true, allowedPrices: prices }).map(
        (f) => f.rule,
      );

    expect(caught('點這裡買 deep_read')).toContain('retired-offer-id');
    expect(caught('已複製！可貼到 Threads')).toContain('exclamation');
    expect(caught('Copied! Paste it anywhere')).toContain('exclamation');
    expect(caught('今天的 MRI 名額已額滿，我們刻意限量以維持品質。')).toContain('scarcity');
    expect(caught('只剩 3 個名額')).toContain('scarcity');
    expect(caught('Only 3 spots left, last chance')).toContain('scarcity');
    expect(caught('保證錄取，三分鐘秒懂')).toContain('hype');
    expect(caught('Results guaranteed, delivered instantly')).toContain('hype');
    expect(caught('特價 NT$1,200', true)).toContain('price-drift');
    // …and off the selling surfaces too, when the sentence is about his own service.
    expect(caught('一對一診斷 NT$3,000 起')).toContain('price-drift');
    expect(caught('這是一個判斷——不是資訊')).toContain('em-dash-zh');
    expect(caught('付款完全由 Stripe 處理')).toContain('self-checkout');
  });

  it('does not fire on the compliant forms of the same words', () => {
    // Knowledge corpus by default: the surface where 保證 legitimately means an
    // assurance level. Marketing surfaces are probed separately below.
    const clean = (text: string, selling = false) =>
      lintText('probe', text, { sellingSurface: selling, marketingSurface: false, allowedPrices: prices });

    // Denials of scarcity are the honest fix, not the defect.
    expect(clean('這是每日成本上限，不是名額限制。')).toEqual([]);
    expect(clean('That is a daily cost ceiling, not a limit on places.')).toEqual([]);
    // Assurance levels and contract vocabulary in the judgement corpus.
    expect(clean('有限保證與合理保證是兩個不同等級')).toEqual([]);
    expect(clean('請母公司出具履約保證與差額補足承諾')).toEqual([]);
    expect(clean('政府保證用固定價格把電全部收購')).toEqual([]);
    expect(clean('能判斷一份第三方確信實際保證了什麼')).toEqual([]);
    expect(clean('judge what an assurance opinion actually guarantees')).toEqual([]);
    expect(clean('不保證薪資。')).toEqual([]);
    // Analytical 只剩, not a countdown.
    expect(clean('到第 15 年售電收入只剩 9,322 萬元')).toEqual([]);
    // The em dash is a zh-only ban; English prose keeps it.
    expect(clean('The report is not instant — it takes three to five minutes.')).toEqual([]);
    // Authorised prices on a selling surface.
    expect(clean('NT$6,800', true)).toEqual([]);
    expect(clean('SGD 420', true)).toEqual([]);
    // Salary data is not a service price, so it is never price-checked.
    expect(clean('房租（套房）NT$9,000–15,000')).toEqual([]);
    // Nor are government fees and work-pass thresholds in the Singapore guide,
    // even when the same page later discusses what an agency charges.
    expect(clean('EP 最低固定月薪 S$5,600 起、隨年齡遞增（45 歲以上 S$10,700）。')).toEqual([]);
    expect(clean('獲批後 Entry Permit S$20 ＋5 年 REP S$50 ＋身分證 S$50。自辦全程約 S$220，代辦收費常是十倍以上。')).toEqual([]);
  });

  it('still bans 保證 outright on persuasion surfaces', () => {
    const onMarketing = (text: string) =>
      lintText('probe', text, { marketingSurface: true, allowedPrices: prices }).map((f) => f.rule);
    // The same sentence that is legitimate teaching in the judgement corpus is
    // a promise when it appears in the product's own voice.
    expect(onMarketing('這份報告保證讀懂市場')).toContain('hype');
    // …but a denial stays legal on every surface, in both locales.
    expect(onMarketing('不保證錄取，也不承諾薪資。')).toEqual([]);
  });

  it('keeps the retired-offer list identical to lib/services.ts', () => {
    expect([...RETIRED_OFFER_IDS].sort()).toEqual([...ARCHIVED_OFFER_IDS].sort());
  });

  it('every 保證 exemption carries a written reason', () => {
    for (const entry of GUARANTEE_ALLOWED) expect(entry.why.length).toBeGreaterThan(20);
  });

  it('separates copy from code before linting', () => {
    const src = [
      "const a = 'https://example.com/x'; // don't! flag comments!",
      '/* block comment with 名額 and ！ */',
      "const cls = 'mt-4 flex items-center text-sm';",
      'const msg = <p>報告寫好會寄給你</p>;',
    ].join('\n');
    const literals = extractLiterals(src).filter((l) => !looksLikeCode(l.text));
    expect(literals.map((l) => l.text)).toContain('報告寫好會寄給你');
    expect(literals.some((l) => l.text.includes('名額'))).toBe(false);
    expect(literals.some((l) => l.text.includes('flex items-center'))).toBe(false);
  });
});

/* --------------------------------- the rules --------------------------------- */

describe('constitution lint', () => {
  it('names no service that is no longer sold', () => {
    expect(of('retired-offer-id'), report('retired-offer-id')).toEqual([]);
  });

  it('uses no exclamation marks, half-width or full-width', () => {
    expect(of('exclamation'), report('exclamation')).toEqual([]);
  });

  it('manufactures no scarcity and no countdown', () => {
    expect(of('scarcity'), report('scarcity')).toEqual([]);
  });

  it('promises no guarantees and uses no hype vocabulary', () => {
    expect(of('hype'), report('hype')).toEqual([]);
  });

  it('prints no price that lib/services.ts does not authorise', () => {
    expect(of('price-drift'), report('price-drift')).toEqual([]);
  });

  it('uses no U+2014 em dash in Traditional Chinese copy', () => {
    expect(of('em-dash-zh'), report('em-dash-zh')).toEqual([]);
  });

  it('describes no self-serve checkout and names no payment processor', () => {
    expect(of('self-checkout'), report('self-checkout')).toEqual([]);
  });
});
