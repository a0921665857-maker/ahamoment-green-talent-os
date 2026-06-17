import { NextRequest } from 'next/server';
import { z } from 'zod';
import { FOLLOWUP_STATUSES } from '@/lib/constants';
import { getServiceClient } from '@/lib/supabase';
import { errorJson, json } from '@/lib/http';
import { ADMIN_COOKIE_NAME, verifyAdminCookie } from '@/lib/adminAuth';

export const runtime = 'nodejs';

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;
  return verifyAdminCookie(req.cookies.get(ADMIN_COOKIE_NAME)?.value, secret);
}

const PatchSchema = z.object({
  session_id: z.string().uuid(),
  followup_status: z.enum(FOLLOWUP_STATUSES).optional(),
  admin_notes: z.string().max(4000).optional(),
  paid_offer_purchased: z.string().max(64).optional(),
});

export async function PATCH(req: NextRequest) {
  if (!(await requireAdmin(req))) return errorJson('unauthorized', 401);
  let body;
  try {
    body = PatchSchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }
  const { session_id, ...fields } = body;
  if (Object.keys(fields).length === 0) return errorJson('generic', 400);

  const { error } = await getServiceClient().from('mri_sessions').update(fields).eq('id', session_id);
  if (error) return errorJson('generic', 500);
  return json({ ok: true });
}

const DeleteSchema = z.object({ session_id: z.string().uuid() });

/**
 * Hard-delete user data and anonymize the session (DATA_MODEL.md deletion
 * procedure). Child rows cascade via FK on delete; we additionally null the
 * raw text first, then null PII on the session and stamp deleted_at. Events are
 * retained (they carry no PII).
 */
export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin(req))) return errorJson('unauthorized', 401);
  let body;
  try {
    body = DeleteSchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }
  const db = getServiceClient();
  const id = body.session_id;

  // Log the deletion date in admin_notes before anonymizing.
  await db
    .from('mri_sessions')
    .update({ admin_notes: `Deleted ${new Date().toISOString()}` })
    .eq('id', id);

  // Remove derived + raw data.
  await db.from('source_materials').delete().eq('session_id', id);
  await db.from('extracted_profiles').delete().eq('session_id', id);
  await db.from('question_answers').delete().eq('session_id', id);
  await db.from('scores').delete().eq('session_id', id);
  await db.from('reports').delete().eq('session_id', id);
  await db.from('admin_summaries').delete().eq('session_id', id);

  // Anonymize the session row (kept for funnel integrity; PII nulled).
  await db
    .from('mri_sessions')
    .update({ email: null, name: null, deleted_at: new Date().toISOString(), status: 'abandoned' })
    .eq('id', id);

  return json({ ok: true });
}
