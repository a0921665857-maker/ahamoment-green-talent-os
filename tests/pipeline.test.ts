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
import { mkProfile, mkScores } from './fixtures/scoreVectors';

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
