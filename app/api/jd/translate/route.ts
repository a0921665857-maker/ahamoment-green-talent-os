import { NextRequest } from 'next/server';
import { z } from 'zod';
import { DAILY_JD_CAP, RATE_LIMIT, type Locale } from '@/lib/constants';
import { isLocale } from '@/content/locales';
import { JD_LIMITS, jdTranslatorCopy } from '@/content/jdTranslator';
import { checkRateLimit, isRouteDailyCapReached } from '@/lib/rateLimit';
import { clientIp, errorJson, json } from '@/lib/http';
import { callPrompt, PromptValidationError } from '@/lib/anthropic';
import { jdTranslatePrompt } from '@/lib/prompts/jdTranslate';

export const runtime = 'nodejs';
export const maxDuration = 120;

const BodySchema = z.object({
  locale: z.string().refine(isLocale),
  jd: z.string(),
});

/**
 * JD 翻譯器 — free tool. Analyse a pasted job description and return the read.
 *
 * PRIVACY (a promise made in the page copy): the JD is NEVER persisted. No DB
 * write, no event row, and it is never written to the logs on the error path
 * either. It lives in memory for the length of this request and then it is gone.
 * The only row this route writes is the rate-limit counter (a salted IP hash).
 */
export async function POST(req: NextRequest) {
  // Cost kill switch: a public LLM endpoint must have a site-wide daily cap in
  // addition to the per-IP limit (per-IP alone can be rotated around).
  if (await isRouteDailyCapReached('jd_translate', DAILY_JD_CAP)) {
    return errorJson('daily_cap', 429);
  }
  const ip = clientIp(req);
  const rl = await checkRateLimit(ip, 'jd_translate', RATE_LIMIT.submissionsPerHourPerIp);
  if (!rl.allowed) return errorJson('rate_limited', 429);

  let parsed: z.infer<typeof BodySchema>;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return errorJson('invalid_input', 400);
  }

  const locale = parsed.locale as Locale;
  const errors = jdTranslatorCopy[locale].errors;

  const jd = parsed.jd.trim();
  if (jd.length < JD_LIMITS.minChars) return errorJson('too_short', 400, errors.tooShort);
  if (jd.length > JD_LIMITS.maxChars) return errorJson('too_long', 400, errors.tooLong);

  let analysis;
  try {
    analysis = await callPrompt(jdTranslatePrompt, { locale, jd });
  } catch (e) {
    // Log the failure shape only — never the JD, and never the model's echo of it.
    console.error(
      '[jd] translate failed:',
      e instanceof PromptValidationError
        ? `validation: ${e.issues}`
        : e instanceof Error
          ? e.message
          : 'unknown error',
    );
    return errorJson('analysis_failed', 502, errors.generic);
  }

  // The model's own guard: the text pasted was not a job description.
  if (!analysis.is_jd) return errorJson('not_a_jd', 422, errors.notAJd);

  return json({ analysis });
}
