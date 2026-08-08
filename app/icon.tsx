import { ImageResponse } from 'next/og';
import { loadNotoSansTC, OG_FONT_FAMILY } from '@/lib/ogFonts';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Browser-tab / bookmark icon. The site shipped only a favicon.ico, so anywhere
 * that prefers a PNG `rel="icon"` (Chrome tab strip on hi-dpi, Android, most
 * feed readers) fell back to a blurry upscale or nothing.
 *
 * Deliberately a letter mark, not the three-bar band glyph: at 32px the bars
 * collapse into an unreadable smudge, while a single paper-on-pine "A" stays
 * legible and matches the header lockup. Colours are the brand constants —
 * pine #1e4d3b, paper #f6f6f1, byte-identical to app/globals.css.
 *
 * Uses the repo's Noto Sans TC 700 face (its subset carries Latin) — next/og's
 * built-in fallback ships one weight, and a regular-weight "A" goes spindly and
 * half-disappears once a browser scales 32px down into a tab strip.
 */
export default async function Icon() {
  const fonts = await loadNotoSansTC();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e4d3b',
          // ~22% radius: reads as a rounded square at 32px without the corners
          // disappearing the way a full squircle would.
          borderRadius: 7,
          color: '#f6f6f1',
          fontFamily: OG_FONT_FAMILY,
          fontSize: 22,
          fontWeight: 700,
          // Optical centring — the cap-height glyph sits low in its line box.
          lineHeight: 1,
          paddingBottom: 1,
        }}
      >
        A
      </div>
    ),
    { ...size, fonts },
  );
}
