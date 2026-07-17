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
  /** Result type label (e.g. 被低估的實力派) — turns the cold notification into
   * "he actually read my material" by naming what they were read as. */
  typeLabel?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const t = getContent(opts.locale).emails.d0;
  const name = opts.name?.trim();
  const isZh = opts.locale === 'zh-TW';
  const personalLine = opts.typeLabel
    ? isZh
      ? `你這次被讀成「${opts.typeLabel}」。報告裡我把為什麼、還有你現在最該補的那一塊，都寫清楚了。`
      : `The read on you came out as "${opts.typeLabel}". Inside I lay out why, and the one thing worth shoring up next.`
    : '';
  // Graceful no-name greeting per locale: en "Hi there," (not "Hi ,"); zh "你好，".
  const filled = name
    ? t.body.replaceAll('{{name}}', name)
    : isZh
      ? t.body.replace(/\{\{name\}\}\s*/g, '')
      : t.body.replaceAll('{{name}}', 'there');
  const body = filled
    .replaceAll('{{report_url}}', opts.reportUrl)
    .replaceAll('{{personal_line}}', personalLine)
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  try {
    // from has no real mailbox — route replies to the founder's inbox (the
    // template invites the reader to reply).
    await new Resend(apiKey).emails.send({
      from,
      to: opts.to,
      subject: t.subject,
      text: body,
      replyTo: process.env.FOUNDER_EMAIL || undefined,
    });
  } catch {
    /* email is best-effort — on-screen delivery already happened */
  }
}

/**
 * Save-for-later: emails the MRI link to someone who left before pasting material.
 * Best-effort and gated on RESEND_API_KEY / RESEND_FROM. No-op if unset.
 */
export async function sendSaveForLaterEmail(opts: {
  to: string;
  mriUrl: string;
  locale: Locale;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return;

  const isZh = opts.locale === 'zh-TW';
  const subject = isZh ? '你的綠領職涯 MRI 連結' : 'Your Green Career MRI link';
  const body = isZh
    ? [
        '嗨，',
        '',
        '這是你剛剛在通勤時點開的綠領職涯 MRI。等你有空、手邊有履歷或想法時，從這個連結接著做就好：',
        opts.mriUrl,
        '',
        '大概三分鐘，做完我親手幫你看你現在被市場讀成哪一種人。',
        '有問題直接回這封信，我本人回。',
        '',
        'Michael',
        'AhaMoment',
      ].join('\n')
    : [
        'Hi,',
        '',
        'Here is the Green Career MRI you opened earlier. Pick it up whenever you have your CV or thoughts to hand:',
        opts.mriUrl,
        '',
        'About three minutes. When it is done I read how the market currently reads you, personally.',
        'Reply to this email with any question — it reaches me.',
        '',
        'Michael',
        'AhaMoment',
      ].join('\n');

  try {
    await new Resend(apiKey).emails.send({
      from,
      to: opts.to,
      subject,
      text: body,
      replyTo: process.env.FOUNDER_EMAIL || undefined,
    });
  } catch {
    /* best-effort */
  }
}

/**
 * Notifies the founder of every new completed lead (email, name, category, grade,
 * a link to the report, and a positioning excerpt). Gated on RESEND_API_KEY +
 * FOUNDER_EMAIL. Because it sends to your OWN inbox, Resend's test sender works
 * with no domain verification — you only need a free API key. No-op if unset.
 */
export async function sendFounderNotification(opts: {
  leadEmail: string;
  leadName: string | null;
  locale: Locale;
  category: string;
  leadGrade: string | null;
  reportUrl: string;
  excerpt?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FOUNDER_EMAIL;
  if (!apiKey || !to) return;
  const from = process.env.RESEND_FROM || 'AhaMoment MRI <onboarding@resend.dev>';

  const body = [
    'New Green Career MRI lead 🌱',
    '',
    `Email:   ${opts.leadEmail}`,
    `Name:    ${opts.leadName ?? '(none)'}`,
    `Locale:  ${opts.locale}`,
    `Type:    ${opts.category}`,
    `Grade:   ${opts.leadGrade ?? '—'}`,
    `Report:  ${opts.reportUrl}`,
    opts.excerpt ? `\nPositioning excerpt:\n${opts.excerpt}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    await new Resend(apiKey).emails.send({
      from,
      to,
      subject: `New MRI lead: ${opts.leadName ?? opts.leadEmail} · ${opts.category}`,
      text: body,
    });
  } catch {
    /* notification is best-effort */
  }
}
