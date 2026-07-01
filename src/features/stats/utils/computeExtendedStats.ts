type PredictionRow = {
  points: number | null;
  is_finished: boolean;
  matches: { fixture: number | null; kick_off: string } | null;
};

export type RoundPerformance = {
  round: number;
  points: number;
};

export type BestCategory = {
  name: string;
  value: number;
  topPercent: number | null;
};

export function computeStreaks(predictions: PredictionRow[]) {
  const sorted = predictions
    .filter((p) => p.is_finished)
    .sort(
      (a, b) =>
        new Date(a.matches?.kick_off ?? 0).getTime() - new Date(b.matches?.kick_off ?? 0).getTime(),
    );

  let longestStreak = 0;
  let streak = 0;

  for (const prediction of sorted) {
    if ((prediction.points ?? 0) > 0) {
      streak += 1;
      longestStreak = Math.max(longestStreak, streak);
    } else {
      streak = 0;
    }
  }

  let currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    if ((sorted[i].points ?? 0) > 0) {
      currentStreak += 1;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

export function computeRoundPerformance(predictions: PredictionRow[]): RoundPerformance[] {
  const roundMap = new Map<number, number>();

  for (const prediction of predictions) {
    if (!prediction.is_finished) continue;
    const fixture = prediction.matches?.fixture;
    if (fixture == null) continue;
    roundMap.set(fixture, (roundMap.get(fixture) ?? 0) + (prediction.points ?? 0));
  }

  return Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([round, points]) => ({ round, points }));
}

export function computeBestCategory({
  bingoHits,
  regularHits,
  position,
  totalMembers,
}: {
  bingoHits: number;
  regularHits: number;
  position: number | null;
  totalMembers: number;
}): BestCategory {
  const categories = [
    { name: 'Correct scores', value: bingoHits },
    { name: 'Correct results', value: regularHits },
  ];

  const best = categories.sort((a, b) => b.value - a.value)[0];
  const topPercent =
    position != null && totalMembers > 0 ? Math.max(1, Math.round((position / totalMembers) * 100)) : null;

  return {
    name: best.name,
    value: best.value,
    topPercent,
  };
}

export function getAccuracyMessage(accuracy: number): 'great' | 'good' | 'improve' {
  if (accuracy >= 70) return 'great';
  if (accuracy >= 50) return 'good';
  return 'improve';
}
