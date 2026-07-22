import { describe, expect, it } from 'vitest';
import { posthogHost } from '@/lib/posthogHost';

describe('posthogHost normalization (2026-07-22 silent-black-hole incident)', () => {
  it('missing or empty env falls back to the EU ingest host', () => {
    expect(posthogHost(undefined)).toBe('https://eu.i.posthog.com');
    expect(posthogHost(null)).toBe('https://eu.i.posthog.com');
    expect(posthogHost('  ')).toBe('https://eu.i.posthog.com');
  });

  it('legacy and US hosts are rewritten to the EU ingest host', () => {
    expect(posthogHost('https://app.posthog.com')).toBe('https://eu.i.posthog.com');
    expect(posthogHost('https://us.i.posthog.com')).toBe('https://eu.i.posthog.com');
    expect(posthogHost('https://us.posthog.com')).toBe('https://eu.i.posthog.com');
  });

  it('EU app host is rewritten to the EU ingest subdomain; trailing slash tolerated', () => {
    expect(posthogHost('https://eu.posthog.com/')).toBe('https://eu.i.posthog.com');
  });

  it('the correct EU ingest host and custom domains pass through unchanged', () => {
    expect(posthogHost('https://eu.i.posthog.com')).toBe('https://eu.i.posthog.com');
    expect(posthogHost('https://ph.example.com')).toBe('https://ph.example.com');
  });
});
