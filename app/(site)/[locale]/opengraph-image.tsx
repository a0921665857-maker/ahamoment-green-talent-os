import { ImageResponse } from 'next/og';

export const alt = 'AhaMoment — Green Career MRI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Branded share preview so links show a card (not a bare URL) on social. Latin only — no CJK font needed. */
export default function Image() {
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
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#1e4d3b' }}>
          AHAMOMENT · GREEN TALENT OS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 84, fontWeight: 600, color: '#1b231f', lineHeight: 1.05 }}>
            Green Career MRI
          </div>
          <div style={{ display: 'flex', marginTop: 26, fontSize: 36, color: '#4a554f', lineHeight: 1.3, maxWidth: 920 }}>
            See where you really stand — a 5-minute read on your green-career positioning.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
          <div style={{ display: 'flex', width: 88, height: 44, background: '#b9cdc0', borderRadius: 8 }} />
          <div style={{ display: 'flex', width: 88, height: 70, background: '#5d8a73', borderRadius: 8 }} />
          <div style={{ display: 'flex', width: 88, height: 100, background: '#1e4d3b', borderRadius: 8 }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
