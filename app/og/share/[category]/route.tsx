import { ImageResponse } from 'next/og';
import { getContent } from '@/content';
import { isLocale } from '@/content/locales';
import { RESULT_CATEGORIES, type Locale, type ResultCategory } from '@/lib/constants';
import { TYPE_STYLE, BAND_COLORS, cardLineOf } from '@/lib/shareCardStyle';

/**
 * Generated shareable result card (1080×1080 PNG) — the "MBTI card" people post.
 * /og/share/<category>?locale=zh-TW  → returns a per-type image.
 * Renders Chinese via an embedded subset Noto Sans TC (satori has no system-font
 * fallback → tofu without this) and emoji via next/og's emoji provider.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;
  if (!RESULT_CATEGORIES.includes(category as ResultCategory)) {
    return new Response('Unknown type', { status: 404 });
  }
  const cat = category as ResultCategory;

  const localeParam = new URL(req.url).searchParams.get('locale');
  const locale: Locale = isLocale(localeParam ?? '') ? (localeParam as Locale) : 'zh-TW';
  const isZh = locale === 'zh-TW';

  const c = getContent(locale);
  const type = c.share.types[cat];
  const style = TYPE_STYLE[cat];
  const cardLine = cardLineOf(type.shareLine);

  const eyebrow = isZh ? 'GREEN CAREER MRI · 綠領職涯定位' : 'GREEN CAREER MRI';
  const bandLabels = isZh ? '潛力 · 成形 · 到位' : 'Emerging · Developing · Strong';
  const hook = isZh ? '你是哪一型？來測 →' : 'Which type are you? →';

  // Fonts are served from /public over HTTP (same origin) — works in Turbopack dev
  // and on Vercel, unlike fetch(file://) which Turbopack doesn't implement.
  const origin = new URL(req.url).origin;
  const [f400, f700] = await Promise.all([
    fetch(`${origin}/fonts/NotoSansTC-400.ttf`).then((r) => r.arrayBuffer()),
    fetch(`${origin}/fonts/NotoSansTC-700.ttf`).then((r) => r.arrayBuffer()),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#f6f6f1',
          fontFamily: '"Noto Sans TC"',
        }}
      >
        {/* accent edge — thumbnail-recognisable signature */}
        <div style={{ display: 'flex', height: 16, width: '100%', background: style.accent }} />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '0 96px',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', fontSize: 27, letterSpacing: 4, color: '#1e4d3b' }}>
            {eyebrow}
          </div>

          {/* motif tile */}
          <div
            style={{
              display: 'flex',
              marginTop: 52,
              width: 150,
              height: 150,
              borderRadius: 40,
              background: style.tint,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ display: 'flex', fontSize: 84 }}>{style.emoji}</div>
          </div>

          {/* type name — the hero */}
          <div
            style={{
              display: 'flex',
              marginTop: 44,
              fontSize: 88,
              fontWeight: 700,
              color: style.accent,
              lineHeight: 1.15,
              maxWidth: 888,
            }}
          >
            {type.label}
          </div>

          {/* the quotable one-liner */}
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 40,
              color: '#4a554f',
              lineHeight: 1.6,
              maxWidth: 860,
            }}
          >
            {cardLine}
          </div>

          {/* band-scale glyph — brand constant, identical on every card */}
          <div style={{ display: 'flex', marginTop: 60, alignItems: 'flex-end', gap: 14 }}>
            <div style={{ display: 'flex', width: 44, height: 40, borderRadius: 10, background: BAND_COLORS.emerging }} />
            <div style={{ display: 'flex', width: 44, height: 66, borderRadius: 10, background: BAND_COLORS.developing }} />
            <div style={{ display: 'flex', width: 44, height: 96, borderRadius: 10, background: BAND_COLORS.strong }} />
          </div>
          <div style={{ display: 'flex', marginTop: 16, fontSize: 24, letterSpacing: 2, color: '#4a554f' }}>
            {bandLabels}
          </div>
        </div>

        {/* footer: viewer-curiosity hook + brand lockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 96px 76px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#1e4d3b' }}>{hook}</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', fontSize: 30, fontWeight: 700, color: '#1b231f' }}>AhaMoment</div>
            <div style={{ display: 'flex', fontSize: 20, letterSpacing: 2, color: '#5a7d6b' }}>GREEN CAREER MRI</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: 'Noto Sans TC', data: f400, weight: 400, style: 'normal' },
        { name: 'Noto Sans TC', data: f700, weight: 700, style: 'normal' },
      ],
      emoji: 'noto',
    },
  );
}
