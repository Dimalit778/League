import { Button, Error, Row, Screen } from '@/components';
import { LimitSelectModal, MyLeaguesHeader, ProUpsellCard } from '@/features/leagues/components/myLeagues';
import { useMyLeaguesScreen } from '@/features/leagues/hooks/useMyLeaguesScreen';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { Plus, UserPlus } from 'lucide-react-native';
import { View } from 'react-native';
import { Leagues } from '../components/myLeagues/Leagues';
import LeaguesSkeleton from '../components/myLeagues/LeaguesSkeleton';

type ActivationSelection = NonNullable<ReturnType<typeof useMyLeaguesScreen>['activationSelection']>;

function CreateJoinButtons() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <Row className="gap-3">
      <Button
        variant="glass"
        size="md"
        className="flex-1"
        label={t('Create League')}
        leftIcon={<Plus size={18} color={colors.text} strokeWidth={2.5} />}
        onPress={() => router.push('/leagues/create-league/competitions')}
      />
      <Button
        variant="glass"
        size="md"
        className="flex-1"
        label={t('Join League')}
        leftIcon={<UserPlus size={18} color={colors.text} strokeWidth={2} />}
        onPress={() => router.push('/leagues/join-league')}
      />
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
  const showProUpsell = !isPro && !inSelectionMode;
  const showActivateButton = (activationSelection?.selectedMemberIds.length ?? 0) > 0;

  return (
    <View className="flex-1 bg-background">
      <MyLeaguesHeader used={activeCount} limit={maxLeagues} />

      <Screen scroll padding="all" className="flex-grow">
        <View className="flex-1 gap-6 ">
          {showCreateJoin && <CreateJoinButtons />}
          <View className=" min-h-[550px]">
            <Leagues isPro={isPro} upgrade={upgrade} activationSelection={activationSelection} />
          </View>
          {showActivateButton && activationSelection && <ActivateLeaguesButton selection={activationSelection} />}
        </View>
        <View className="mt-auto">{showProUpsell && <ProUpsellCard onUpgrade={upgrade} />}</View>
      </Screen>

      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </View>
  );
}
