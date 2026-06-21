import { Resend } from 'resend';
import { getContent } from '@/content';
import type { Locale } from '@/lib/constants';

/**
 * Sends the day-0 "your report is ready" email (content emails.d0 per locale).
 * Best-effort and gated on env: if RESEND_API_KEY / RESEND_FROM are unset, this
 * is a no-op (the report is always delivered on-screen regardless).
 */
export async function sendReportEmail(opts: {
  to: string;
  name: string | null;
  reportUrl: string;
  locale: Locale;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const t = getContent(opts.locale).emails.d0;
  const name = opts.name?.trim();
  // Graceful no-name greeting per locale: en "Hi there," (not "Hi ,"); zh "你好，".
  const filled = name
    ? t.body.replaceAll('{{name}}', name)
    : opts.locale === 'zh-TW'
      ? t.body.replace(/\{\{name\}\}\s*/g, '')
      : t.body.replaceAll('{{name}}', 'there');
  const body = filled
    .replaceAll('{{report_url}}', opts.reportUrl)
    .replaceAll('{{personal_line}}', '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  try {
    await new Resend(apiKey).emails.send({ from, to: opts.to, subject: t.subject, text: body });
  } catch {
    /* email is best-effort — on-screen delivery already happened */
  }
}
