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

describe('email-gate copy reads as report delivery (O1; honest revision 2026-06-15)', () => {
  it('English copy is verbatim', () => {
    expect(en.questions.emailGate.body).toBe(
      "Enter your email and we'll generate your personal report right away. It appears on screen immediately and is saved to this link so you can return anytime.",
    );
  });
  it('Traditional Chinese copy is verbatim', () => {
    expect(zh.questions.emailGate.body).toBe(
      '輸入 email，我們會立即為你產出個人化報告。報告會即時顯示，並用這個連結為你保存，隨時可回來查看。',
    );
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
