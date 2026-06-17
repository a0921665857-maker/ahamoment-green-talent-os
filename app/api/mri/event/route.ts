import { NextRequest } from 'next/server';
import { z } from 'zod';
import { errorJson, json } from '@/lib/http';
import { isEventName, recordEvent } from '@/lib/events';

export const runtime = 'nodejs';

// Only structural props are accepted — never PII (enforced rule).
const BodySchema = z.object({
  name: z.string(),
  session_token: z.string().uuid().nullable().default(null),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }
  if (!isEventName(body.name)) return errorJson('generic', 400);

  let sessionId: string | null = null;
  if (body.session_token) {
    const { getServiceClient } = await import('@/lib/supabase');
    const { data } = await getServiceClient()
      .from('mri_sessions')
      .select('id')
      .eq('session_token', body.session_token)
      .single();
    sessionId = data?.id ?? null;
  }

  await recordEvent(body.name, sessionId, body.props);
  return json({ ok: true });
}
