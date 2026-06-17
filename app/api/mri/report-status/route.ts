import { NextRequest } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { errorJson, json } from '@/lib/http';

export const runtime = 'nodejs';

/** Lightweight poll target for the result page while the report generates. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return errorJson('generic', 400);

  const db = getServiceClient();
  const { data: session } = await db
    .from('mri_sessions')
    .select('id, status')
    .eq('session_token', token)
    .is('deleted_at', null)
    .single();
  if (!session) return errorJson('not_found', 404);

  const { count } = await db
    .from('reports')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id);

  const ready = (count ?? 0) > 0;
  return json({ ready, failed: session.status === 'failed' && !ready });
}
