import { NextRequest } from 'next/server';
import { z } from 'zod';
import { UserEditsSchema } from '@/lib/types';
import { getServiceClient } from '@/lib/supabase';
import { errorJson, json } from '@/lib/http';
import { recordEvent } from '@/lib/events';
import { applyUserEdits } from '@/lib/pipeline';
import { selectQuestions } from '@/lib/extraction/missingInfoDetector';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';

export const runtime = 'nodejs';

const BodySchema = z.object({
  session_token: z.string().uuid(),
  edits: UserEditsSchema.nullable().default(null),
});

export async function POST(req: NextRequest) {
  let body;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return errorJson('generic', 400);
  }

  const db = getServiceClient();
  const { data: session } = await db
    .from('mri_sessions')
    .select('id, locale, status')
    .eq('session_token', body.session_token)
    .is('deleted_at', null)
    .single();
  if (!session) return errorJson('not_found', 404);

  const { data: profileRow } = await db
    .from('extracted_profiles')
    .select('id, payload')
    .eq('session_id', session.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (!profileRow) return errorJson('generic', 409);

  // Persist edits and patch the working profile
  await db.from('extracted_profiles').update({ user_edits: body.edits }).eq('id', profileRow.id);
  const working = applyUserEdits(profileRow.payload, body.edits);

  const questionIds = selectQuestions(working);
  await db.from('mri_sessions').update({ status: 'confirmed' }).eq('id', session.id);
  await recordEvent('profile_confirmed', session.id, { questions: questionIds.length });

  // Return localized question definitions in selection order
  const bank = getContent(session.locale as Locale).questions.questions;
  const questions = questionIds.map((id) => ({ id, ...bank[id] }));
  return json({ questions });
}
