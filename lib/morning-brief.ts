import { Resend } from 'resend';

/**
 * MRI 晨報 — pulls yesterday + 7-day funnel numbers from PostHog (HogQL) and
 * composes a plain-text zh-TW brief for the founder's inbox. Day-level numbers
 * are reported without attribution claims (samples are small); the action line
 * only ever reasons from 7-day aggregates.
 */

export interface DayRow {
  day: string; // YYYY-MM-DD in Asia/Singapore
  pageviews: number;
  started: number;
  reports: number;
  cta: number;
}

export interface SourceRow {
  source: string;
  pageviews: number;
  started: number;
}

export interface FunnelTotals {
  started: number;
  material: number;
  questions: number;
  reports: number;
  cta: number;
}

export interface BriefData {
  days: DayRow[];
  sources: SourceRow[];
  funnel: FunnelTotals;
}

const SGT = 'Asia/Singapore';

/**
 * PostHog mixes utm_source values and referring domains in the same column, so
 * the same channel arrives under several names (threads / l.threads.com / …).
 * Collapse them before ranking, or the top channel gets undercounted.
 */
export function normalizeSource(raw: string): string {
  const s = raw.toLowerCase().replace(/^(www|l|lm)\./, '');
  if (s === '$direct') return 'direct';
  if (s === 'threads.com' || s === 'threads.net' || s === 'threads') return 'threads';
  if (s.endsWith('.vercel.app')) return 'internal';
  return s;
}

export function mergeSources(rows: SourceRow[]): SourceRow[] {
  const merged = new Map<string, SourceRow>();
  for (const r of rows) {
    const source = normalizeSource(r.source);
    const prev = merged.get(source);
    if (prev) {
      prev.pageviews += r.pageviews;
      prev.started += r.started;
    } else {
      merged.set(source, { source, pageviews: r.pageviews, started: r.started });
    }
  }
  return [...merged.values()].sort((a, b) => b.pageviews - a.pageviews);
}

function posthogApiHost(): string {
  // Ingestion host (eu.i.posthog.com) and private API host (eu.posthog.com) differ.
  const ingest = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';
  return ingest.replace('.i.posthog.com', '.posthog.com');
}

async function hogql(query: string): Promise<unknown[][]> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY;
  const project = process.env.POSTHOG_PROJECT_ID;
  if (!key || !project) throw new Error('POSTHOG_PERSONAL_API_KEY / POSTHOG_PROJECT_ID unset');

  const res = await fetch(`${posthogApiHost()}/api/projects/${project}/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query } }),
  });
  if (!res.ok) throw new Error(`PostHog query failed: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { results: unknown[][] };
  return data.results;
}

export async function fetchBriefData(): Promise<BriefData> {
  const [dayRows, sourceRows, funnelRows] = await Promise.all([
    hogql(
      `select toDate(toTimeZone(timestamp, '${SGT}')) as day,
        countIf(event = '$pageview') as pv,
        countIf(event = 'mri_started') as started,
        countIf(event = 'report_viewed') as reports,
        countIf(event = 'cta_clicked') as cta
      from events where timestamp > now() - interval 9 day
      group by day order by day`,
    ),
    hogql(
      `select coalesce(nullif(properties.utm_source, ''), nullif(properties.$referring_domain, ''), 'direct') as source,
        countIf(event = '$pageview') as pv,
        countIf(event = 'mri_started') as started
      from events
      where timestamp > now() - interval 7 day and event in ('$pageview', 'mri_started')
      group by source order by pv desc limit 8`,
    ),
    hogql(
      `select countIf(event = 'mri_started'), countIf(event = 'material_submitted'),
        countIf(event = 'questions_submitted'), countIf(event = 'report_viewed'),
        countIf(event = 'cta_clicked')
      from events where timestamp > now() - interval 7 day`,
    ),
  ]);

  const days: DayRow[] = dayRows.map((r) => ({
    day: String(r[0]),
    pageviews: Number(r[1]),
    started: Number(r[2]),
    reports: Number(r[3]),
    cta: Number(r[4]),
  }));
  const sources: SourceRow[] = mergeSources(
    sourceRows.map((r) => ({
      source: String(r[0]),
      pageviews: Number(r[1]),
      started: Number(r[2]),
    })),
  );
  const f = funnelRows[0] ?? [0, 0, 0, 0, 0];
  const funnel: FunnelTotals = {
    started: Number(f[0]),
    material: Number(f[1]),
    questions: Number(f[2]),
    reports: Number(f[3]),
    cta: Number(f[4]),
  };
  return { days, sources, funnel };
}

export function sgtDateString(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SGT,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

function pct(part: number, whole: number): string {
  if (whole === 0) return '—';
  return `${Math.round((part / whole) * 100)}%`;
}

/** Pure composition — everything data-dependent lives here so it's testable. */
export function composeBrief(data: BriefData, now: Date): string {
  const todayStr = sgtDateString(now);
  const yesterdayStr = sgtDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
  const weekday = new Intl.DateTimeFormat('zh-TW', { timeZone: SGT, weekday: 'short' }).format(now);

  const zero: DayRow = { day: yesterdayStr, pageviews: 0, started: 0, reports: 0, cta: 0 };
  const y = data.days.find((d) => d.day === yesterdayStr) ?? zero;
  // 7-day average excludes yesterday and today (partial day) so the comparison is honest.
  const prior = data.days.filter((d) => d.day < yesterdayStr);
  const avg = (pick: (d: DayRow) => number) =>
    prior.length === 0 ? 0 : Math.round((prior.reduce((s, d) => s + pick(d), 0) / prior.length) * 10) / 10;

  const f = data.funnel;
  const bestSource = [...data.sources].sort((a, b) => b.started - a.started || b.pageviews - a.pageviews)[0];

  const lines: string[] = [
    `綠領 MRI 晨報 · ${todayStr}(${weekday})`,
    '',
    `昨天:瀏覽 ${y.pageviews} · 開始 MRI ${y.started} · 看報告 ${y.reports} · 點 CTA ${y.cta}`,
    `前 ${prior.length} 天日均:瀏覽 ${avg((d) => d.pageviews)} · 開始 ${avg((d) => d.started)}`,
    '',
    `7 天漏斗:開始 ${f.started} → 交素材 ${f.material}(${pct(f.material, f.started)})→ 答完題 ${f.questions}(${pct(f.questions, f.material)})→ 看報告 ${f.reports} → 點 CTA ${f.cta}`,
    `流量來源(7 天):${data.sources.map((s) => `${s.source} ${s.pageviews}`).join(' · ') || '無數據'}`,
    '',
  ];

  if (bestSource && bestSource.started > 0) {
    lines.push(
      `今天的一發:過去 7 天「${bestSource.source}」帶來最多開始 MRI(${bestSource.started} 人)。今晚用 /thread 沿這個渠道再打一發;若昨天有發文,先 /thread log 回填成效。`,
    );
  } else {
    lines.push('今天的一發:過去 7 天沒有任何來源帶進 MRI 開始。今晚別優化細節,直接發一則導流貼文(/thread),明天看這裡有沒有變化。');
  }

  return lines.join('\n');
}

/** Gated on RESEND_API_KEY + FOUNDER_EMAIL, same policy as lib/email.ts. */
export async function sendBriefEmail(brief: string, subjectDate: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.FOUNDER_EMAIL;
  if (!apiKey || !to) return false;
  const from = process.env.RESEND_FROM || 'AhaMoment MRI <onboarding@resend.dev>';
  await new Resend(apiKey).emails.send({
    from,
    to,
    subject: `綠領 MRI 晨報 · ${subjectDate}`,
    text: brief,
  });
  return true;
}
