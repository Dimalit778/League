import { supabase } from "@/lib/supabase";
import { MemberStats } from "../types/stats.type";
import {
  computeBestCategory,
  computeRecentForm,
  computeRoundPerformance,
  computeStreaks,
} from "../model/stats";

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
