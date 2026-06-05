import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { useGetCompetitionMatches, useGetTournamentActiveStage } from '@/features/matches/hooks/useMatches';
import { selectCompetition, selectCompetitionId, selectMemberId, useMemberStore } from '@/store/MemberStore';
import { useEffect, useMemo, useState } from 'react';
import GroupMatches from '../components/tournament/group/GroupMatches';
import KnockoutMatches from '../components/tournament/knockout/KnockoutMatches';
import { TournamentViewTabs } from '../components/tournament/TournametTabs';
import { isKnockoutOnlyStage } from '../types/footballStages';
import { isLeaguePhase, TournamentView } from '../utils/tournamentMatches';

type TournamentMatchesProps = {
  competitionId: number;
  memberId: string;
  defaultView?: TournamentView;
};

const TournamentMatches = ({ competitionId, memberId, defaultView = 'groups' }: TournamentMatchesProps) => {
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

  return (
    <>
      <TournamentViewTabs value={view} onChange={setView} />

      {view === 'groups' && !isLeaguePhase(matches) && <GroupMatches matches={matches} onRefresh={refetch} />}

      {view === 'knockout' && <KnockoutMatches matches={matches} onRefresh={refetch} />}
    </>
  );
};

export default function TournamentScreen() {
  const memberId = useMemberStore(selectMemberId);
  const competitionId = useMemberStore(selectCompetitionId);
  const competition = useMemberStore(selectCompetition);
  const { data: activeStage } = useGetTournamentActiveStage({ competitionId });

  const defaultView = useMemo(() => {
    const stage = activeStage?.activeStage ?? competition?.current_stage;
    return isKnockoutOnlyStage(stage) ? 'knockout' : 'groups';
  }, [activeStage?.activeStage, competition?.current_stage]);

  if (!competitionId || !memberId) return <LoadingOverlay />;

  return (
    <Screen>
      <TournamentMatches competitionId={competitionId} memberId={memberId} defaultView={defaultView} />
    </Screen>
  );
}
