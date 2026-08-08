import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Shared CJK font loading for every generated image (`app/og/**`,
 * `app/(site)/[locale]/opengraph-image.tsx`).
 *
 * satori — the renderer behind next/og — has no system-font fallback. Any glyph
 * outside the fonts handed to `ImageResponse` renders as tofu (□), silently, in
 * an image nobody looks at until it is already on someone's timeline. So every
 * image that prints Chinese must load these two files, and every Chinese string
 * that reaches one must be inside the subset (see `missingGlyphs` below).
 *
 * `public/fonts/*.ttf` is tool-owned and read-only (AGENTS.md); this module only
 * reads it.
 *
 * Load order is disk first, HTTP second:
 *  - Disk works during `next build` prerendering (opengraph-image is statically
 *    generated per locale) and in `next dev`, with no round-trip.
 *  - The HTTP fallback covers a runtime render on a host where `public/` is not
 *    on the lambda filesystem. `fetch(file://)` is deliberately not used —
 *    Turbopack does not implement it.
 */

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
}

const FONT_FAMILY = 'Noto Sans TC';
const FONT_FILES = { 400: 'NotoSansTC-400.ttf', 700: 'NotoSansTC-700.ttf' } as const;

/** Same env var and fallback as app/sitemap.ts, robots.ts and the site layout. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ahamoment-green-talent-os.vercel.app';

const cache = new Map<string, Promise<ArrayBuffer>>();

async function loadFontFile(file: string, origin?: string): Promise<ArrayBuffer> {
  const cached = cache.get(file);
  if (cached) return cached;

  const pending = (async () => {
    try {
      const buf = await readFile(path.join(process.cwd(), 'public', 'fonts', file));
      // Copy out of the Node Buffer's pooled backing store — the pool is shared,
      // so handing satori the raw .buffer can hand it neighbouring bytes too.
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    } catch {
      const res = await fetch(`${origin ?? SITE_URL}/fonts/${file}`);
      if (!res.ok) throw new Error(`og: cannot load /fonts/${file} (${res.status})`);
      return res.arrayBuffer();
    }
  })();

  cache.set(file, pending);
  pending.catch(() => cache.delete(file)); // never cache a failure
  return pending;
}

/**
 * The 400/700 pair, ready to spread into `ImageResponse`'s `fonts` option.
 * `origin` is only used by the HTTP fallback; pass it when a Request is at hand.
 */
export async function loadNotoSansTC(origin?: string): Promise<OgFont[]> {
  const [data400, data700] = await Promise.all([
    loadFontFile(FONT_FILES[400], origin),
    loadFontFile(FONT_FILES[700], origin),
  ]);
  return [
    { name: FONT_FAMILY, data: data400, weight: 400, style: 'normal' },
    { name: FONT_FAMILY, data: data700, weight: 700, style: 'normal' },
  ];
}

/** The CSS value to put on the root element of a Chinese image. */
export const OG_FONT_FAMILY = `"${FONT_FAMILY}"`;

/* -------------------------------------------------------------------------- */
/* Subset guard                                                               */
/* -------------------------------------------------------------------------- */

const coverageCache = new WeakMap<ArrayBuffer, Set<number>>();

/** Codepoints a TrueType file actually has a glyph for (cmap format 4 / 12). */
function coverageOf(buf: ArrayBuffer): Set<number> {
  const hit = coverageCache.get(buf);
  if (hit) return hit;

  const dv = new DataView(buf);
  const set = new Set<number>();

  const numTables = dv.getUint16(4);
  let cmap = -1;
  for (let i = 0; i < numTables; i++) {
    const rec = 12 + i * 16;
    const tag = String.fromCharCode(
      dv.getUint8(rec), dv.getUint8(rec + 1), dv.getUint8(rec + 2), dv.getUint8(rec + 3),
    );
    if (tag === 'cmap') { cmap = dv.getUint32(rec + 8); break; }
  }
  if (cmap < 0) return set;

  // Prefer a format 12 subtable (full Unicode); fall back to format 4 (BMP).
  let sub = -1;
  let format = -1;
  const subtables = dv.getUint16(cmap + 2);
  for (let i = 0; i < subtables; i++) {
    const off = cmap + dv.getUint32(cmap + 4 + i * 8 + 4);
    const fmt = dv.getUint16(off);
    if (fmt === 12) { sub = off; format = 12; break; }
    if (fmt === 4 && format !== 4) { sub = off; format = 4; }
  }
  if (sub < 0) return set;

  if (format === 12) {
    const groups = dv.getUint32(sub + 12);
    for (let i = 0; i < groups; i++) {
      const g = sub + 16 + i * 12;
      for (let c = dv.getUint32(g); c <= dv.getUint32(g + 4); c++) set.add(c);
    }
  } else {
    const segX2 = dv.getUint16(sub + 6);
    const ends = sub + 14;
    const starts = ends + segX2 + 2;
    const deltas = starts + segX2;
    const ranges = deltas + segX2;
    for (let i = 0; i < segX2 / 2; i++) {
      const end = dv.getUint16(ends + i * 2);
      const start = dv.getUint16(starts + i * 2);
      if (start === 0xffff) continue;
      const delta = dv.getInt16(deltas + i * 2);
      const rangeOffset = dv.getUint16(ranges + i * 2);
      for (let c = start; c <= end; c++) {
        let gid: number;
        if (rangeOffset === 0) {
          gid = (c + delta) & 0xffff;
        } else {
          const gi = ranges + i * 2 + rangeOffset + (c - start) * 2;
          if (gi + 2 > buf.byteLength) continue;
          gid = dv.getUint16(gi);
          if (gid) gid = (gid + delta) & 0xffff;
        }
        if (gid) set.add(c);
      }
    }
  }

  coverageCache.set(buf, set);
  return set;
}

/**
 * Codepoints that only the embedded TC font can draw.
 *
 * next/og carries its own Latin fallback face, so a character missing from our
 * subset but present there (curly quotes, en/em dashes, arrows) still renders —
 * verified: the EN share cards print `’` fine despite it being outside the
 * subset. That fallback has no CJK, so from U+2E80 (CJK radicals) upward a gap
 * in the subset really is a tofu box. Warning below that line is noise.
 */
const CJK_START = 0x2e80;

/** Characters of `text` the font has no glyph for — i.e. what will render as tofu. */
export function missingGlyphs(
  text: string,
  fonts: OgFont[],
  { cjkOnly = false } = {},
): string[] {
  const covered = fonts.map((f) => coverageOf(f.data));
  const missing = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x20) continue;
    if (cjkOnly && cp < CJK_START) continue;
    if (!covered.some((set) => set.has(cp))) missing.add(ch);
  }
  return [...missing];
}

/**
 * Dev-only tripwire. `public/fonts/*.ttf` are **subsets** (238 codepoints —
 * exactly the characters the cards said the day they were generated), so editing
 * a Chinese string in `content/` or in an image route can introduce a character
 * the font does not carry. That fails silently as tofu. This turns it into a
 * console warning the first time the image is requested.
 *
 * Never throws: a bad font parse must not take down image generation.
 */
export function assertGlyphs(label: string, text: string, fonts: OgFont[]): void {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const missing = missingGlyphs(text, fonts, { cjkOnly: true });
    if (missing.length) {
      console.warn(
        `[og] ${label}: ${missing.length} CJK character(s) missing from the Noto Sans TC subset ` +
          `and will render as tofu: ${missing.join(' ')}\n` +
          `     Re-subset public/fonts/*.ttf, or reword to stay inside the current subset.`,
      );
    }
  } catch {
    /* parsing is best-effort */
  }
}
