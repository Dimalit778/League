import { KEYS } from '@/lib/queryClient';
import { selectLeagueId, useMemberStore } from '@/store/MemberStore';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { matchesApi } from '../api/matchesService';
import { TournamentView } from '../utils/tournamentMatches';

// Get match detail with all members predictions
export const useGetMatchDetail = (matchId: number) => {
  const leagueId = useMemberStore(selectLeagueId);
  const query = useQuery({
    queryKey:
      leagueId && matchId > 0
        ? KEYS.matches.withPredictions(leagueId, matchId)
        : (['matches', 'detail', 'disabled', matchId || 'none'] as const),
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

  useEffect(() => {
    if (query.data) prefetchMatchTeamLogos(query.data);
  }, [query.data]);

  return query;
};

// Get matches by fixture with current Member predictions
export const useGetMatchesByFixture = ({
  selectedFixture,
  competitionId,
  memberId,
  enabled = true,
  stage,
}: {
  selectedFixture: number;
  competitionId: number | null;
  memberId: string | null;
  enabled?: boolean;
  stage?: string;
}) => {
  const query = useQuery({
    queryKey:
      competitionId != null && memberId != null && selectedFixture > 0
        ? KEYS.matches.fixture(competitionId, selectedFixture, memberId, stage)
        : ([
            'matches',
            'fixture',
            'disabled',
            competitionId ?? 'none',
            selectedFixture,
            memberId ?? 'none',
            stage ?? 'all',
          ] as const),
    queryFn:
      enabled && competitionId != null && memberId != null && selectedFixture > 0
        ? async () => {
            const matches = await matchesApi.getFixtureMatchesWithMemberPrediction({
              fixture: selectedFixture,
              competitionId,
              memberId,
              stage,
            });
            await prefetchMatchTeamLogos(matches);
            return matches;
          }
        : skipToken,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  return query;
};


export const useGetCompetitionMatches = ({
  competitionId,
  memberId,
  stage,
  view,
}: {
  competitionId: number | null;
  memberId: string | null;
  stage?: string;
  view?: TournamentView;
}) => { 
  const query = useQuery({
    queryKey:
      competitionId != null && memberId != null
        ? view
          ? [...KEYS.matches.byCompetition(competitionId, memberId), 'view', view]
          : stage
            ? [...KEYS.matches.byCompetition(competitionId, memberId), stage]
            : KEYS.matches.byCompetition(competitionId, memberId)
        : (['matches', 'competition', 'disabled', competitionId ?? 'none', memberId ?? 'none', view ?? stage ?? 'all'] as const),
    queryFn:
      competitionId != null && memberId != null
        ? async () => {
            let matches;
            if (view) {
              matches = await matchesApi.getTournamentMatchesByView(competitionId, memberId, view);
            } else if (stage) {
              matches = await matchesApi.getTournamentMatches(competitionId, memberId, stage);
            } else {
              matches = await matchesApi.getCompetitionMatchesWithMemberPredictions(
                competitionId,
                memberId,
              );
            }
            await prefetchMatchTeamLogos(matches);
            return matches;
          }
        : skipToken,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  return query;
};

export const useGetTournamentActiveStage = ({ competitionId }: { competitionId: number | null }) => {
  return useQuery({
    queryKey: competitionId
      ? ['matches', competitionId, 'active-stage']
      : (['matches', 'active-stage', 'disabled'] as const),
    queryFn: competitionId ? () => matchesApi.getTournamentActiveStage(competitionId) : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};
export const useGetTodayMatches = ({
  competitionId,
  memberId,
}: {
  competitionId: number | null;
  memberId: string | null;
}) => {
  return useQuery({
    queryKey:
      competitionId && memberId
        ? KEYS.matches.today(competitionId, memberId)
        : (['matches', 'today', 'disabled', competitionId ?? 'none', memberId ?? 'none'] as const),
    queryFn:
      competitionId && memberId
        ? () => matchesApi.getTodayMatchesForCompetition(competitionId, memberId)
        : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetMemberFinishedMatches = (memberId: string | null, competitionId: number | null, fixture?: number) => {
  return useQuery({
    queryKey:
      memberId && competitionId && fixture !== undefined
        ? KEYS.matches.byFixture(fixture, competitionId, memberId)
        : (['matches', 'finished', competitionId ?? 'none', memberId ?? 'none', fixture ?? 'all'] as const),
    queryFn:
      memberId && competitionId
        ? () => matchesApi.getMemberFinishedMatches(memberId, competitionId, fixture)
        : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};
