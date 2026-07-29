import { getServiceClient } from '@/lib/supabase';

/**
 * 90-day raw-material purge.
 *
 * The consent copy, the privacy page, the landing page and the intake flow all
 * state in both languages that uploaded material is deleted after 90 days. Up
 * to Gate 8 that was a manual SQL snippet in MAINTENANCE_GUIDE.md with no
 * execution record — a written promise with nothing enforcing it.
 *
 * What is purged: `source_materials.raw_text`, i.e. the CV or paste itself, the
 * single largest PII surface in the product. `purged_at` is stamped so a row is
 * never processed twice and so the last run is auditable.
 *
 * What is NOT purged: the extracted profile, scores and report. Those are
 * PII-minimised derivatives the person still needs in order to open their own
 * report link, and the consent copy scopes the 90 days to uploaded material.
 * Full deletion stays a separate, immediate action (admin delete).
 */

export const RAW_RETENTION_DAYS = 90;

export interface PurgeResult {
  /** Rows whose raw_text was cleared this run. */
  purged: number;
  /** Rows already past retention but with raw_text already null. */
  alreadyClean: number;
  cutoffIso: string;
  dryRun: boolean;
}

export function cutoffFor(now: Date, days: number = RAW_RETENTION_DAYS): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

/**
 * `dryRun` counts what would go without writing anything — the safe first run,
 * and the mode used by the test endpoint before this is trusted in production.
 */
export async function runPurge(now: Date, dryRun: boolean): Promise<PurgeResult> {
  const cutoff = cutoffFor(now);
  const cutoffIso = cutoff.toISOString();
  const db = getServiceClient();

  const { data: due, error } = await db
    .from('source_materials')
    .select('id, raw_text')
    .lt('created_at', cutoffIso)
    .is('purged_at', null);

  if (error) throw new Error(`purge_select_failed: ${error.message}`);

  const rows = due ?? [];
  const withText = rows.filter((r) => r.raw_text !== null && r.raw_text !== '');
  const alreadyClean = rows.length - withText.length;

  if (dryRun) {
    return { purged: withText.length, alreadyClean, cutoffIso, dryRun: true };
  }

  let purged = 0;
  // Chunked so one oversized batch cannot time out the whole run and leave the
  // promise unmet for another week.
  const ids = rows.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 200) {
    const slice = ids.slice(i, i + 200);
    const { error: upErr } = await db
      .from('source_materials')
      .update({ raw_text: null, purged_at: new Date().toISOString() })
      .in('id', slice);
    if (upErr) throw new Error(`purge_update_failed: ${upErr.message}`);
    purged += slice.length;
  }

  return { purged, alreadyClean, cutoffIso, dryRun: false };
}
