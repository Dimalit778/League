import { KEYS } from '@/lib/queryClient';
import { useMemberStore } from '@/store/MemberStore';
import { skipToken, useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matchesService';

// Get match detail with all members predictions
export const useGetMatchDetail = (matchId: number) => {
  const leagueId = useMemberStore((s) => s.leagueId);
  return useQuery({
    queryKey: KEYS.matches.withPredictions(leagueId as string, matchId),
    queryFn: leagueId && matchId ? () => matchesApi.getMatchWithPredictions(leagueId, matchId) : skipToken,
    select: (data) => {
      const sortedPredictions = [...(data?.predictions ?? [])].sort((a, b) => {
        const diff = (b.points ?? 0) - (a.points ?? 0);
        if (diff !== 0) return diff;
        return a.league_member.nickname.localeCompare(b.league_member.nickname);
      });
      data.predictions = sortedPredictions;
      return data;
    },

    staleTime: 1000 * 60 * 5,
  });
};

// Get matches by fixture with current Member predictions
export const useGetMatches = ({
  selectedFixture,
  competitionId,
  memberId,
}: {
  selectedFixture: number;
  competitionId: number;
  memberId: string;
}) => {
  return useQuery({
    queryKey: KEYS.matches.byFixture(selectedFixture, competitionId as number, memberId as string),
    queryFn:
      competitionId && memberId
        ? () => matchesApi.getMatchesByFixtureWithMemberPredictions(selectedFixture, competitionId, memberId)
        : skipToken,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useGetMemberFinishedMatches = (memberId: string, competitionId: number, fixture?: number) => {
  return useQuery({
    queryKey:
      fixture !== undefined
        ? KEYS.matches.byFixture(fixture, competitionId, memberId)
        : ['matches', 'finished', competitionId, memberId],
    queryFn: () => matchesApi.getMemberFinishedMatches(memberId, competitionId, fixture),
    enabled: !!memberId && !!competitionId,
    staleTime: 1000 * 60 * 5,
  });
};
