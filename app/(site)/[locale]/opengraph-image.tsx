import { ImageResponse } from 'next/og';
import { isLocale } from '@/content/locales';
import { DEFAULT_LOCALE, type Locale } from '@/lib/constants';
import { loadNotoSansTC, OG_FONT_FAMILY, assertGlyphs } from '@/lib/ogFonts';

export const contentType = 'image/png';
const size = { width: 1200, height: 630 };

/**
 * Branded share preview so links show a card (not a bare URL) on social.
 *
 * This card used to be one hardcoded English render for both locales, so every
 * zh-TW URL — the majority of what actually gets shared — previewed in English.
 * It now renders per locale, in the page's own language.
 *
 * Copy constraint: `public/fonts/*.ttf` are **subsets** (238 codepoints, exactly
 * what the share cards said the day they were generated). The Chinese below is
 * written to stay inside that set; `assertGlyphs` warns in dev if it ever stops
 * being true. Reword freely, then check the dev console once.
 */
const COPY = {
  'zh-TW': {
    alt: 'AhaMoment 綠色職涯 MRI',
    eyebrow: 'AHAMOMENT · GREEN TALENT OS',
    title: '綠色職涯 MRI',
    // 你在市場上的定位 = "where you actually stand"; matches the EN line's promise.
    lede: '你在市場上的定位，5 分鐘看得懂。',
    ledeSize: 40,
  },
  en: {
    alt: 'AhaMoment — Green Career MRI',
    eyebrow: 'AHAMOMENT · GREEN TALENT OS',
    title: 'Green Career MRI',
    lede: 'See where you really stand — a 5-minute read on your green-career positioning.',
    ledeSize: 36,
  },
} as const;

/** Gives each locale its own image id, so og:image:alt can be in that language. */
export function generateImageMetadata({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  return [{ id: locale, alt: COPY[locale].alt, size, contentType }];
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const isZh = locale === 'zh-TW';
  const copy = COPY[locale];

  // Latin-only card needs no embedded font; next/og's built-in face covers it.
  const fonts = isZh ? await loadNotoSansTC() : undefined;
  if (fonts) assertGlyphs(`site card (${locale})`, `${copy.eyebrow}${copy.title}${copy.lede}`, fonts);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f6f6f1',
          padding: '76px',
          fontFamily: isZh ? OG_FONT_FAMILY : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#1e4d3b' }}>
          {copy.eyebrow}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 84,
              // The TC subset ships 400/700 only; 600 would be synthesised.
              fontWeight: isZh ? 700 : 600,
              color: '#1b231f',
              lineHeight: 1.05,
            }}
          >
            {copy.title}
          </div>
          <div
            style={{
              display: 'flex',
              marginTop: 26,
              fontSize: copy.ledeSize,
              color: '#4a554f',
              lineHeight: isZh ? 1.5 : 1.3,
              maxWidth: 920,
            }}
          >
            {copy.lede}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ display: 'flex', width: 88, height: 44, background: '#b9cdc0', borderRadius: 8 }} />
          <div style={{ display: 'flex', width: 88, height: 70, background: '#5d8a73', borderRadius: 8 }} />
          <div style={{ display: 'flex', width: 88, height: 100, background: '#1e4d3b', borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size, ...(fonts ? { fonts } : {}) },
  );
}
