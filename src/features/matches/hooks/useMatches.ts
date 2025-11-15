import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matchesService';

export const useGetMatchesByMatchday = (fixture: number, competitionId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byMatchday(competitionId, fixture),
    queryFn: () => matchesApi.getMatchesByMatchday(fixture, competitionId),
    enabled: !!fixture && !!competitionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useGetMatchById = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byId(id),
    queryFn: () => matchesApi.getMatchById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useGetMatchesWithPredictions = (fixture: number, competitionId: number, userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.withPredictions(competitionId, fixture, userId),
    queryFn: () => matchesApi.getMatchesWithPredictions(fixture, competitionId, userId),
    enabled: !!fixture && !!competitionId && !!userId,
    staleTime: 30_000,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};
export const useGetMatches = (fixture: number, competitionId: number, userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byMatchday(competitionId, fixture),
    queryFn: () => matchesApi.getMatches(fixture, competitionId, userId),
    enabled: !!fixture && !!competitionId && !!userId,
    staleTime: 30_000,
  });
};
export const useGetMatchesWithMemberPredictions = (fixture: number, competitionId: number, memberId: string) => {
  return useQuery({
    queryKey: ['matches', 'member', 'predictions', competitionId, fixture, memberId],
    queryFn: () => matchesApi.getMatchesWithMemberPredictions(fixture, competitionId, memberId),
    enabled: !!fixture && !!competitionId && !!memberId,
    staleTime: 30_000,
  });
};
export const useGetMatchWithPredictions = (id: number, leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byIdWithPredictions(id, leagueId),
    queryFn: () => matchesApi.getMatchWithPredictions(id, leagueId),
    enabled: !!id && !!leagueId,
    staleTime: 30_000,
  });
};
