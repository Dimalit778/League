import { QUERY_KEYS } from "@/lib/queryKeys";
import { leaderboardService } from "@/services/leaderboardService";
import { useLeagueStore } from "@/store/LeagueStore";
import { LeagueLeaderboardType } from "@/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";


export  const useGetLeagueLeaderboard = (): UseQueryResult<LeagueLeaderboardType[], Error> => {
  const { primaryLeague } = useLeagueStore();
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard(primaryLeague!.id),
    queryFn: () => leaderboardService.getLeagueLeaderboard(primaryLeague!.id),
    enabled: !!primaryLeague?.id,
    staleTime: 1000 * 60 * 5, 
  });
};
// export const useLeagueMemberPredictions = (): UseQueryResult<LeagueMemberPrediction[], Error> => {
//   const { primaryLeague } = useLeagueStore();

//   return useQuery({
//     queryKey: ["leagueMemberPredictions", primaryLeague?.id],
//     queryFn: () => leaderboardService.getMemberPredictions(primaryLeague!.id),
//     enabled: !!primaryLeague?.id,
//     staleTime: 1000 * 60 * 5, 
//   });
// };

/**
 * Hook to get league members with sum of their prediction points
 */
// export const useLeagueMembersWithPoints = (): UseQueryResult<LeagueMemberWithPoints[], Error> => {
//   const { primaryLeague } = useLeagueStore();

//   return useQuery({
//     queryKey: ["leagueMembersWithPoints", primaryLeague?.id],
//     queryFn: () => leaderboardService.getLeagueMembersWithPoints(primaryLeague!.id),
//     enabled: !!primaryLeague?.id,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// };

/**
 * Hook to get league members points for a specific fixture
 */
// export const useLeagueMembersFixturePoints = (fixtureId?: number): UseQueryResult<LeagueMemberFixturePoints[], Error> => {
//   const { primaryLeague } = useLeagueStore();

//   return useQuery({
//     queryKey: ["leagueMembersFixturePoints", primaryLeague?.id, fixtureId],
//     queryFn: () => leaderboardService.getLeagueMembersFixturePoints(
//       primaryLeague!.id,
//       fixtureId!
//     ),
//     enabled: !!primaryLeague?.id && !!fixtureId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// };

/**
 * Hook to get top performers in the primary league
 */
// export const useTopLeagueMembers = (limit: number = 3): UseQueryResult<LeagueMemberWithPoints[], Error> => {
//   const { primaryLeague } = useLeagueStore();

//   return useQuery({
//     queryKey: ["topLeagueMembers", primaryLeague?.id, limit],
//     queryFn: () => leaderboardService.getTopLeagueMembers(primaryLeague!.id, limit),
//     enabled: !!primaryLeague?.id,
//     staleTime: 1000 * 60 * 5, 
//   });
// };

/**
 * Hook to get member predictions for a specific user
 */
// export const useMemberPredictions = (userId: string): UseQueryResult<LeagueMemberPrediction[], Error> => {
//   const { primaryLeague } = useLeagueStore();

//   return useQuery({
//     queryKey: ["memberPredictions", primaryLeague?.id, userId],
//     queryFn: () => leaderboardService.getMemberPredictionsByUserId  (primaryLeague!.id, userId),
//     enabled: !!primaryLeague?.id && !!userId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// };

/**
 * Hook to get the best prediction for a fixture
 */
// export const useBestPredictionForFixture = (fixtureId: number): UseQueryResult<LeagueMemberFixturePoints | null, Error> => {
//   const { primaryLeague } = useLeagueStore();

//   return useQuery({
//     queryKey: ["bestPrediction", primaryLeague?.id, fixtureId],
//     queryFn: () => leaderboardService.getBestPredictionForFixture(primaryLeague!.id, fixtureId),
//     enabled: !!primaryLeague?.id && !!fixtureId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// };