/**
 * SPACING — 8pt grid (with 4pt for fine steps).
 * Every value is a multiple of 4; the rhythm you reach for daily is multiples of 8.
 * This mirrors Material Design + Apple HIG, the convention React Native standardises on.
 *
 * Raw scale (px) — maps 1:1 to Tailwind's `p-*`, `gap-*`, `m-*`:
 *   1→4   2→8   3→12   4→16   5→20   6→24   8→32   10→40   12→48
 */
export const spacingValues = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

export type SpacingToken = keyof typeof spacingValues;

/**
 * Semantic spacing — the named steps to use in screens, so rhythm stays consistent.
 *
 * PADDING (inside a container)
 *   screen       px-4  · 16 — a screen's horizontal gutter
 *   card         p-4   · 16 — standard card padding
 *   cardCompact  p-3   · 12 — dense cards / list rows
 *
 * GAP (between siblings) — a descending rhythm, pick by how related the items are:
 *   section      gap-6 · 24 — between major sections of a screen
 *   stack        gap-4 · 16 — between grouped blocks
 *   list         gap-3 · 12 — between list items / cards
 *   row          gap-2 ·  8 — inline items in a row
 *   inline       gap-1 ·  4 — tight pairs (icon + label)
 */
export const spacing = {
  // padding
  screen: 'px-4',
  card: 'p-4',
  cardCompact: 'p-3',
  // gap
  section: 'gap-6',
  stack: 'gap-4',
  list: 'gap-3',
  row: 'gap-2',
  inline: 'gap-1',
} as const;
