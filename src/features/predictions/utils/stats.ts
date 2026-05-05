import { predictionService } from '../api/predictionService';
type MyPredictionRow = Awaited<ReturnType<typeof predictionService.getMyPredictionsView>>[number];

const isScoreObject = (score: unknown): score is Record<string, unknown> =>
  !!score && typeof score === 'object' && !Array.isArray(score);

const isFullTimeScore = (score: unknown): score is { home?: number | null; away?: number | null } =>
  !!score && typeof score === 'object' && !Array.isArray(score);

export function computePredictionStats(rows: MyPredictionRow[]) {
  let total = 0;
  let finished = 0;
  let bingo = 0;
  let hit = 0;
  let miss = 0;

  for (const row of rows) {
    total += 1;

    if (!row.is_finished) continue;
    finished += 1;

    const ft = isScoreObject(row.score) ? (row.score.fullTime ?? row.score.fulltime) : null;
    if (!isFullTimeScore(ft)) continue;

    const ftHome = ft?.home;
    const ftAway = ft?.away;

    if (ftHome == null || ftAway == null) continue;

    const ph = row.predicted_home_score;
    const pa = row.predicted_away_score;
    if (ph == null || pa == null) continue;

    const predictedDiff = ph - pa;
    const actualDiff = ftHome - ftAway;

    if (ph === ftHome && pa === ftAway) {
      bingo += 1;
    } else if (
      (predictedDiff === 0 && actualDiff === 0) || // draw
      (predictedDiff > 0 && actualDiff > 0) || // home win
      (predictedDiff < 0 && actualDiff < 0) // away win
    ) {
      hit += 1;
    } else {
      miss += 1;
    }
  }

  const accuracy = finished > 0 ? (hit + bingo) / finished : 0;

  return { total, finished, bingo, hit, miss, accuracy };
}
