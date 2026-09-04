import { Button, Error, Row, Screen } from '@/components';

import { LimitSelectModal, MyLeaguesHeader, ProUpsellCard } from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Plus, UserPlus } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Leagues } from '../components/myLeagues/Leagues';

type ActivationSelection = NonNullable<ReturnType<typeof useMyLeaguesScreen>['activationSelection']>;

function LeagueActionButtons() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <Row
      className="absolute inset-x-0 justify-between px-5"
      style={{ bottom: Math.max(insets.bottom, 12) + 8, pointerEvents: 'box-none' }}
    >
      <Button
        intent="primary"
        shape="circle"
        size="icon-lg"
        accessibilityLabel={t('Join League')}
        onPress={() => router.push('/leagues/join-league')}
        className="border border-border"
      >
        <UserPlus size={32} color={colors.onPrimary} strokeWidth={2.5} />
      </Button>
      <Button
        intent="primary"
        shape="circle"
        size="icon-lg"
        accessibilityLabel={t('Create League')}
        onPress={() => router.push('/leagues/create-league/competitions')}
        className="border border-border"
      >
        <Plus size={30} color={colors.onPrimary} strokeWidth={2.5} />
      </Button>
    </Row>
  );
}

function ActivateLeaguesButton({ selection }: { selection: ActivationSelection }) {
  const { t } = useTranslation();

  return (
    <Button
      label={t(selection.availableSlots === 1 ? 'Activate league' : 'Activate leagues')}
      onPress={selection.onSave}
      loading={selection.isSaving}
      disabled={!selection.canSave}
    />
  );
}

export default function MyLeaguesScreen() {
  const { isLoading, error, activeCount, isPro, maxLeagues, upgrade, activationSelection, limitSelect } =
    useMyLeaguesScreen();
  const { colors } = useThemeTokens();

  if (error) return <Error error={error as Error} />;

  const inSelectionMode = !!activationSelection;
  const atLeagueLimit = activeCount === maxLeagues;
  const showCreateJoin = !inSelectionMode && !atLeagueLimit;
  const showProUpsell = !isPro;

  const showActivateButton = (activationSelection?.selectedMemberIds.length ?? 0) > 0;

  return (
    <View className="flex-1 bg-background">
      <MyLeaguesHeader used={activeCount} limit={maxLeagues} />
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <Screen scroll padding="all" className="flex-grow">
          <View className="flex-1 gap-6 pb-24">
            <View className="min-h-[550px]">
              <Leagues isPro={isPro} upgrade={upgrade} activationSelection={activationSelection} />
            </View>
            {showActivateButton && activationSelection && <ActivateLeaguesButton selection={activationSelection} />}
          </View>
          <View className="mt-auto">{showProUpsell && <ProUpsellCard onUpgrade={upgrade} />}</View>
        </Screen>
      )}
      {showCreateJoin ? <LeagueActionButtons /> : null}

      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </View>
  );
}
