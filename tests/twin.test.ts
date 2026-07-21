/**
 * Twin v1 golden tests: the magic-link token (the whole access control) and the
 * band diff (the product's one calculation). Both must be boring and exact.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { signTwinToken, verifyTwinToken, TWIN_LINK_TTL_MS } from '@/lib/twinAuth';
import { compareBands, BAND_KEYS } from '@/lib/scoring/compareBands';
import type { Bands } from '@/lib/types';

const SECRET = 'test-secret-twin';
let prevSecret: string | undefined;

beforeEach(() => {
  prevSecret = process.env.TWIN_LINK_SECRET;
  process.env.TWIN_LINK_SECRET = SECRET;
});
afterEach(() => {
  if (prevSecret === undefined) delete process.env.TWIN_LINK_SECRET;
  else process.env.TWIN_LINK_SECRET = prevSecret;
});

describe('twin magic-link token', () => {
  it('round-trips the email (lowercased, trimmed)', async () => {
    const token = await signTwinToken('  Someone@Example.COM ');
    expect(token).not.toBeNull();
    expect(await verifyTwinToken(token!)).toBe('someone@example.com');
  });

  it('rejects an expired token', async () => {
    const past = Date.now() - TWIN_LINK_TTL_MS - 1000;
    const token = await signTwinToken('a@b.co', past);
    expect(await verifyTwinToken(token!)).toBeNull();
  });

  it('rejects a tampered signature and a tampered payload', async () => {
    const token = (await signTwinToken('a@b.co'))!;
    const flipped = token.slice(0, -1) + (token.endsWith('0') ? '1' : '0');
    expect(await verifyTwinToken(flipped)).toBeNull();
    const parts = token.split('.');
    parts[1] = Buffer.from('evil@x.co', 'utf8').toString('base64url');
    expect(await verifyTwinToken(parts.join('.'))).toBeNull();
  });

  it('returns null when no secret is configured (feature off, never crashes)', async () => {
    delete process.env.TWIN_LINK_SECRET;
    const prevAdmin = process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_SESSION_SECRET;
    expect(await signTwinToken('a@b.co')).toBeNull();
    expect(await verifyTwinToken('twin.x.1.deadbeef')).toBeNull();
    if (prevAdmin !== undefined) process.env.ADMIN_SESSION_SECRET = prevAdmin;
  });
});

function mkBands(over: Partial<Bands> = {}): Bands {
  return {
    story_index: 'developing',
    mba_index: 'developing',
    climate_index: 'developing',
    commercial_credibility: 'developing',
    international_positioning: 'developing',
    interview_readiness: 'developing',
    cv_readiness: 'developing',
    green_economy_fit: 'developing',
    mba_readiness: 'developing',
    ...over,
  };
}

describe('compareBands', () => {
  it('covers all nine keys and marks unchanged as same', () => {
    const out = compareBands(mkBands(), mkBands());
    expect(out).toHaveLength(BAND_KEYS.length);
    expect(out.every((d) => d.direction === 'same')).toBe(true);
  });

  it('detects up and down movements', () => {
    const out = compareBands(
      mkBands({ story_index: 'emerging', cv_readiness: 'strong' }),
      mkBands({ story_index: 'strong', cv_readiness: 'emerging' }),
    );
    expect(out.find((d) => d.key === 'story_index')?.direction).toBe('up');
    expect(out.find((d) => d.key === 'cv_readiness')?.direction).toBe('down');
  });

  it('limited-data nulls are unknown, never a fake movement', () => {
    const out = compareBands(
      mkBands({ interview_readiness: null, cv_readiness: null }),
      mkBands({ interview_readiness: 'strong', cv_readiness: null }),
    );
    expect(out.find((d) => d.key === 'interview_readiness')?.direction).toBe('unknown');
    expect(out.find((d) => d.key === 'cv_readiness')?.direction).toBe('unknown');
  });
});
