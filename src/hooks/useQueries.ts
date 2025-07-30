import { supabase } from "@/lib/supabase";
import {
  createLeague,
  getLeagueMatches,
  joinLeague
} from "@/services/leagueService";
import {
  createPrediction,
  getLeaderboard,
  getUserLeagues,
  getUserPredictions,
  getUserProfile
} from "@/services/usersService";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for better organization and type safety
export const queryKeys = {
  userProfile: (userId: string) => ["user", userId] as const,
  userLeagues: (userId: string) => ["userLeagues", userId] as const,
  leagueMatches: (league: string) => ["matches", league] as const,
  userPredictions: (userId: string, leagueId: string) => ["predictions", userId, leagueId] as const,
  leaderboard: (leagueId: string) => ["leaderboard", leagueId] as const,
  allLeagues: ["leagues"] as const,
};

// User profile query
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => getUserProfile(userId, supabase),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// User leagues query
export const useUserLeagues = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userLeagues(userId),
    queryFn: () => getUserLeagues(userId, supabase),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

// League matches query
export const useLeagueMatches = (league: string) => {
  return useQuery({
    queryKey: queryKeys.leagueMatches(league),
    queryFn: () => getLeagueMatches(league, supabase),
    enabled: !!league,
    staleTime: 30 * 1000, // 30 seconds for live match updates
    refetchInterval: 60 * 1000, // Refetch every minute for live scores
  });
};

// User predictions query
export const useUserPredictions = (userId: string, leagueId: string) => {
  return useQuery({
    queryKey: queryKeys.userPredictions(userId, leagueId),
    queryFn: () => getUserPredictions(userId, leagueId, supabase),
    enabled: !!userId && !!leagueId,
    staleTime: 60 * 1000, // 1 minute
  });
};

// Leaderboard query
export const useLeaderboard = (leagueId: string) => {
  return useQuery({
    queryKey: queryKeys.leaderboard(leagueId),
    queryFn: () => getLeaderboard(leagueId, supabase),
    enabled: !!leagueId,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes for updates
  });
};

// Create prediction mutation
export const useCreatePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (predictionData: {
      league_id: string;
      user_id: string;
      match_id: number;
      home_score: number;
      away_score: number;
    }) => createPrediction(predictionData, supabase),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.userPredictions(variables.user_id, variables.league_id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leaderboard(variables.league_id),
      });
    },
    onError: (error) => {
      console.error("Error creating prediction:", error);
    },
  });
};

// Create league mutation
export const useCreateLeague = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (leagueData: { 
      name: string;
      selected_league: string;
      owner_id: string;
    }) => createLeague(leagueData),
    onSuccess: (_, variables) => {
      // Invalidate user leagues query
      queryClient.invalidateQueries({
          queryKey: queryKeys.userLeagues(variables.owner_id),
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

  return useMutation({
    mutationFn: ({
      leagueId,
      userId,
      nickname,
    }: {
      leagueId: string;
      userId: string;
      nickname: string;
    }) => joinLeague(leagueId, userId, nickname, supabase),
    onSuccess: (_, variables) => {
      // Invalidate user leagues query
      queryClient.invalidateQueries({
        queryKey: queryKeys.userLeagues(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.leaderboard(variables.leagueId),
      });
    },
    onError: (error) => {
      console.error("Error joining league:", error);
    },
  });
};

// Optimistic update helper for predictions
export const useOptimisticPrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (predictionData: {
      league_id: string;
      user_id: string;
      match_id: number;
      home_score: number;
      away_score: number;
    }) => createPrediction(predictionData, supabase),
    onMutate: async (newPrediction) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: queryKeys.userPredictions(newPrediction.user_id, newPrediction.league_id),
      });

      // Snapshot the previous value
      const previousPredictions = queryClient.getQueryData<{ data: Prediction[], error: any }>(
        queryKeys.userPredictions(newPrediction.user_id, newPrediction.league_id)
      );

      // Optimistically update to the new value
      if (previousPredictions?.data) {
        queryClient.setQueryData(
          queryKeys.userPredictions(newPrediction.user_id, newPrediction.league_id),
          {
            data: [
              {
                id: `temp-${Date.now()}`,
                ...newPrediction,
                points: 0,
                created_at: new Date().toISOString(),
              },
              ...previousPredictions.data,
            ],
            error: null,
          }
        );
      }

      return { previousPredictions };
    },
    onError: (err, newPrediction, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousPredictions) {
        queryClient.setQueryData(
          queryKeys.userPredictions(newPrediction.user_id, newPrediction.league_id),
          context.previousPredictions
        );
      }
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to make sure our local data is correct
      queryClient.invalidateQueries({
        queryKey: queryKeys.userPredictions(variables.user_id, variables.league_id),
      });
    },
  });
};
