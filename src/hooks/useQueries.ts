// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   getLeagueMatches,
//   getLeaderboard,
//   getUserPredictions,
//   createPrediction,
//   createLeague,
//   joinLeague,
// } from "../services/supabase";
// import {
//   syncMatchesToDatabase,
//   updatePredictionPoints,
// } from "../services/footballApi";
// import { FootballLeague, CreateLeagueForm, PredictionForm } from "../types";

// // Match queries
// export const useMatches = (league: FootballLeague) => {
//   return useQuery({
//     queryKey: ["matches", league],
//     queryFn: () => getLeagueMatches(league),
//     refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
//     staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
//   });
// };

// // Leaderboard queries
// export const useLeaderboard = (leagueId: string) => {
//   return useQuery({
//     queryKey: ["leaderboard", leagueId],
//     queryFn: () => getLeaderboard(leagueId),
//     refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
//   });
// };

// // User predictions queries
// export const useUserPredictions = (userId: string, leagueId: string) => {
//   return useQuery({
//     queryKey: ["predictions", userId, leagueId],
//     queryFn: () => getUserPredictions(userId, leagueId),
//     enabled: !!userId && !!leagueId,
//   });
// };

// // Mutations
// export const useCreatePrediction = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: createPrediction,
//     onSuccess: () => {
//       // Invalidate relevant queries
//       queryClient.invalidateQueries({ queryKey: ["predictions"] });
//       queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
//     },
//   });
// };

// export const useCreateLeague = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (
//       data: CreateLeagueForm & { adminId: string; inviteCode: string }
//     ) => createLeague(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["userLeagues"] });
//     },
//   });
// };

// export const useJoinLeague = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({
//       leagueId,
//       userId,
//       nickname,
//     }: {
//       leagueId: string;
//       userId: string;
//       nickname: string;
//     }) => joinLeague(leagueId, userId, nickname),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["userLeagues"] });
//     },
//   });
// };

// export const useSyncMatches = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: syncMatchesToDatabase,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["matches"] });
//     },
//   });
// };

// export const useUpdatePredictionPoints = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: updatePredictionPoints,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["predictions"] });
//       queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
//     },
//   });
// };
