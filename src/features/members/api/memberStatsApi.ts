import { supabase } from "@/lib/supabase";
import { BestCategory, MemberStats, PredictionRow, RoundPerformance } from "../types/stats.type";

function computeStreaks(predictions: PredictionRow[]) {
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

function computeRecentForm(predictions: PredictionRow[]) {
  return predictions
    .filter((prediction) => prediction.is_finished)
    .sort(
      (a, b) =>
        new Date(a.matches?.kick_off ?? 0).getTime() - new Date(b.matches?.kick_off ?? 0).getTime(),
    )
    .slice(-5)
    .map((prediction) => {
      const points = prediction.points ?? 0;
      return {
        points,
        result: points === 5 ? ('B' as const) : points === 3 ? ('H' as const) : ('L' as const),
      };
    });
}
  
function computeRoundPerformance(predictions: PredictionRow[]): RoundPerformance[] {
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
  
function computeBestCategory({
    bingoHits,
    regularHits,
    rank,
    totalMembers,
  }: {
    bingoHits: number;
    regularHits: number;
    rank: number ;
    totalMembers: number;
  }): BestCategory {
    const categories = [
      { name: 'Correct scores', value: bingoHits },
      { name: 'Correct results', value: regularHits },
    ];
  
    const best = categories.sort((a, b) => b.value - a.value)[0];
    const topPercent =
      rank != null && totalMembers > 0 ? Math.max(1, Math.round((rank / totalMembers) * 100)) : null;
  
    return {
      name: best.name,
      value: best.value,
      topPercent,
    };
  }
export const memberStatsApi = {
    async getMemberStats(memberId: string): Promise<MemberStats> {  
    if (!memberId) throw new Error('No member ID available');

    const { data: memberData, error: memberError } = await supabase
      .from('league_members')
      .select('league_id')
      .eq('id', memberId)
      .single();

    if (memberError) throw memberError;

    const [predictionsResult, leaderboardResult, pendingResult] = await Promise.all([
      supabase
        .from('predictions')
        .select('points, is_finished, matches(fixture, kick_off)')
        .eq('league_member_id', memberId)
        .eq('is_finished', true),
      supabase
        .from('league_leaderboard_view')
        .select('member_id, total_points')
        .eq('league_id', memberData.league_id)
        .order('total_points', { ascending: false }),
      supabase
        .from('predictions')
        .select('*', { count: 'exact', head: true })
        .eq('league_member_id', memberId)
        .eq('is_finished', false),
    ]);

    if (predictionsResult.error) throw predictionsResult.error;
    if (leaderboardResult.error) throw leaderboardResult.error;
    if (pendingResult.error) throw pendingResult.error;

    const predictionsData = predictionsResult.data;
    const leaderboardData = leaderboardResult.data;

    const totalPredictions = predictionsData.length;
    const totalPoints = predictionsData.reduce((sum, prediction) => sum + (prediction.points || 0), 0);

    const bingoHits = predictionsData.filter((p) => p.points === 5).length;
    const regularHits = predictionsData.filter((p) => p.points === 3).length;
    const missedHits = predictionsData.filter((p) => p.points === 0).length;

    const accuracy = totalPredictions > 0 ? ((bingoHits + regularHits) / totalPredictions) * 100 : 0;

    // Find member's position in leaderboard
    const memberIndex = leaderboardData.findIndex((entry) => entry.member_id === memberId);
    const rank = memberIndex !== -1 ? memberIndex + 1 : 0;
    const totalMembers = leaderboardData.length;

    const { currentStreak, longestStreak } = computeStreaks(predictionsData);
    const recentForm = computeRecentForm(predictionsData);
    const pendingPredictions = pendingResult.count ?? 0;
    const roundPerformance = computeRoundPerformance(predictionsData);
    const bestCategory = computeBestCategory({
      bingoHits,
      regularHits,
      rank,
      totalMembers,
    });

    return { 
      totalPredictions ,
      bingoHits ,
      regularHits,
      missedHits,
      totalPoints ,
      accuracy,
      rank,
      totalMembers ,
      currentStreak ,
      longestStreak ,
      recentForm,
      roundPerformance, 
      bestCategory, 
      pendingPredictions ,
    };
  },
};
