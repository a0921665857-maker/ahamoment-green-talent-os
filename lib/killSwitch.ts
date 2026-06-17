import { DAILY_MRI_CAP } from '@/lib/constants';
import { getServiceClient } from '@/lib/supabase';

/**
 * Site-wide daily MRI kill switch (cost/abuse guard). Counts today's submissions
 * via the events table (material_submitted) so no extra table is needed. Returns
 * true once the cap is hit; a cap of ≤0 disables it.
 */
export async function isDailyCapReached(now: Date = new Date()): Promise<boolean> {
  if (!Number.isFinite(DAILY_MRI_CAP) || DAILY_MRI_CAP <= 0) return false;
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);

  const { count } = await getServiceClient()
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('name', 'material_submitted')
    .gte('created_at', start.toISOString());

  return (count ?? 0) >= DAILY_MRI_CAP;
}
