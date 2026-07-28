import { Error } from '@/components/layout';
import { useGetCompetitionsDetails } from '@/features/leagues/hooks/useCompetition';
import { useCompetitionId, useMemberId } from '@/store/PrimaryLeagueStore';
import { View } from 'react-native';
import MatchesSkeleton from '../components/MatchesSkeleton';
import { useSeasonMatches } from '../hooks/useSeasonMatches';
import { resolveCompetitionShape } from '../model/competitionShape';
import GroupsKnockoutView from '../views/GroupsKnockoutView';
import KnockoutOnlyView from '../views/KnockoutOnlyView';
import LeaguePhaseKnockoutView from '../views/LeaguePhaseKnockoutView';
import RegularLeagueView from '../views/RegularLeagueView';

export default function MatchesScreen() {
  const memberId = useMemberId();
  const competitionId = useCompetitionId();
  const { data: meta, isLoading: metaLoading, error: metaError } = useGetCompetitionsDetails();
  const {
    data: matches = [],
    isLoading: matchesLoading,
    error: matchesError,
    refetch,
  } = useSeasonMatches({ competitionId, memberId, enabled: !!meta });

  if (metaLoading || matchesLoading || !meta) return <MatchesSkeleton />;
  if (metaError || matchesError) {
    return <Error error={metaError?.message || matchesError?.message || 'Unknown error'} />;
  }

  const shape = resolveCompetitionShape(meta.type, matches);
  const currentFixture = meta.currentFixture ?? 1;
  const currentStage = meta.currentStage ?? null;

  return (
    <View className="flex-1">
      {shape === 'REGULAR' && (
        <RegularLeagueView matches={matches} currentFixture={currentFixture} onRefresh={refetch} />
      )}
      {shape === 'LEAGUEPHASE_KO' && (
        <LeaguePhaseKnockoutView
          matches={matches}
          currentFixture={currentFixture}
          currentStage={currentStage}
          onRefresh={refetch}
        />
      )}
      {shape === 'GROUPS_KO' && (
        <GroupsKnockoutView matches={matches} currentStage={currentStage} onRefresh={refetch} />
      )}
      {shape === 'KNOCKOUT_ONLY' && (
        <KnockoutOnlyView matches={matches} currentStage={currentStage} onRefresh={refetch} />
      )}
    </View>
  );
}
