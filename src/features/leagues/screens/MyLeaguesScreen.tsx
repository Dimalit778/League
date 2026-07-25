import { Error, LoadingBall, Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { LeaguesIndicator, LimitSelectModal } from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Leagues } from '../components/myLeagues/Leagues';

export default function MyLeaguesScreen() {
  const { isLoading, error, activeCount, maxLeagues, upgrade, limitSelect } = useMyLeaguesScreen();

  if (isLoading) return <LoadingBall />;
  if (error) return <Error error={error as Error} />;

  return (
    <Screen edges={['top', 'bottom']} className="flex-1">
      <LeaguesIndicator used={activeCount} limit={maxLeagues} onPress={upgrade} />

      <Leagues />
      <View className="mb-6 flex-row gap-2 px-6">
        <Button
          variant="outline"
          className="flex-1"
          title="Create League"
          onPress={() => router.push('/leagues/create-league')}
        />
        <Button
          variant="outline"
          className="flex-1"
          title="Join League"
          onPress={() => router.push('/leagues/join-league')}
        />
      </View>

      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </Screen>
  );
}
