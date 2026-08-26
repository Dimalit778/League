import type { BestCategory, PredictionRow, RoundPerformance } from '../types/stats.type';

const byKickOffAscending = (a: PredictionRow, b: PredictionRow) =>
  new Date(a.matches?.kick_off ?? 0).getTime() - new Date(b.matches?.kick_off ?? 0).getTime();

export function computeStreaks(predictions: PredictionRow[]) {
  const sorted = predictions.filter((p) => p.is_finished).sort(byKickOffAscending);

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

export function computeRecentForm(predictions: PredictionRow[]) {
  return predictions
    .filter((prediction) => prediction.is_finished)
    .sort(byKickOffAscending)
    .slice(-5)
    .map((prediction) => {
      const points = prediction.points ?? 0;
      return {
        points,
        result: points === 5 ? ('B' as const) : points === 3 ? ('H' as const) : ('L' as const),
      };
    });
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
  rank,
  totalMembers,
}: {
  bingoHits: number;
  regularHits: number;
  rank: number;
  totalMembers: number;
}): BestCategory {
  const categories = [
    { name: 'Correct scores', value: bingoHits },
    { name: 'Correct results', value: regularHits },
  ];

  const best = categories.sort((a, b) => b.value - a.value)[0];
  // rank is 0 when the member isn't on the leaderboard yet — that's "unranked",
  // not top 1%, so only compute a percentile for a real (positive) rank.
  const topPercent =
    rank > 0 && totalMembers > 0 ? Math.max(1, Math.round((rank / totalMembers) * 100)) : null;

  return {
    name: best.name,
    value: best.value,
    topPercent,
  };
}
