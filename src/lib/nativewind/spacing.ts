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

export const spacing = {
  screen: 'px-4',
  section: 'gap-6',
  card: 'p-4',
  compactCard: 'p-3',
  list: 'gap-3',
  stack: 'gap-4',
  row: 'gap-2',
  inline: 'gap-1',
  micro: 'gap-0.5',
} as const;
