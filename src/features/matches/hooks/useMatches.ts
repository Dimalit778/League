import { KEYS } from '@/lib/queryClient';
import { useLeagueId, usePrimaryLeagueStore } from '@/store/PrimaryLeagueStore';
import { prefetchMatchTeamLogos } from '@/utils/prefetchTeamLogos';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { matchesApi } from '../api/matchesApi';
import { TournamentView } from '../utils/tournamentMatches';

// Get match detail with all members predictions
export const useGetMatchDetail = (matchId: number) => {
  const leagueId = useLeagueId();
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
        return (a.league_member?.nickname ?? '').localeCompare(b.league_member?.nickname ?? '');
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
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady =
    enabled && competitionId != null && seasonId != null && memberId != null && selectedFixture > 0;

  const query = useQuery({
    queryKey: isReady
      ? KEYS.matches.fixture(competitionId, seasonId, selectedFixture, memberId, stage)
      : ([
          'matches',
          'fixture',
          'disabled',
          competitionId ?? 'none',
          seasonId ?? 'none',
          selectedFixture,
          memberId ?? 'none',
          stage ?? 'all',
        ] as const),
    queryFn: isReady
      ? () =>
          matchesApi.getMatchesByFixture({
            fixture: selectedFixture,
            competitionId,
            seasonId,
            memberId,
            stage,
          })
      : skipToken,
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    if (query.data) void prefetchMatchTeamLogos(query.data);
  }, [query.data]);

  return query
};


export const useGetCompetitionMatches = ({
  competitionId,
  memberId,
  stage,
  view,
  enabled = true,
}: {
  competitionId: number | null;
  memberId: string | null;
  stage?: string;
  view?: TournamentView;
  enabled?: boolean;
}) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady = enabled && competitionId != null && seasonId != null && memberId != null;

  const query = useQuery({
    queryKey:
      isReady
        ? view
          ? [...KEYS.matches.byCompetition(competitionId, seasonId, memberId), 'view', view]
          : stage
            ? [...KEYS.matches.byCompetition(competitionId, seasonId, memberId), stage]
            : KEYS.matches.byCompetition(competitionId, seasonId, memberId)
        : (['matches', 'competition', 'disabled', competitionId ?? 'none', seasonId ?? 'none', memberId ?? 'none', view ?? stage ?? 'all'] as const),
    queryFn:
      isReady
        ? async () => {
            let matches;
            if (view) {
              matches = await matchesApi.getTournamentMatchesByView(competitionId, seasonId, memberId, view);
            } else if (stage) {
              matches = await matchesApi.getTournamentMatches(competitionId, seasonId, memberId, stage);
            } else {
              matches = await matchesApi.getCompetitionMatchesWithMemberPredictions(
                competitionId,
                seasonId,
                memberId,
              );
            }
            await prefetchMatchTeamLogos(matches);
            return matches;
          }
        : skipToken,
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
  });

  return query;
};

export const useGetNearestUpcomingMatch = ({
  competitionId,
  memberId,
  enabled = true,
}: {
  competitionId: number | null;
  memberId: string | null;
  enabled?: boolean;
}) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady = enabled && competitionId != null && seasonId != null && memberId != null;

  return useQuery({
    queryKey: isReady
      ? KEYS.matches.nearest(competitionId, seasonId, memberId)
      : (['matches', 'nearest', 'disabled', competitionId ?? 'none', seasonId ?? 'none', memberId ?? 'none'] as const),
    queryFn: isReady
      ? () => matchesApi.getNearestUpcomingMatch(competitionId, seasonId, memberId)
      : skipToken,
    enabled: isReady,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetTodayMatches = ({
  competitionId,
  memberId,
}: {
  competitionId: number ;
  memberId: string;
}) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady = competitionId != null && seasonId != null && memberId != null;

  return useQuery({
    queryKey:
      isReady
        ? KEYS.matches.today(competitionId, seasonId, memberId)
        : (['matches', 'today', 'disabled', competitionId ?? 'none', seasonId ?? 'none', memberId ?? 'none'] as const),
    queryFn:
      isReady
        ? () => matchesApi.getTodayMatches(competitionId, seasonId, memberId)
        : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};

  export const useGetFinishedFixtures = (competitionId: number | null) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady = competitionId != null && seasonId != null;
  return useQuery({
    queryKey: isReady
      ? KEYS.matches.finishedFixtures(competitionId, seasonId)
      : (['matches', 'finished-fixtures', 'disabled'] as const),
    queryFn: isReady ? () => matchesApi.getFinishedFixtures(competitionId, seasonId) : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetMemberFinishedMatches = (
  memberId: string | null,
  competitionId: number | null,
  fixture: number | null,
) => {
  const seasonId = usePrimaryLeagueStore((state) => state.seasonId);
  const isReady =
    !!memberId && competitionId != null && seasonId != null && fixture != null && fixture > 0;
  return useQuery({
    queryKey:
      isReady
        ? KEYS.matches.byFixture(fixture, competitionId, seasonId, memberId)
        : (['matches', 'finished', competitionId ?? 'none', seasonId ?? 'none', memberId ?? 'none', fixture ?? 'none'] as const),
    queryFn:
      isReady
        ? () => matchesApi.getMemberFinishedMatches(memberId, competitionId, seasonId, fixture)
        : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};
