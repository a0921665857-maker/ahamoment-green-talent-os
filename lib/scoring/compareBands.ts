/**
 * Deterministic band-to-band comparison between two reports — the Twin's
 * "compared with last time" block. Works on the user-facing Bands (not raw
 * scores) so the diff always matches what both reports actually showed.
 */
import type { Band } from '@/lib/constants';
import type { Bands } from '@/lib/types';

export const BAND_KEYS = [
  'story_index',
  'mba_index',
  'climate_index',
  'commercial_credibility',
  'international_positioning',
  'interview_readiness',
  'cv_readiness',
  'green_economy_fit',
  'mba_readiness',
] as const;
export type BandKey = (typeof BAND_KEYS)[number];

const RANK: Record<Band, number> = { emerging: 0, developing: 1, strong: 2 };

export interface BandDelta {
  key: BandKey;
  from: Band | null;
  to: Band | null;
  direction: 'up' | 'down' | 'same' | 'unknown';
}

export function compareBands(prev: Bands, next: Bands): BandDelta[] {
  return BAND_KEYS.map((key) => {
    const from = prev[key] ?? null;
    const to = next[key] ?? null;
    let direction: BandDelta['direction'];
    if (from === null || to === null) direction = 'unknown';
    else if (RANK[to] > RANK[from]) direction = 'up';
    else if (RANK[to] < RANK[from]) direction = 'down';
    else direction = 'same';
    return { key, from, to, direction };
  });
}
