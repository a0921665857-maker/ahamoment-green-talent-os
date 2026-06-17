import { createHash } from 'node:crypto';
import { RATE_LIMIT } from '@/lib/constants';
import { getServiceClient } from '@/lib/supabase';

/**
 * In-Postgres sliding-window rate limit (ARCHITECTURE.md — no Redis).
 * Stores a salted hash of the IP, never the IP itself (no-PII rule).
 * Salt is ADMIN_SESSION_SECRET (already in the env contract).
 */
function hashIp(ip: string): string {
  const salt = process.env.ADMIN_SESSION_SECRET ?? 'dev-only-unsafe-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export async function checkRateLimit(
  ip: string,
  route: string,
  limit: number = RATE_LIMIT.submissionsPerHourPerIp,
): Promise<RateLimitResult> {
  const db = getServiceClient();
  const ip_hash = hashIp(ip);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await db
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ip_hash)
    .eq('route', route)
    .gte('created_at', since);

  const used = count ?? 0;
  if (used >= limit) return { allowed: false, remaining: 0 };

  await db.from('rate_limits').insert({ ip_hash, route });
  return { allowed: true, remaining: Math.max(0, limit - used - 1) };
}
