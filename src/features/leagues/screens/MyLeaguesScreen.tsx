import { Error, LoadingBall, Screen } from '@/components/layout';
import { Button } from '@/components/ui';
import { LeaguesIndicator, LimitSelectModal } from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { View } from 'react-native';
import { Leagues } from '../components/myLeagues/Leagues';

export default function MyLeaguesScreen() {
  const { isLoading, error, activeCount, maxLeagues, upgrade, limitSelect } = useMyLeaguesScreen();
  const { t } = useTranslation();
  if (isLoading) return <LoadingBall />;
  if (error) return <Error error={error as Error} />;

  return (
    <Screen edges={['bottom']} padding="none" className="flex-1">
      <LeaguesIndicator used={activeCount} limit={maxLeagues} />

      <View className="flex-1 px-4 sm:px-6 lg:px-8">
        <Leagues upgrade={upgrade} />
        <View className="mb-6 flex-row gap-2">
        <Button
          variant="primary"
          className="flex-1"
          label={t('Create League')}
          onPress={() => router.push('/leagues/create-league/competitions')}
        />
        <Button
          variant="outline"
          className="flex-1"
          label={t('Join League')}
          onPress={() => router.push('/leagues/join-league')}
        />
        </View>
      </View>
      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </Screen>
  );
}
