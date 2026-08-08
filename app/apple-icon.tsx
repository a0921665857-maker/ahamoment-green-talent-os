import { ImageResponse } from 'next/og';
import { loadNotoSansTC, OG_FONT_FAMILY } from '@/lib/ogFonts';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * iOS home-screen icon. Same mark as app/icon.tsx, drawn for the size it gets:
 * full-bleed square (iOS applies its own squircle mask, so a border radius here
 * would show up as a double-rounded edge), and at 180px there is room for the
 * band-scale glyph under the letter — the same three-step mark as the OG cards,
 * rendered in paper tints because the band greens have no contrast on pine.
 *
 * Same 700-weight face as app/icon.tsx so the two marks are the same letter.
 */
export default async function AppleIcon() {
  const fonts = await loadNotoSansTC();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e4d3b',
          color: '#f6f6f1',
          fontFamily: OG_FONT_FAMILY,
        }}
      >
        <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, lineHeight: 1 }}>A</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, marginTop: 16 }}>
          <div style={{ display: 'flex', width: 14, height: 9, borderRadius: 3, background: 'rgba(246,246,241,0.45)' }} />
          <div style={{ display: 'flex', width: 14, height: 15, borderRadius: 3, background: 'rgba(246,246,241,0.7)' }} />
          <div style={{ display: 'flex', width: 14, height: 22, borderRadius: 3, background: '#f6f6f1' }} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
