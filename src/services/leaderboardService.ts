import { supabase } from "@/lib/supabase";
import { LeagueLeaderboardType } from "@/types";


export const leaderboardService = {
    async getLeagueLeaderboard(leagueId: string): Promise<LeagueLeaderboardType[]> {
        const { data, error } = await supabase
          .from('league_leaderboard_view')
          .select('*')
          .eq('league_id', leagueId);
        
        if (error) throw error;
        return data as LeagueLeaderboardType[];
    },
  /**
   * Get all predictions for members of a specific league
   * @param leagueId - The UUID of the league
   * @returns Array of league member predictions
   */
  // async getMemberPredictions(leagueId: string): Promise<LeagueMemberPrediction[]> {
  //   const { data, error } = await supabase
  //     .rpc('get_member_predictions', { p_league_id: leagueId });
    
  //   if (error) throw error;
  //   return data;
  // },

  /**
   * Get league members with sum of their prediction points
   * @param leagueId - The UUID of the league
   * @returns Array of league members with their total points
   */
  // async getLeagueMembersWithPoints(leagueId: string): Promise<LeagueMemberWithPoints[]> {
  //   const { data, error } = await supabase
  //     .rpc('get_league_members_with_points', { p_league_id: leagueId });
    
  //   if (error) throw error;
  //   return data;
  // },

  /**
   * Get league members points for a specific fixture
   * @param leagueId - The UUID of the league
   * @param fixtureId - The ID of the fixture
   * @returns Array of league members with their prediction points for the fixture
   */
  // async getLeagueMembersFixturePoints(leagueId: string, fixtureId: number): Promise<LeagueMemberFixturePoints[]> {
  //   const { data, error } = await supabase
  //     .rpc('get_members_fixture_points', { 
  //       p_league_id: leagueId,
  //       p_fixture_id: fixtureId
  //     });
    
  //   if (error) throw error;
  //   return data;
  // },
  
  /**
   * Get top performers in a league (limited by count)
   * @param leagueId - The UUID of the league
   * @param limit - Maximum number of members to return
   * @returns Array of top league members sorted by points
   */
  // async getTopLeagueMembers(leagueId: string, limit: number = 3): Promise<LeagueMemberWithPoints[]> {
  //   const { data, error } = await supabase
  //     .rpc('get_league_members_with_points', { p_league_id: leagueId });
    
  //   if (error) throw error;
  //   return data.slice(0, limit); // Already sorted by points in the SQL function
  // },

  /**
   * Get member predictions for a specific user in a league
   * @param leagueId - The UUID of the league
   * @param userId - The UUID of the user
   * @returns Array of user's predictions in the league
   */
  // async getMemberPredictionsByUserId(leagueId: string, userId: string): Promise<LeagueMemberPrediction[]> {
  //   // We need to use the RPC function to get properly typed data
  //   const { data: allPredictions, error } = await supabase
  //     .rpc('get_member_predictions', { p_league_id: leagueId });
    
  //   if (error) throw error;
    
  //   // Filter predictions for the specific user
  //   return allPredictions.filter(prediction => prediction.user_id === userId);
  // },

  /**
   * Calculate total points across all members in a league
   * @param leagueId - The UUID of the league
   * @returns Total points sum
   */
  // async calculateTotalLeaguePoints(leagueId: string): Promise<number> {
  //   const { data, error } = await supabase
  //     .rpc('get_league_members_with_points', { p_league_id: leagueId });
    
  //   if (error) throw error;
  //   return data.reduce((sum, member) => sum + member.total_points, 0);
  // },

  /**
   * Find best prediction for a specific fixture in a league
   * @param leagueId - The UUID of the league
   * @param fixtureId - The ID of the fixture
   * @returns The member with highest points for this fixture, or null if none found
   */
  // async getBestPredictionForFixture(leagueId: string, fixtureId: number): Promise<LeagueMemberFixturePoints | null> {
  //   const { data, error } = await supabase
  //     .rpc('get_members_fixture_points', { 
  //       p_league_id: leagueId,
  //       p_fixture_id: fixtureId
  //     });
    
  //   if (error) throw error;
  //   if (!data || data.length === 0) return null;
    
  //   return data.reduce((best, current) => {
  //     if (!best.points || (current.points && current.points > best.points)) {
  //       return current;
  //     }
  //     return best;
  //   });
  // }
};