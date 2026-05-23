import { Error, LoadingOverlay } from '@/components/layout';
import { useEffect, useMemo, useState } from 'react';
import ChampionLeagueView from '../components/tournament/ChampionLeagueView';
import GroupMatches from '../components/tournament/GroupMatches';
import KnockoutMatches from '../components/tournament/KnockoutMatches';
import { TournamentViewTabs } from '../components/tournament/TournametTabs';
import { useGetCompetitionMatches } from '../hooks/useMatches';
import { getKnockoutStages, getTournamentGroups, isLeaguePhase, TournamentView } from '../utils/tournamentMatches';

type TournamentMatchesProps = {
  competitionId: number;
  memberId: string;
  defaultView?: TournamentView;
};

export default function TournamentMatches({ competitionId, memberId, defaultView = 'groups' }: TournamentMatchesProps) {
  const [view, setView] = useState<TournamentView>(defaultView);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedKnockoutStage, setSelectedKnockoutStage] = useState('');

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

  const groups = useMemo(() => (view === 'groups' ? getTournamentGroups(matches) : []), [matches, view]);
  const knockoutStages = useMemo(() => (view === 'knockout' ? getKnockoutStages(matches) : []), [matches, view]);

  useEffect(() => {
    setSelectedGroup((current) => (groups.includes(current) ? current : (groups[0] ?? '')));
  }, [groups]);

  useEffect(() => {
    setSelectedKnockoutStage((current) => (knockoutStages.includes(current) ? current : (knockoutStages[0] ?? '')));
  }, [knockoutStages]);

  if (error) return <Error error={error} />;
  if (isLoading) return <LoadingOverlay />;

  return (
    <>
      <TournamentViewTabs value={view} onChange={setView} />
      {/* Champions League matches view */}
      {view === 'groups' && isLeaguePhase(matches) && <ChampionLeagueView matches={matches} onRefresh={refetch} />}

      {/* World Cup matches view */}
      {view === 'groups' && !isLeaguePhase(matches) && <GroupMatches matches={matches} onRefresh={refetch} />}

      {/* Knockout matches view */}
      {view === 'knockout' && <KnockoutMatches matches={matches} onRefresh={refetch} />}
    </>
  );
}
