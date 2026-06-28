import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { useGetCompetitionMatches, useGetTournamentActiveStage } from '@/features/matches/hooks/useMatches';
import { selectCompetition, selectCompetitionId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { useEffect, useMemo, useState } from 'react';
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
  const memberId = useMemberStore(selectMemberId);
  const competitionId = useMemberStore(selectCompetitionId);
  const [view, setView] = useState<TournamentView>(defaultView);

  useEffect(() => {
    setView(defaultView);
  }, [defaultView]);

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
  const competitionId = useMemberStore(selectCompetitionId);
  const { data: activeStage } = useGetTournamentActiveStage({ competitionId });
  const competition = useMemberStore(selectCompetition);

  const defaultView = useMemo(() => {
    const stage = activeStage?.activeStage ?? competition?.current_stage;
    return isKnockoutOnlyStage(stage) ? 'knockout' : 'groups';
  }, [activeStage?.activeStage, competition?.current_stage]);

  if (!competitionId || !competition || !activeStage) return <LoadingOverlay />;

  return (
    <Screen>
      <TournamentMatches defaultView={defaultView} />
    </Screen>
  );
}
