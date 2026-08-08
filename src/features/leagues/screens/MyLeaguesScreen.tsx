import { Button, Card, DirectionalIcon, Error, Row, Screen, Text } from '@/components';
import { LeaguesIndicator, LimitSelectModal } from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import { View } from 'react-native';
import { Leagues } from '../components/myLeagues/Leagues';
import LeaguesSkeleton from '../components/myLeagues/LeaguesSkeleton';

const ButtonRow = ({ onUpgrade, reachedLimit }: { onUpgrade: () => void; reachedLimit: boolean }) => {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  if (reachedLimit) {
    return (
      <Card
        variant="outlined"
        padding="md"
        onPress={onUpgrade}
        className="mb-6 border-primary/35"
        accessibilityLabel={t('Upgrade to Pro')}
        accessibilityHint={t('You have reached the max number of leagues') ?? undefined}
      >
        <Row className=" gap-4 ">
          <View className="h-10 w-10  justify-center">
            <Sparkles size={22} color={colors.primary} strokeWidth={1.75} />
          </View>

          <View className=" flex-1 ">
            <Text variant="label">{t('You have reached the max number of leagues')}</Text>
            <Text variant="label" tone="primary">
              {t('Upgrade to Pro')}
            </Text>
          </View>

          <DirectionalIcon size={18} color={colors.primary} />
        </Row>
      </Card>
    );
  }

  return (
    <Row className="mb-6 gap-2">
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
    </Row>
  );
};

export default function MyLeaguesScreen() {
  const { t } = useTranslation();
  const { isLoading, error, activeCount, isPro, maxLeagues, upgrade, activationSelection, limitSelect } =
    useMyLeaguesScreen();

  if (isLoading) return <LeaguesSkeleton />;
  if (error) return <Error error={error as Error} />;

  const reachedLimit = activeCount >= maxLeagues;
  const maxLeague = isPro && activeCount === maxLeagues;

  return (
    <Screen edges={['bottom']} padding="none" className="flex-1">
      <LeaguesIndicator used={activeCount} limit={maxLeagues} />

      <View className="mx-auto w-full max-w-2xl flex-1 px-4 sm:px-6 lg:px-8">
        <Leagues isPro={isPro} upgrade={upgrade} activationSelection={activationSelection} />
        {activationSelection?.selectedMemberIds.length ? (
          <Button
            className="mb-6"
            label={t(activationSelection.availableSlots === 1 ? 'Activate league' : 'Activate leagues')}
            onPress={activationSelection.onSave}
            loading={activationSelection.isSaving}
            disabled={!activationSelection.canSave}
          />
        ) : !maxLeague && !activationSelection ? (
          <ButtonRow reachedLimit={reachedLimit} onUpgrade={upgrade} />
        ) : null}
      </View>
      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </Screen>
  );
}
