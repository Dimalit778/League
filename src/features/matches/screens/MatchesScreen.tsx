import { Error, Screen } from '@/components';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { useCompetitionId, useMemberId } from '@/store/PrimaryLeagueStore';
import { useCallback, useState } from 'react';
import MatchesSkeleton from '../components/MatchesSkeleton';
import { useSeasonMatches } from '../hooks/useSeasonMatches';
import { resolveCompetitionShape } from '../model/competitionShape';
import GroupsKnockoutView from '../views/GroupsKnockoutView';
import LeaguePhaseKnockoutView from '../views/LeaguePhaseKnockoutView';
import RegularLeagueView from '../views/RegularLeagueView';

export default function MatchesScreen() {
  const memberId = useMemberId();
  const competitionId = useCompetitionId();
  const [pullRefreshing, setPullRefreshing] = useState(false);

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetCompetitionsDetails();

  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError,
    refetch,
  } = useSeasonMatches({ competitionId, memberId, enabled: !!meta });

  const onRefresh = useCallback(async () => {
    setPullRefreshing(true);
    try {
      await refetch();
    } finally {
      setPullRefreshing(false);
    }
  }, [refetch]);

  if (metaLoading || matchesLoading || !meta) return <MatchesSkeleton />;
  if (metaError || matchesError) {
    return <Error error={metaError?.message || matchesError?.message || 'Unknown error'} />;
  }

  const shape = resolveCompetitionShape(meta.code);
  const currentFixture = meta.currentMatchday ?? 1;
  const currentStage = meta.currentStage ?? null;

  if (!shape) return <Error error={`Unsupported competition code: ${meta.code ?? 'missing'}`} />;

  return (
    <Screen>
      {shape === 'REGULAR' && (
        <RegularLeagueView
          matches={matches}
          currentFixture={currentFixture}
          onRefresh={onRefresh}
          refreshing={pullRefreshing}
        />
      )}
      {shape === 'LEAGUEPHASE_KO' && (
        <LeaguePhaseKnockoutView
          matches={matches}
          currentFixture={currentFixture}
          currentStage={currentStage}
          onRefresh={onRefresh}
          refreshing={pullRefreshing}
        />
      )}
      {shape === 'GROUPS_KO' && (
        <GroupsKnockoutView
          matches={matches}
          currentStage={currentStage}
          onRefresh={onRefresh}
          refreshing={pullRefreshing}
        />
      )}
    </Screen>
  );
}
