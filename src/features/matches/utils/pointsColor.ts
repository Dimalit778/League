export const POINTS_COLOR = {
  hit: '#10B981',
  miss: '#EF4444',
  bingo: '#FCD34D',
} as const;

export type PointsColorKey = keyof typeof POINTS_COLOR;

export const getPointsColorKey = (points: number | null | undefined): PointsColorKey => {
  if (points === 5) return 'hit';
  if (points === 3) return 'bingo';
  if (points === 0) return 'miss';
  return 'miss';
};
