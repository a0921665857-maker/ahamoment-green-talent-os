import type { Locale } from '@/lib/constants';
import { sectors as SECTOR_TERMS, domains as DOMAIN_TERMS, type TaxonomyTerm } from '@/lib/taxonomy';

/**
 * One sentence of the reader's OWN facts, for the type-summary block that opens
 * the report (UX audit 2026-08-08: the type name first appeared on screen 10.4
 * of 13.3, i.e. after the conversion zone — most readers were asked to decide
 * before they were given the answer).
 *
 * Same discipline as lib/salaryBands.ts: a DETERMINISTIC lookup, zero LLM, zero
 * guessing. Only taxonomy slugs the extraction actually returned are printed,
 * mapped through the curated bilingual labels in lib/taxonomy.ts, so nothing raw
 * from a model or from pasted text ever lands on the first screen. Anything not
 * in the taxonomy is dropped rather than approximated.
 *
 * Returns null (block renders the type name alone) when there is nothing
 * defensible to say. A wrong fact in the reader's first two seconds costs more
 * than a missing one.
 */

/** Below this extraction confidence the facts may simply be wrong — say nothing. */
const MIN_CONFIDENCE = 0.4;
const MAX_SECTORS = 2;
const MAX_DOMAINS = 2;

const CJK = /[一-鿿]/;
const LATIN = /[A-Za-z0-9]/;

/**
 * Half-width space between a Chinese character and embedded Latin/numbers, per
 * the zh-TW craft rules (LOCALE_STYLE_NOTES / UX_PRINCIPLES: 「在 ESG 領域 7 年」).
 * Needed because the sentence is assembled from taxonomy labels at runtime:
 * joining 「GRI 永續報告」 and 「SBTi 目標設定」 with 「與」 produced
 * 「永續報告與SBTi」 in the first render of this block. Full-width punctuation is
 * deliberately not a trigger — 「：ESG」 and 「，6」 take no space.
 */
function spaceCjkLatin(s: string): string {
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const prev = s[i - 1];
    const ch = s[i];
    if (prev && ((CJK.test(prev) && LATIN.test(ch)) || (LATIN.test(prev) && CJK.test(ch)))) out += ' ';
    out += ch;
  }
  return out;
}

/**
 * Taxonomy labels are written sentence-cased for standalone use ("Carbon
 * markets"), which reads as a proper noun in the middle of a sentence. Lower the
 * first letter only when the label is ordinary prose: a second capital means the
 * first word is an acronym or brand (ESG, GRI, SBTi, GHG Scope 1–3) and must be
 * left alone.
 */
function midSentence(label: string): string {
  const acronymic = label.length > 1 && label[1] === label[1].toUpperCase() && /[A-Za-z]/.test(label[1]);
  return acronymic ? label : label.charAt(0).toLowerCase() + label.slice(1);
}

function labelsFor(slugs: string[], terms: TaxonomyTerm[], locale: Locale, max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slug of slugs) {
    if (typeof slug !== 'string') continue;
    const key = slug.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    const term = terms.find((t) => t.slug === key);
    if (!term) continue; // unmapped term: never printed, never guessed
    out.push(locale === 'zh-TW' ? term.label_zh : midSentence(term.label_en));
    if (out.length >= max) break;
  }
  return out;
}

export function profileFactLine(input: {
  locale: Locale;
  sectors: string[];
  domains: string[];
  yearsExperience: number | null;
  profileConfidence: number;
}): string | null {
  if (input.profileConfidence < MIN_CONFIDENCE) return null;

  const isZh = input.locale === 'zh-TW';
  const sectorLabels = labelsFor(input.sectors ?? [], SECTOR_TERMS, input.locale, MAX_SECTORS);
  const domainLabels = labelsFor(input.domains ?? [], DOMAIN_TERMS, input.locale, MAX_DOMAINS);
  // Years alone is too thin to be worth the reader's first screen — it has to sit
  // next to a sector or a domain to read as "this is about me".
  if (sectorLabels.length === 0 && domainLabels.length === 0) return null;

  const years =
    typeof input.yearsExperience === 'number' && Number.isFinite(input.yearsExperience)
      ? Math.round(input.yearsExperience)
      : null;

  const parts: string[] = [];
  if (sectorLabels.length) parts.push(isZh ? sectorLabels.join('、') : sectorLabels.join(' and '));
  if (years && years >= 1) parts.push(isZh ? `${years} 年資歷` : `${years} years of experience`);
  if (domainLabels.length) {
    const joined = isZh ? domainLabels.join('與') : domainLabels.join(' and ');
    // No hard-coded space after 「在」: spaceCjkLatin adds one only when the first
    // label starts with Latin (「主力在 GRI…」 vs 「主力在碳邊境調整機制…」).
    parts.push(isZh ? `主力在${joined}` : `mainly ${joined}`);
  }

  return isZh
    ? spaceCjkLatin(`這份判讀依據的是：${parts.join('，')}。`)
    : `This read is based on: ${parts.join(', ')}.`;
}
