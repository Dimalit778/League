import { Error, LoadingOverlay } from '@/components/layout';
import { useEffect, useState } from 'react';
import GroupMatches from '../components/tournament/GroupMatches';
import KnockoutMatches from '../components/tournament/KnockoutMatches';
import { TournamentViewTabs } from '../components/tournament/TournametTabs';
import { useGetCompetitionMatches } from '../hooks/useMatches';
import { isLeaguePhase, TournamentView } from '../utils/tournamentMatches';

type TournamentMatchesProps = {
  competitionId: number;
  memberId: string;
  defaultView?: TournamentView;
};

export default function TournamentMatches({ competitionId, memberId, defaultView = 'groups' }: TournamentMatchesProps) {
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
}
