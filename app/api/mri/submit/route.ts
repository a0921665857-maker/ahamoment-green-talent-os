import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  INPUT_LIMITS,
  INPUT_TYPES,
  RATE_LIMIT,
  type InputType,
  type Locale,
} from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { getContent } from '@/content';
import { getServiceClient } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rateLimit';
import { isDailyCapReached } from '@/lib/killSwitch';
import { clientIp, errorJson, json } from '@/lib/http';
import { recordEvent } from '@/lib/events';
import { callPrompt, PromptValidationError } from '@/lib/anthropic';
import { profileExtractionPrompt } from '@/lib/prompts';
import { normalizeGreenEconomy } from '@/lib/taxonomy';

export const runtime = 'nodejs';
export const maxDuration = 120;

const BodySchema = z.object({
  locale: z.string().refine(isLocale),
  inputType: z.enum(INPUT_TYPES),
  rawText: z.string().optional(),
  consentProcessing: z.literal(true),
  consentAggregate: z.boolean().default(false),
});

function minChars(locale: Locale): number {
  return locale === 'zh-TW' ? INPUT_LIMITS.minCharsZh : INPUT_LIMITS.minCharsEn;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = await checkRateLimit(ip, 'mri_submit', RATE_LIMIT.submissionsPerHourPerIp);
  if (!rl.allowed) return errorJson('rate_limited', 429);

  const contentType = req.headers.get('content-type') ?? '';
  let locale: Locale;
  let inputType: InputType;
  let rawText: string | undefined;
  let consentAggregate = false;
  let pdfBase64: string | undefined;

  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const parsed = BodySchema.parse({
        locale: form.get('locale'),
        inputType: form.get('inputType'),
        rawText: (form.get('rawText') as string | null) ?? undefined,
        consentProcessing: form.get('consentProcessing') === 'true',
        consentAggregate: form.get('consentAggregate') === 'true',
      });
      locale = parsed.locale as Locale;
      inputType = parsed.inputType;
      rawText = parsed.rawText;
      consentAggregate = parsed.consentAggregate;

      const file = form.get('file');
      if (inputType === 'cv_pdf') {
        if (!(file instanceof File)) return errorJson('file_type', 400);
        if (file.type !== 'application/pdf') return errorJson('file_type', 400);
        if (file.size > INPUT_LIMITS.maxPdfBytes) return errorJson('file_too_large', 400);
        const buf = Buffer.from(await file.arrayBuffer());
        pdfBase64 = buf.toString('base64');
      }
    } else {
      const parsed = BodySchema.parse(await req.json());
      locale = parsed.locale as Locale;
      inputType = parsed.inputType;
      rawText = parsed.rawText;
      consentAggregate = parsed.consentAggregate;
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      const consentMissing = e.issues.some((i) => i.path.includes('consentProcessing'));
      return errorJson(consentMissing ? 'consent_required' : 'generic', 400);
    }
    return errorJson('generic', 400);
  }

  const errors = getContent(locale).errors;

  // Site-wide daily kill switch (cost/abuse guard) — friendly, honest message.
  if (await isDailyCapReached()) return errorJson('daily_cap', 429, errors.dailyCapReached);

  // Validate text inputs
  if (inputType !== 'cv_pdf') {
    const text = (rawText ?? '').trim();
    if (text.length < minChars(locale)) return errorJson('too_short', 400, errors.tooShort);
    if (text.length > INPUT_LIMITS.maxChars) return errorJson('too_long', 400, errors.tooLong);
    rawText = text;
  }

  const db = getServiceClient();

  // Create session
  const { data: session, error: sErr } = await db
    .from('mri_sessions')
    .insert({
      locale,
      status: 'input_received',
      input_type: inputType,
      consent_processing_at: new Date().toISOString(),
      consent_aggregate: consentAggregate,
    })
    .select('id, session_token')
    .single();
  if (sErr || !session) return errorJson('generic', 500);

  await recordEvent('consent_given', session.id, { input_type: inputType });
  await recordEvent('material_submitted', session.id, { input_type: inputType });

  // Store source material (raw text is purged at 90 days; PDF stored separately by a later job)
  await db.from('source_materials').insert({
    session_id: session.id,
    type: inputType,
    raw_text: rawText ?? null,
    char_count: rawText?.length ?? 0,
  });

  // Extraction
  let profile;
  try {
    profile = await callPrompt(
      profileExtractionPrompt,
      { inputType, rawText, locale },
      { pdfBase64 },
    );
  } catch (e) {
    console.error('[submit] extraction error:', e instanceof PromptValidationError ? `PromptValidationError issues=${e.issues}` : e);
    await db.from('mri_sessions').update({ status: 'failed' }).eq('id', session.id);
    await recordEvent('extraction_failed', session.id, { input_type: inputType });
    if (e instanceof PromptValidationError) return errorJson('extraction_failed', 502, errors.extractionFailed);
    return errorJson('extraction_failed', 502, errors.extractionFailed);
  }

  // Re-home mis-grouped taxonomy slugs and shunt unknowns to free_text before
  // anything downstream (confirm chips, scoring, admin) reads the payload.
  profile = { ...profile, green_economy: normalizeGreenEconomy(profile.green_economy) };

  await db.from('extracted_profiles').insert({
    session_id: session.id,
    payload: profile,
    overall_confidence: profile.confidence.overall,
    missing_fields: profile.missing_fields,
    model: profileExtractionPrompt.model,
    prompt_version: profileExtractionPrompt.version,
  });
  await db.from('mri_sessions').update({ status: 'extracted' }).eq('id', session.id);
  await recordEvent('extraction_succeeded', session.id, { input_type: inputType });

  return json({ session_token: session.session_token, profile });
}
