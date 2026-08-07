import type { ResultCategory } from '@/lib/constants';

/**
 * Shared "cast" styling for the shareable result card — used by both the on-screen
 * card (components/ShareableTypeCard.tsx) and the generated OG image
 * (app/og/share/[category]/route.tsx) so the two always match.
 *
 * Each archetype gets a deep accent (hero text + top edge), a soft tile tint
 * (behind the motif), and one emoji motif. Palette is earthy/green-anchored on
 * purpose: types 1–4 sit in the green/teal "in the track" cluster; 5–8 drift to
 * warm bronze/clay/amber/slate ("potential not yet realised"), so colour
 * temperature quietly mirrors the story arc.
 */
export const TYPE_STYLE: Record<ResultCategory, { accent: string; tint: string; emoji: string }> = {
  ready_for_mba_story_sprint: { accent: '#1e4d3b', tint: '#dde8e0', emoji: '🚀' },
  strong_profile_weak_story: { accent: '#2b5f6b', tint: '#d9e6e8', emoji: '💎' },
  climate_career_builder: { accent: '#3d6b3f', tint: '#dde7da', emoji: '🌳' },
  career_positioning_before_mba: { accent: '#5a6b3a', tint: '#e4e8d6', emoji: '🧭' },
  profile_building_needed: { accent: '#7a6a3f', tint: '#ece5d3', emoji: '⛏️' },
  high_potential_low_commercial_clarity: { accent: '#8a5a3c', tint: '#efe2d6', emoji: '🏷️' },
  interview_ready_positioning_weak: { accent: '#8a6d28', tint: '#f0e8cf', emoji: '⚡' },
  cv_strong_narrative_weak: { accent: '#46566b', tint: '#dfe3ea', emoji: '📄' },
};

/** The band-scale signature colours (constant on every card — the brand "gradient").
 *  Kept byte-identical to --color-band-* in app/globals.css: the on-screen glyph and
 *  the generated OG image are the same mark and must not drift. */
export const BAND_COLORS = { emerging: '#b9cdc0', developing: '#527965', strong: '#1e4d3b' };

/**
 * The shareLine names the type and then says one quotable thing about it. The
 * label is already the hero of every card, so we show only the quotable half.
 *
 * Two separators, because the two locales punctuate differently: English uses an
 * em dash, and zh-TW closes the quoted label with 」， (voice-canon bans the em
 * dash in Chinese prose). Matching only the dash silently fell through to the
 * `?? shareLine` fallback on every zh card, printing the type name twice.
 */
export function cardLineOf(shareLine: string): string {
  const line = (shareLine.split(/——|—|」，/)[1] ?? shareLine).trim();
  // Capitalise the first letter — a no-op for CJK, fixes the lowercase EN half.
  return line.charAt(0).toUpperCase() + line.slice(1);
}
