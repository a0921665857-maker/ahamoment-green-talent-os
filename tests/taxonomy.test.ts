import { describe, expect, it } from 'vitest';
import { labelFor, normalizeGreenEconomy } from '@/lib/taxonomy';

const ge = (over: Partial<Record<'sectors' | 'functions' | 'domains' | 'free_text', string[]>>) => ({
  sectors: [],
  functions: [],
  domains: [],
  free_text: [],
  depth: 'core',
  ...over,
});

describe('normalizeGreenEconomy', () => {
  it('re-homes a known slug filed under the wrong group (walkthrough F5)', () => {
    const out = normalizeGreenEconomy(
      ge({ sectors: ['carbon-markets'], domains: ['sustainable-supply-chain', 'csrd'] }),
    );
    expect(out.sectors).toEqual(['carbon-markets', 'sustainable-supply-chain']);
    expect(out.domains).toEqual(['csrd']);
    expect(out.free_text).toEqual([]);
  });

  it('moves truly unknown slugs into free_text without duplicating', () => {
    const out = normalizeGreenEconomy(
      ge({ domains: ['esg-storytelling', 'esg-storytelling'], free_text: ['existing note'] }),
    );
    expect(out.domains).toEqual([]);
    expect(out.free_text).toEqual(['existing note', 'esg-storytelling']);
  });

  it('keeps correctly-grouped slugs, dedupes, and passes depth through', () => {
    const out = normalizeGreenEconomy(
      ge({ sectors: ['green-finance', 'green-finance'], functions: ['consulting'], domains: ['vcm'] }),
    );
    expect(out.sectors).toEqual(['green-finance']);
    expect(out.functions).toEqual(['consulting']);
    expect(out.domains).toEqual(['vcm']);
    expect(out.depth).toBe('core');
  });
});

describe('labelFor', () => {
  it('falls back across groups instead of leaking a known slug', () => {
    expect(labelFor('domains', 'sustainable-supply-chain', 'zh-TW')).toBe('永續供應鏈');
    expect(labelFor('domains', 'sustainable-supply-chain', 'en')).toBe('Sustainable supply chain');
  });

  it('labels in-group slugs as before', () => {
    expect(labelFor('sectors', 'carbon-markets', 'zh-TW')).toBe('碳市場');
  });

  it('returns the slug only when truly unknown everywhere', () => {
    expect(labelFor('sectors', 'not-a-real-slug', 'en')).toBe('not-a-real-slug');
  });
});
