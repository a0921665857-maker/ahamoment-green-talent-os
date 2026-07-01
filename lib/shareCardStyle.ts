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

/** The band-scale signature colours (constant on every card — the brand "gradient"). */
export const BAND_COLORS = { emerging: '#b9cdc0', developing: '#5d8a73', strong: '#1e4d3b' };

/**
 * The shareLine is "…類型是「LABEL」——<quotable>"; the label is already the hero,
 * so cards/posts show only the quotable half after the em-dash.
 */
export function cardLineOf(shareLine: string): string {
  return (shareLine.split(/——|—/)[1] ?? shareLine).trim();
}
