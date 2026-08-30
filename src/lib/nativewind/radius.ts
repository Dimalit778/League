/**
 * BORDER RADIUS — one named scale, elements get a radius that matches their size.
 * Rule of thumb: bigger element → bigger radius (roughly 5–10% of its shortest side);
 * never reach for off-scale values like 7 or 13. Keep buttons, inputs, cards and
 * sheets on these steps so corners stay consistent across the app.
 *
 * WHERE TO USE
 *   sm    ·  8 — chips, badges, small tags
 *   md    · 12 — buttons, inputs, small controls
 *   lg    · 16 — cards, tiles
 *   xl    · 24 — large cards, modals, bottom sheets
 *   full  · —  — pills, avatars, anything circular
 */
export const radiusValues = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export type RadiusToken = keyof typeof radiusValues;

/** Tailwind classes for each step (values match `radiusValues`). */
export const radius = {
  sm: 'rounded-lg', // 8
  md: 'rounded-xl', // 12
  lg: 'rounded-2xl', // 16
  xl: 'rounded-3xl', // 24
  full: 'rounded-full',
} as const;
