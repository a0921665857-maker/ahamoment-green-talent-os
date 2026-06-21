import { describe, expect, it } from 'vitest';
import { applyUserEdits } from '@/lib/pipeline';
import { isNonApplicantIntent, localeRedirectPath } from '@/lib/reportView';
import type { ExtractedProfile } from '@/lib/types';

function baseProfile(): ExtractedProfile {
  return {
    identity: {
      current_role: 'Old Role',
      current_org: 'Old Org',
      years_experience: 5,
      location: null,
      languages: null,
      seniority: 'mid',
    },
    career_history: [],
    education: [],
    green_economy: { sectors: [], functions: [], domains: [], free_text: [], depth: 'aspiring' },
    credentials: [],
    evidence_assets: [],
    commercial_signals: { revenue_or_budget_ownership: null, client_facing: null, quantified_results: [] },
    intent: { mba_intent: 'unknown', target_move: 'old target', timeline: 'unknown', geography: null },
    story_signals: { differentiators: [], risks: [] },
    confidence: { identity: 0.5, career_history: 0.5, green_economy: 0.5, commercial: 0.5, intent: 0.5, overall: 0.5 },
    missing_fields: [],
  };
}

describe('applyUserEdits — corrections reach the working profile', () => {
  it('null edits returns the profile unchanged', () => {
    const p = baseProfile();
    expect(applyUserEdits(p, null)).toEqual(p);
  });

  it('overwrites current_role / current_org / intent target', () => {
    const out = applyUserEdits(baseProfile(), {
      current_role: 'New Role',
      current_org: 'New Org',
      intent_note: 'Head of Origination',
    });
    expect(out.identity.current_role).toBe('New Role');
    expect(out.identity.current_org).toBe('New Org');
    expect(out.intent.target_move).toBe('Head of Origination');
  });

  it('appends sectors_note and career_summary (never silently drops extracted data)', () => {
    const out = applyUserEdits(baseProfile(), {
      sectors_note: 'Article 6 and CORSIA',
      career_summary: 'closed $40M of forward-purchase deals',
    });
    expect(out.green_economy.free_text).toContain('Article 6 and CORSIA');
    expect(out.story_signals.differentiators).toContain('closed $40M of forward-purchase deals');
  });

  it('does not mutate the original profile', () => {
    const p = baseProfile();
    applyUserEdits(p, { current_role: 'Mutated?' });
    expect(p.identity.current_role).toBe('Old Role');
  });
});

describe('isNonApplicantIntent — only applicants get MBA-applicant framing', () => {
  it.each(['no', 'current', 'unknown'] as const)('%s → non-applicant (true)', (i) => {
    expect(isNonApplicantIntent(i)).toBe(true);
  });
  it.each(['active', 'considering', 'later'] as const)('%s → applicant (false)', (i) => {
    expect(isNonApplicantIntent(i)).toBe(false);
  });
  it('undefined → non-applicant (safe default)', () => {
    expect(isNonApplicantIntent(undefined)).toBe(true);
  });
});

describe('localeRedirectPath — report locale is authoritative', () => {
  it('same locale → no redirect', () => {
    expect(localeRedirectPath('zh-TW', 'zh-TW', 'tok')).toBeNull();
  });
  it('mismatched locale → redirect to the report locale', () => {
    expect(localeRedirectPath('zh-TW', 'en', 'tok')).toBe('/zh-TW/result/tok');
    expect(localeRedirectPath('en', 'zh-TW', 'tok')).toBe('/en/result/tok');
  });
});
