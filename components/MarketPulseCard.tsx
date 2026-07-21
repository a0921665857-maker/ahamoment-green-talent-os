import type { Locale } from '@/lib/constants';
import { marketPulse, isMarketPulseFresh } from '@/content/marketPulse';

// 報告頁與範例頁共用的市場脈搏卡。資料全部來自 content/marketPulse.ts
// (人工策展、週日更新);過期(>21 天未更新)整卡不渲染,寧可消失不可過期。
export function MarketPulseCard({ locale, utmContent }: { locale: Locale; utmContent: string }) {
  if (!isMarketPulseFresh(marketPulse.updatedAt)) return null;
  const t = locale === 'zh-TW' ? marketPulse.zh : marketPulse.en;
  const jobsHref = `/${locale}/jobs?utm_source=mri_report&utm_medium=market_pulse&utm_content=${utmContent}`;

  return (
    <aside className="mt-10 rounded-xl border border-line bg-mist/30 px-5 py-5">
      <p className="text-xs font-semibold uppercase tracking-eyebrow text-pine">{t.eyebrow}</p>
      <p className="mt-2 text-sm text-ink-soft">{t.intro}</p>
      <ul className="mt-3 space-y-2.5">
        {marketPulse.items.map((item) => (
          <li key={item.url} className="text-[15px] leading-relaxed">
            <span className="tabular-nums text-xs text-ink-soft">{item.posted.slice(5)}</span>{' '}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-pine underline-offset-2 hover:underline"
            >
              {locale === 'zh-TW' ? item.roleZh : item.roleEn}
            </a>{' '}
            <span className="text-sm text-ink-soft">
              {item.org}・<span className="font-semibold tabular-nums">{item.salary}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm">{t.reading}</p>
      <p className="mt-2 text-xs text-ink-soft">
        {t.sourceNote}
        {locale === 'zh-TW'
          ? `更新於 ${marketPulse.updatedAt},每週日更新。`
          : ` Updated ${marketPulse.updatedAt}; refreshed every Sunday.`}
      </p>
      <p className="mt-2 text-sm">
        <a href={jobsHref} className="font-medium text-pine underline-offset-2 hover:underline">
          {t.jobsCta}
        </a>
      </p>
    </aside>
  );
}
