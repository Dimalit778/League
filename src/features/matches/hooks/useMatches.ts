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
type UseGetMatchesProps = {
  selectedFixture: number;
  competitionId?: number | null | undefined;
  memberId?: string | null | undefined;
};
// Get matches by fixture with current Member predictions
export const useGetMatches = ({ selectedFixture, competitionId, memberId }: UseGetMatchesProps) => {
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

// export const useGetMatch = ({ matchId }: { matchId?: number }) => {
//   return useQuery({
//     queryKey: KEYS.matches.detail(matchId as number),
//     queryFn: matchId ? () => matchesApi.getMatch(matchId) : skipToken,
//     staleTime: 5000 * 60 * 5 * 60, // 5 minutes
//   });
// };
export const useGetUniqueDates = ({
  competitionId,
  fixtureNumber,
}: {
  competitionId: number;
  fixtureNumber: number;
}) => {
  return useQuery({
    queryKey: KEYS.matches.uniqueDates(competitionId, fixtureNumber),
    queryFn: () => matchesApi.getUniqueDates(competitionId, fixtureNumber),
    staleTime: 1000 * 60 * 5,
  });
};
export const useGetMatchesByDate = ({
  competitionId,
  fixtureNumber,
  date,
}: {
  competitionId: number;
  fixtureNumber: number;
  date: string;
}) => {
  return useQuery({
    queryKey: KEYS.matches.byDate(competitionId, fixtureNumber, date),
    queryFn:
      date && competitionId && fixtureNumber
        ? () => matchesApi.getMatchesByDate(competitionId, fixtureNumber, date)
        : skipToken,
    staleTime: 1000 * 60 * 5,
    enabled: !!date && !!competitionId && !!fixtureNumber,
  });
};
