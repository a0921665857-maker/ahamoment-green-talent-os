/**
 * Golden tests for the LLM-boundary orchestration (pipeline.ts) — the paid
 * funnel's degraded paths must never regress silently: a scoring failure has to
 * land on profile_building_needed + degraded, and a report failure has to land
 * on template fallbacks, never a crash or a half-report.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Answer } from '@/lib/types';

const callPromptMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/anthropic', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/anthropic')>();
  return { ...mod, callPrompt: callPromptMock };
});

import { PromptValidationError } from '@/lib/anthropic';
import { applyUserEdits, generateReport, scoreAndClassify } from '@/lib/pipeline';
import { REPORT_SECTION_KEYS } from '@/lib/constants';
import { ReportSectionsSchema, type ReportSections } from '@/lib/types';
import { validateInternationalPositioningBody } from '@/lib/reportView';
import { mkProfile, mkScores } from './fixtures/scoreVectors';

/** Fills every section with a trivially-valid placeholder body, then overrides one. */
function mkSections(
  overrides: Partial<Record<(typeof REPORT_SECTION_KEYS)[number], { body: string; evidence_ref: string }>>,
): ReportSections['sections'] {
  const out = {} as ReportSections['sections'];
  for (const k of REPORT_SECTION_KEYS) {
    out[k] = overrides[k] ?? { body: 'placeholder body text', evidence_ref: 'placeholder evidence' };
  }
  return out;
}

const noAnswers: Answer[] = [];
const validationError = new PromptValidationError('dimension_scoring', 'score out of range', '{"raw":true}');

beforeEach(() => {
  callPromptMock.mockReset();
});

describe('applyUserEdits — user notes append, never overwrite extraction', () => {
  it('appends taxonomy notes to free_text instead of touching structured slugs', () => {
    const profile = mkProfile();
    const before = structuredClone(profile.green_economy);
    const next = applyUserEdits(profile, {
      sectors_note: '也做過離岸風電盡調',
      domains_note: 'CBAM 申報支援',
    });
    expect(next.green_economy.sectors).toEqual(before.sectors);
    expect(next.green_economy.domains).toEqual(before.domains);
    expect(next.green_economy.free_text).toEqual([
      ...before.free_text,
      '也做過離岸風電盡調',
      'CBAM 申報支援',
    ]);
    // The original object must not be mutated (structuredClone contract).
    expect(profile.green_economy.free_text).toEqual(before.free_text);
  });

  it('null edits are a no-op', () => {
    const profile = mkProfile();
    expect(applyUserEdits(profile, null)).toEqual(profile);
  });
});

describe('scoreAndClassify — degraded regression (walkthrough failure class)', () => {
  it('scoring validation failure → profile_building_needed + degraded, not a crash', async () => {
    callPromptMock.mockRejectedValueOnce(validationError);
    const out = await scoreAndClassify(mkProfile(), noAnswers);
    expect(out.degraded).toBe(true);
    expect(out.classification.category).toBe('profile_building_needed');
    expect(out.classification.degraded).toBe(true);
    // Degraded scores stay in-range so downstream bands never see garbage.
    for (const s of Object.values(out.scores)) {
      expect(s.score).toBeGreaterThanOrEqual(1);
      expect(s.score).toBeLessThanOrEqual(5);
    }
  });

  it('non-validation errors still throw (infra failures must stay loud)', async () => {
    callPromptMock.mockRejectedValueOnce(new Error('network down'));
    await expect(scoreAndClassify(mkProfile(), noAnswers)).rejects.toThrow('network down');
  });

  it('happy path passes LLM scores through untouched', async () => {
    const scores = mkScores({ green_economy_fit: { score: 4.5 } });
    callPromptMock.mockResolvedValueOnce(scores);
    const out = await scoreAndClassify(mkProfile(), noAnswers);
    expect(out.degraded).toBe(false);
    expect(out.scores.green_economy_fit.score).toBe(4.5);
  });
});

describe('generateReport — degraded fallback keeps the report whole', () => {
  it('report validation failure → every section filled from templates, flagged degraded', async () => {
    callPromptMock.mockRejectedValueOnce(validationError); // scoring ok below, report fails
    const scores = mkScores();
    callPromptMock.mockReset();
    callPromptMock.mockResolvedValueOnce(scores);
    const scored = await scoreAndClassify(mkProfile(), noAnswers);

    callPromptMock.mockRejectedValueOnce(
      new PromptValidationError('mri_report', 'missing section', '{}'),
    );
    const { sections, degraded } = await generateReport('zh-TW', mkProfile(), scored);
    expect(degraded).toBe(true);
    const bodies = Object.values(sections);
    expect(bodies.length).toBeGreaterThan(0);
    for (const s of bodies) {
      expect(s.body.length).toBeGreaterThan(0);
      expect(s.evidence_ref).toBe('degraded-fallback');
    }
  });

  it('both locales produce complete fallback sections (F4 class: no locale gap)', async () => {
    callPromptMock.mockResolvedValueOnce(mkScores());
    const scored = await scoreAndClassify(mkProfile(), noAnswers);
    for (const locale of ['zh-TW', 'en'] as const) {
      callPromptMock.mockRejectedValueOnce(new PromptValidationError('mri_report', 'x', '{}'));
      const { sections } = await generateReport(locale, mkProfile(), scored);
      for (const s of Object.values(sections)) expect(s.body.length).toBeGreaterThan(0);
    }
  });
});

describe('generateReport — section 08 (international_positioning) three-layer contract', () => {
  // Verbatim source snippet the golden bodies are allowed to quote (evidence_assets style).
  const sourceSnippets = ['主導 SBTi 目標設定，橫跨 8 個客戶', 'Led SBTi target setting for 8 clients'];

  const goldenZhTW =
    '你的輪廓目前在歐盟碳市場相關角色讀得最強，「主導 SBTi 目標設定，橫跨 8 個客戶」是那個具體訊號，讓專業能力清楚跨境成立；但敘述仍以台灣客戶為主，跨到東南亞市場時可信度會被打折。' +
    '你可以這樣說：我曾主導跨國 SBTi 目標設定計畫，橫跨 8 家企業客戶的碳路徑規劃。' +
    '下一步：把履歷開頭第一行從『ESG 顧問』的頭銜，改寫成點名跨國碳路徑角色的說法，讓市場定位在六秒內被讀到。';

  const goldenEn =
    'Your profile currently reads strongest for EU carbon-market roles: "Led SBTi target setting for 8 clients" is the one signal that travels, though your case studies still center Taiwan clients, so cross-region credibility is not yet lit up for Southeast Asia. ' +
    "You could put it this way: I led SBTi target-setting programs spanning eight enterprise clients' carbon transition roadmaps. " +
    'One move: open your CV headline with the cross-border carbon-strategy framing instead of the generic ESG consultant title, so the market read lands in six seconds.';

  it('golden zh-TW and en bodies pass the schema AND carry all three layers, no dash, no fabricated quotes', async () => {
    callPromptMock.mockResolvedValueOnce(mkScores());
    const scored = await scoreAndClassify(mkProfile(), noAnswers);

    for (const [locale, body] of [
      ['zh-TW', goldenZhTW],
      ['en', goldenEn],
    ] as const) {
      const mocked = { sections: mkSections({ international_positioning: { body, evidence_ref: 'CBAM/SBTi framework experience' } }) };
      // zod (ReportSectionsSchema) still passes — the specificity contract only needs a non-empty string.
      expect(ReportSectionsSchema.safeParse(mocked).success).toBe(true);

      callPromptMock.mockResolvedValueOnce(mocked);
      const { sections, degraded } = await generateReport(locale, mkProfile(), scored);
      expect(degraded).toBe(false);

      const result = validateInternationalPositioningBody(sections.international_positioning.body, sourceSnippets);
      expect(result.issues).toEqual([]);
      expect(result.ok).toBe(true);
    }
  });

  it('regression guard: a shallow single-observation body (the old Wendy-flagged shape) passes zod but fails the layer contract', () => {
    // Verbatim, pre-fix production copy (content/sampleReport.ts) — names the read, never says
    // how to phrase it or what to do next. This is exactly what the fix must catch.
    const shallowZhTW =
      '你的輪廓目前偏台灣在地。CBAM 與 TCFD 是國際框架，是你少數帶得走、跨市場都讀得懂的訊號，但你的經驗敘述仍以台灣客戶為主，跨區可信度尚未被點亮。';
    const shallowMocked = { sections: mkSections({ international_positioning: { body: shallowZhTW, evidence_ref: 'x' } }) };
    expect(ReportSectionsSchema.safeParse(shallowMocked).success).toBe(true);
    const shallowResult = validateInternationalPositioningBody(shallowZhTW, sourceSnippets);
    expect(shallowResult.ok).toBe(false);
    expect(shallowResult.issues).toEqual(
      expect.arrayContaining([expect.stringContaining('layer 2'), expect.stringContaining('layer 3')]),
    );

    // An em dash slipping into an otherwise-complete zh-TW body must also fail.
    const dashedBody = goldenZhTW.replace('讓市場定位在六秒內被讀到。', '讓市場定位——在六秒內被讀到。');
    const dashedResult = validateInternationalPositioningBody(dashedBody, sourceSnippets);
    expect(dashedResult.ok).toBe(false);
    expect(dashedResult.issues).toEqual(expect.arrayContaining([expect.stringContaining('em dash')]));

    // A quote that is NOT in the person's own material must be flagged as fabricated.
    const fabricatedQuoteBody = goldenZhTW.replace(
      '「主導 SBTi 目標設定，橫跨 8 個客戶」',
      '「拯救了整個亞太區的碳交易市場」',
    );
    const fabricatedResult = validateInternationalPositioningBody(fabricatedQuoteBody, sourceSnippets);
    expect(fabricatedResult.ok).toBe(false);
    expect(fabricatedResult.issues).toEqual(
      expect.arrayContaining([expect.stringContaining('quoted span not found verbatim')]),
    );
  });
});
