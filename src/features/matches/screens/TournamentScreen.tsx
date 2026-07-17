import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { useGetCompetitionMatches, useGetTournamentActiveStage } from '@/features/matches/hooks/useMatches';
import { usePrimaryMember } from '@/store/MemberStore';
import { useMemo, useState } from 'react';
import ChampionLeagueView from '../components/champions-league/ChampionLeagueView';
import GroupMatches from '../components/tournament/GroupMatches';
import KnockoutMatches from '../components/tournament/KnockoutMatches';
import { TournamentViewTabs } from '../components/tournament/TournametTabs';
import { isKnockoutOnlyStage } from '../types/footballStages';
import { isLeaguePhase, TournamentView } from '../utils/tournamentMatches';

type TournamentMatchesProps = {
  defaultView?: TournamentView;
};

const TournamentMatches = ({ defaultView = 'groups' }: TournamentMatchesProps) => {
  const { memberId, competitionId } = usePrimaryMember();

  const [view, setView] = useState<TournamentView>(defaultView);

  const {
    data: matches = [],
    isLoading,
    error,
    refetch,
  } = useGetCompetitionMatches({
    competitionId,
    memberId,
    view,
  });

  if (error) return <Error error={error} />;
  if (isLoading) return <LoadingOverlay />;

  const isLeaguePhaseView = view === 'groups' && isLeaguePhase(matches);

  return (
    <>
      <TournamentViewTabs value={view} onChange={setView} />

      {isLeaguePhaseView && <ChampionLeagueView matches={matches} onRefresh={refetch} />}

      {view === 'groups' && !isLeaguePhaseView && <GroupMatches matches={matches} onRefresh={refetch} />}

      {view === 'knockout' && <KnockoutMatches matches={matches} onRefresh={refetch} />}
    </>
  );
};

export default function TournamentScreen() {
  const { competitionId } = usePrimaryMember();
  const { data: activeStage } = useGetTournamentActiveStage({ competitionId });

  const defaultView = useMemo(() => {
    const stage = activeStage?.activeStage;
    return isKnockoutOnlyStage(stage) ? 'knockout' : 'groups';
  }, [activeStage?.activeStage]);

  if (!activeStage) return <LoadingOverlay />;

  return (
    <Screen className="pt-2">
      <TournamentMatches defaultView={defaultView} />
    </Screen>
  );
}
