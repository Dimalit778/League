import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matchesService';

export const useGetMatchesByFixture = (fixture: number, competitionId: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byFixture(fixture, competitionId),
    queryFn: () => matchesApi.getMatchesByFixture(fixture, competitionId),
    enabled: !!fixture && !!competitionId,
    staleTime: 5000 * 60 * 5,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useGetMatchWithPredictions = (id: number, leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byIdWithPredictions(leagueId, id),
    queryFn: async () => {
      const result = await matchesApi.getMatchWithPredictions(id, leagueId);
      const sortedPredictions = [...(result.predictions ?? [])].sort((a, b) => {
        const diff = (b.points ?? 0) - (a.points ?? 0);
        if (diff !== 0) return diff;
        return a.league_member.nickname.localeCompare(b.league_member.nickname);
      });
      result.predictions = sortedPredictions;
      return result;
    },
    enabled: !!id && !!leagueId,
    staleTime: 30_000,
  });
};

export const useGetMatchesByFixtureWithMemberPredictions = (
  fixture: number,
  leagueId: string,
  competitionId: number,
  memberId: string
) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byLeagueFixture(leagueId, fixture),
    queryFn: () => matchesApi.getMatchesByFixtureWithMemberPredictions(fixture, competitionId, memberId),
    enabled: !!leagueId && !!fixture && !!competitionId && !!memberId,
    staleTime: 5000 * 60 * 5 * 60, // 5 minutes
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useGetMatch = (id: number) => {
  return useQuery({
    queryKey: QUERY_KEYS.matches.byId(id),
    queryFn: () => matchesApi.getMatch(id),
    enabled: !!id,
    staleTime: 5000 * 60 * 5 * 60, // 5 minutes
  });
};
