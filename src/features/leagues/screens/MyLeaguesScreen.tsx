import { Button, Error, Row, Screen } from '@/components';
import { LimitSelectModal, MyLeaguesHeader, ProUpsellCard } from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Plus, UserPlus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Leagues } from '../components/myLeagues/Leagues';
import LeaguesSkeleton from '../components/myLeagues/LeaguesSkeleton';

type ActivationSelection = NonNullable<ReturnType<typeof useMyLeaguesScreen>['activationSelection']>;

const ACTION_BUTTON_SIZE = 72;

function LeagueActionButtons() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const insets = useSafeAreaInsets();

  return (
    <Row
      pointerEvents="box-none"
      className="absolute inset-x-0 justify-between px-5"
      style={{ bottom: Math.max(insets.bottom, 12) + 8 }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Join League')}
        onPress={() => router.push('/leagues/join-league')}
        className="items-center justify-center rounded-full border border-border bg-subtle active:opacity-80"
        style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}
      >
        <UserPlus size={32} color={colors.text} strokeWidth={2} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Create League')}
        onPress={() => router.push('/leagues/create-league/competitions')}
        className="items-center justify-center rounded-full border border-border bg-subtle active:opacity-80"
        style={{ width: ACTION_BUTTON_SIZE, height: ACTION_BUTTON_SIZE }}
      >
        <Plus size={26} color={colors.text} strokeWidth={2.5} />
      </Pressable>
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

  if (isLoading) return <LeaguesSkeleton />;
  if (error) return <Error error={error as Error} />;

  const inSelectionMode = !!activationSelection;
  const atLeagueLimit = activeCount === maxLeagues;
  const showCreateJoin = !inSelectionMode && !atLeagueLimit;
  const showProUpsell = !isPro;

  const showActivateButton = (activationSelection?.selectedMemberIds.length ?? 0) > 0;

  return (
    <View className="flex-1 bg-background">
      <MyLeaguesHeader used={activeCount} limit={maxLeagues} />

      <Screen scroll padding="horizontal" className="flex-grow">
        <View className="flex-1 gap-6 pb-24">
          <View className="min-h-[550px]">
            <Leagues isPro={isPro} upgrade={upgrade} activationSelection={activationSelection} />
          </View>
          {showActivateButton && activationSelection && <ActivateLeaguesButton selection={activationSelection} />}
        </View>
        <View className="mt-auto">{showProUpsell && <ProUpsellCard onUpgrade={upgrade} />}</View>
      </Screen>

      {showCreateJoin ? <LeagueActionButtons /> : null}

      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </View>
  );
}
