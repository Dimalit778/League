import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { matchesService } from '@/services/matchesService';
import { useQuery } from '@tanstack/react-query';

export const useGetMatchesByMatchday = (
  matchday: number,
  competitionId: number
) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byMatchday(competitionId, matchday),
    queryFn: () => matchesService.getMatchesByMatchday(matchday, competitionId),
    enabled: !!matchday && !!competitionId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useGetMatchById = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byId(id),
    queryFn: () => matchesService.getMatchById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useGetMatchesWithPredictions = (
  matchday: number,
  competitionId: number,
  userId: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.withPredictions(
      competitionId,
      matchday,
      userId
    ),
    queryFn: () =>
      matchesService.getMatchesWithPredictions(matchday, competitionId, userId),
    enabled: !!matchday && !!competitionId && !!userId,
    staleTime: 30_000,
  });
};
export const useGetMatches = (
  matchday: number,
  competitionId: number,
  userId: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byMatchday(competitionId, matchday),
    queryFn: () => matchesService.getMatches(matchday, competitionId, userId),
    enabled: !!matchday && !!competitionId && !!userId,
    staleTime: 30_000,
  });
};
