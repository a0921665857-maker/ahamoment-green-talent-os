import { describe, expect, it } from 'vitest';
import { getContent } from '@/content';
import { localeRegistry } from '@/content/locales';
import {
  LOCALES,
  OFFER_IDS,
  QUESTION_IDS,
  REPORT_SECTION_KEYS,
  RESULT_CATEGORIES,
} from '@/lib/constants';
import { PUBLIC_PAID_OFFER_IDS, priceFor } from '@/lib/services';

const en = getContent('en');
const zh = getContent('zh-TW');

describe('locale registry', () => {
  it('registers exactly the canonical locales', () => {
    expect(localeRegistry.map((l) => l.code).sort()).toEqual([...LOCALES].sort());
  });
});

describe('question bank parity (deterministic selection depends on this)', () => {
  it('both locales define exactly the canonical question IDs', () => {
    for (const c of [en, zh]) {
      expect(Object.keys(c.questions.questions).sort()).toEqual([...QUESTION_IDS].sort());
    }
  });

  it('select options share identical stable values across locales', () => {
    for (const id of QUESTION_IDS) {
      const a = en.questions.questions[id];
      const b = zh.questions.questions[id];
      expect(a.type).toBe(b.type);
      if (a.type === 'select') {
        expect(a.options?.map((o) => o.value)).toEqual(b.options?.map((o) => o.value));
        for (const o of [...(a.options ?? []), ...(b.options ?? [])]) {
          expect(o.label.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

/**
 * O1 (2026-06-15): the email gate must read as report delivery, not as a
 * newsletter signup — that framing is what the whole "effort after value"
 * sequence is paying for.
 *
 * It used to be locked verbatim. That was the wrong instrument: on 2026-08-08
 * the UX audit found the locked sentence itself was dishonest ("appears on
 * screen immediately" / 「報告會即時顯示」, while generation takes three to five
 * minutes), and the lock did nothing to catch it — a verbatim assertion only
 * proves a string has not changed, never that it is true. It also meant every
 * honest rewrite had to defeat a test first.
 *
 * So the intent is asserted instead: what the gate must promise, and what it
 * must never claim. Tone rules (no exclamation, no scarcity, no hype) are
 * enforced across every string by tests/constitutionLint.test.ts.
 */
describe('email-gate copy reads as report delivery, not a subscription (O1)', () => {
  it('promises the report and a link the reader can come back to', () => {
    expect(zh.questions.emailGate.body).toMatch(/報告/);
    expect(zh.questions.emailGate.body).toMatch(/連結|回來/);
    expect(en.questions.emailGate.body).toMatch(/report/i);
    expect(en.questions.emailGate.body).toMatch(/link|come back|return/i);
  });

  it('does not sell a subscription or a mailing list', () => {
    expect(zh.questions.emailGate.body).not.toMatch(/訂閱|電子報|週刊/);
    expect(en.questions.emailGate.body).not.toMatch(/subscribe|newsletter|mailing list/i);
  });

  it('claims no instant delivery the pipeline cannot honour', () => {
    // Generation is a 3–5 minute LLM job (docs/UX_PRINCIPLES.md #5, honest
    // progress). Anything that says "immediately" here is a promise the report
    // page then breaks in front of the reader.
    expect(zh.questions.emailGate.body).not.toMatch(/立即|馬上|即時顯示|瞬間|一秒/);
    expect(en.questions.emailGate.body).not.toMatch(/\b(?:immediately|right away|instantly)\b/i);
    // "not instant" is the honest form and stays legal; a bare "is instant" does not.
    expect(en.questions.emailGate.body).not.toMatch(/(?<!\bnot\s)(?<!n['’]t\s)\bis instant\b/i);
  });
});

describe('result categories', () => {
  it('all 8 categories carry complete copy in both locales', () => {
    for (const c of [en, zh]) {
      for (const cat of RESULT_CATEGORIES) {
        const copy = c.results[cat];
        for (const field of ['name', 'explanation', 'whyItMatters', 'mainRisk', 'nextMove', 'offerLine', 'cta'] as const) {
          expect(copy[field].length, `${cat}.${field}`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('report templates', () => {
  it('all 12 sections have titles and fallbacks in both locales', () => {
    for (const c of [en, zh]) {
      for (const key of REPORT_SECTION_KEYS) {
        expect(c.reportTemplates.sections[key].title.length).toBeGreaterThan(0);
        expect(c.reportTemplates.sections[key].fallback.length).toBeGreaterThan(0);
      }
    }
  });
  it('band labels follow the bilingual spec', () => {
    expect(en.reportTemplates.bandLabels).toEqual({ emerging: 'Emerging', developing: 'Developing', strong: 'Strong' });
    expect(zh.reportTemplates.bandLabels).toEqual({ emerging: '萌芽', developing: '發展中', strong: '紮實' });
  });
});

describe('paid offers', () => {
  it('every offer id has copy in both locales', () => {
    for (const c of [en, zh]) {
      for (const id of OFFER_IDS) {
        expect(c.paidOffers.offers[id].name.length).toBeGreaterThan(0);
        expect(c.paidOffers.offers[id].blurb.length).toBeGreaterThan(0);
      }
    }
  });

  /**
   * The single-source rule. A public price must exist in exactly one place —
   * lib/services.ts — so a stale locale string can never disagree with what the
   * payment link charges. Archived offers keep their historical strings.
   */
  it('public paid offers carry no price string in content', () => {
    for (const c of [en, zh]) {
      for (const id of PUBLIC_PAID_OFFER_IDS) {
        expect(c.paidOffers.offers[id].price).toBeUndefined();
      }
    }
  });

  it('publishes the founder-authorised price per market', () => {
    for (const id of PUBLIC_PAID_OFFER_IDS) {
      expect(priceFor(id, 'zh-TW').display).toBe('NT$6,800');
      expect(priceFor(id, 'en').display).toBe('SGD 420');
      expect(priceFor(id, 'zh-TW').currency).toBe('TWD');
      expect(priceFor(id, 'en').currency).toBe('SGD');
    }
  });

  it('no public price is hedged with a "from" qualifier', () => {
    for (const id of PUBLIC_PAID_OFFER_IDS) {
      for (const loc of ['en', 'zh-TW'] as const) {
        const d = priceFor(id, loc).display;
        expect(d).not.toMatch(/起|from|\+/i);
      }
    }
  });

  /** Gate 8 removed the refund guarantee: with no company entity behind it, it
   * was a promise that could not be executed. This guards the removal. */
  it('carries no refund guarantee in either locale', () => {
    for (const c of [en, zh]) {
      const surface = JSON.stringify(c.paidOffers);
      expect(surface).not.toMatch(/全額退費|full refund|退費保證/i);
    }
  });

  it('both public services state what they do not do', () => {
    for (const c of [en, zh]) {
      for (const id of PUBLIC_PAID_OFFER_IDS) {
        expect(c.paidOffers.offers[id].notIncluded?.length ?? 0).toBeGreaterThanOrEqual(2);
        expect(c.paidOffers.offers[id].decisionMoment?.length ?? 0).toBeGreaterThan(0);
      }
    }
  });
});

describe('email templates', () => {
  it('every template carries the report_url placeholder', () => {
    for (const c of [en, zh]) {
      for (const t of [c.emails.d0, c.emails.d2, c.emails.d6]) {
        expect(t.body).toContain('{{report_url}}');
        expect(t.subject.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('consent copy (binding, PRIVACY_AND_CONSENT.md)', () => {
  it('zh processing label is verbatim', () => {
    expect(zh.consent.processing.label).toBe('我同意系統以 AI 處理我提供的資料，用於產生我的綠色職涯 MRI 報告。');
  });
  it('en processing label is verbatim', () => {
    expect(en.consent.processing.label).toBe(
      'I agree that my uploaded materials will be processed by AI to generate my Green Career MRI report.',
    );
  });
});
