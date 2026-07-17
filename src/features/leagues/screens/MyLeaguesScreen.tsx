import { Error, LoadingBall, Screen } from '@/components/layout';
import {
  EmptyList,
  LeagueHeader,
  LeaguesIndicator,
  LeaguesList,
  LimitSelectModal,
  PrimaryLeagueCard,
} from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { View } from 'react-native';

export default function MyLeaguesScreen() {
  const {
    isLoading,
    error,
    allLeagues,
    activeCount,
    maxLeagues,
    hasPrimaryMember,
    selectLeague,
    upgrade,
    limitSelect,
  } = useMyLeaguesScreen();

  if (isLoading) return <LoadingBall />;
  if (error) return <Error error={error as Error} />;

  return (
    <Screen edges={['top', 'bottom']} className="flex-1">
      <LeagueHeader />

      <View className="flex-1 min-h-0">
        {!allLeagues.length ? (
          <EmptyList message="Create or join a league to get started." />
        ) : (
          <>
            {hasPrimaryMember && <PrimaryLeagueCard showButton />}
            <LeaguesList leagues={allLeagues} onPress={selectLeague} />
          </>
        )}
      </View>

      <LeaguesIndicator used={activeCount} limit={maxLeagues} onPress={upgrade} />

      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </Screen>
  );
}
