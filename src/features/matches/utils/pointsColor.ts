export const POINTS_COLOR = {
  Bingo: '#FCD34D',
  Hit: '#10B981',
  Miss: '#EF4444',
} as const;

export type PointsColorKey = keyof typeof POINTS_COLOR;

export const getPointsColorKey = (points: number | null | undefined): PointsColorKey => {
  if (points === 5) return 'Bingo';
  if (points === 3) return 'Hit';
  if (points === 0) return 'Miss';
  return 'Miss';
};

export function getPredictionResultLabel(
  points: number | null | undefined,
  isPredictionFinished: boolean,
  isFinished: boolean
): { title: string; color: string } | null {
  if (!isFinished || !isPredictionFinished) {
    return null;
  }

  const key = getPointsColorKey(points);

  // Friendly titles for points keys
  const titles: Record<PointsColorKey, string> = {
    Bingo: 'Bingo',
    Hit: 'Hit',
    Miss: 'Miss',
  };

  return {
    title: titles[key],
    color: POINTS_COLOR[key],
  };
}
