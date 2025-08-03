import { useLeagueService } from "@/services/leagueService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for better organization and type safety
export const queryKeys = {
  userProfile: (userId: string) => ["user", userId] as const,
  userLeagues: (userId: string) => ["userLeagues", userId] as const,
  myLeagues: ["myLeagues"] as const,
  leagueMatches: (league: string) => ["matches", league] as const,
  userPredictions: (userId: string, leagueId: string) => ["predictions", userId, leagueId] as const,
  leaderboard: () => ["leaderboard"] as const,
  competitions: ["competitions"] as const,
  allLeagues: ["leagues"] as const,
};

// Get competitions query
export const useCompetitions = () => {
  const { getCompetitions } = useLeagueService();
  
  return useQuery({
    queryKey: queryKeys.competitions,
    queryFn: () => getCompetitions(),
    staleTime: 24 * 60 * 60 * 1000, 
  });
};

// Get user leagues query
export const useMyLeagues = () => {
  const { getMyLeagues } = useLeagueService();
  
  return useQuery({
    queryKey: queryKeys.myLeagues,
    queryFn: () => getMyLeagues(),
    staleTime: 30 * 60 * 1000, 
  });
};

// Create league mutation
export const useCreateLeague = () => {
  const queryClient = useQueryClient();
  const { createLeague } = useLeagueService();

  return useMutation({
    mutationFn: (leagueData: { 
      name: string;
      join_code: string;
      competition_id: number;
    }) => createLeague(leagueData),
    onSuccess: () => {
      // Invalidate user leagues query
      queryClient.invalidateQueries({
        queryKey: queryKeys.myLeagues,

      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.allLeagues,
      });
    },
    onError: (error) => {
      console.error("Error creating league:", error);
    },
  });
};

// Join league mutation
export const useJoinLeague = () => {
  const queryClient = useQueryClient();
  const { joinLeague } = useLeagueService();

  return useMutation({
    mutationFn: (leagueId: string) => joinLeague(leagueId),
    onSuccess: () => {
      // Invalidate user leagues query
      queryClient.invalidateQueries({
        queryKey: queryKeys.myLeagues,
      });
    },
    onError: (error) => {
      console.error("Error joining league:", error);
    },
  });
};

// Set primary league mutation
export const useSetPrimaryLeague = () => {
  const queryClient = useQueryClient();
  const { setPrimaryLeague } = useLeagueService();

  return useMutation({
    mutationFn: (leagueId: string) => setPrimaryLeague(leagueId),
    onSuccess: () => {
      // Invalidate user leagues query
      queryClient.invalidateQueries({
        queryKey: queryKeys.myLeagues,
      });
    },
    onError: (error) => {
      console.error("Error setting primary league:", error);
    },
  });
};
export  const useGetPrimaryLeague = () => {
  const { getMyLeagues } = useLeagueService();
  return useQuery({
    queryKey: queryKeys.myLeagues,
    queryFn: () => getMyLeagues(),
    select: (data) => data?.data?.find((league) => league.primary_league),
  });
};
export const useGetLeagueLeaderboard = () => {
  const { getLeagueLeaderboard } = useLeagueService();
  return useQuery({
    queryKey: queryKeys.leaderboard(),
    queryFn: () => getLeagueLeaderboard(),
  });
};