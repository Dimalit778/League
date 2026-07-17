import { Error, Screen } from '@/components/layout';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { useGetCompetitionMatches, useGetNearestUpcomingMatch } from '@/features/matches/hooks/useMatches';
import { usePrimaryMember } from '@/store/MemberStore';
import { useEffect, useMemo, useState } from 'react';
import ChampionLeagueView from '../components/champions-league/ChampionLeagueView';
import MatchesSkeleton from '../components/MatchesSkeleton';
import GroupMatches from '../components/tournament/GroupMatches';
import KnockoutMatches from '../components/tournament/KnockoutMatches';
import { TournamentViewTabs } from '../components/tournament/TournametTabs';
import { isKnockoutOnlyStage } from '../types/footballStages';
import {
  getKnockoutDisplayStageForMatch,
  getTournamentViewForMatch,
  isLeaguePhase,
  normalizedGroupLetter,
  TournamentView,
} from '../utils/tournamentMatches';

export default function TournamentScreen() {
  const { memberId, competitionId } = usePrimaryMember();
  const { data: meta, isLoading: metaLoading, error: metaError } = useGetCompetitionsDetails();
  const { data: nearestMatch, isLoading: nearestLoading } = useGetNearestUpcomingMatch({
    competitionId,
    memberId,
    enabled: !!meta,
  });
  const [view, setView] = useState<TournamentView | null>(null);

  const initialGroup = useMemo(() => normalizedGroupLetter(nearestMatch?.group) || undefined, [nearestMatch?.group]);
  const initialKnockoutStage = useMemo(
    () => getKnockoutDisplayStageForMatch(nearestMatch?.stage),
    [nearestMatch?.stage],
  );
  const initialFixture = nearestMatch?.fixture ?? undefined;

  useEffect(() => {
    if (view !== null) return;
    if (nearestLoading) return;

    if (nearestMatch) {
      setView(getTournamentViewForMatch(nearestMatch.stage));
      return;
    }

    if (meta) {
      setView(isKnockoutOnlyStage(meta.currentStage) ? 'knockout' : 'groups');
    }
  }, [meta, nearestMatch, nearestLoading, view]);

  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError,
    refetch,
  } = useGetCompetitionMatches({
    competitionId,
    memberId,
    view: view ?? 'groups',
    enabled: view != null,
  });

  if (metaError || matchesError) return <Error error={metaError || matchesError || { message: 'Unknown error' }} />;
  if (metaLoading || nearestLoading || view === null || matchesLoading) {
    return (
      <Screen className="pt-2">
        <MatchesSkeleton />
      </Screen>
    );
  }

  const isLeaguePhaseView = view === 'groups' && isLeaguePhase(matches);

  return (
    <Screen className="pt-2">
      <TournamentViewTabs value={view} onChange={setView} />

      {isLeaguePhaseView && (
        <ChampionLeagueView matches={matches} onRefresh={refetch} initialFixture={initialFixture} />
      )}

      {view === 'groups' && !isLeaguePhaseView && (
        <GroupMatches matches={matches} onRefresh={refetch} initialGroup={initialGroup} />
      )}

      {view === 'knockout' && (
        <KnockoutMatches matches={matches} onRefresh={refetch} initialStage={initialKnockoutStage} />
      )}
    </Screen>
  );
}
