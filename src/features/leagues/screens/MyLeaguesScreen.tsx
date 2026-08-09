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

const CreateJoinButtons = () => {
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
};

export default function MyLeaguesScreen() {
  const { t } = useTranslation();

  const { isLoading, error, activeCount, isPro, maxLeagues, upgrade, activationSelection, limitSelect } =
    useMyLeaguesScreen();

  if (isLoading) return <LeaguesSkeleton />;
  if (error) return <Error error={error as Error} />;

  const maxLeague = isPro && activeCount === maxLeagues;
  const inSelection = !!activationSelection;

  return (
    <View className="flex-1 bg-background">
      <MyLeaguesHeader used={activeCount} limit={maxLeagues} />

      <Screen scroll padding="all" className="flex-1" contentClassName="gap-6">
        {inSelection ? null : maxLeague ? null : <CreateJoinButtons />}

        <Leagues isPro={isPro} upgrade={upgrade} activationSelection={activationSelection} />

        {activationSelection?.selectedMemberIds.length ? (
          <Button
            label={t(activationSelection.availableSlots === 1 ? 'Activate league' : 'Activate leagues')}
            onPress={activationSelection.onSave}
            loading={activationSelection.isSaving}
            disabled={!activationSelection.canSave}
          />
        ) : null}

        {!isPro && !inSelection ? <ProUpsellCard onUpgrade={upgrade} /> : null}
      </Screen>

      {limitSelect && <LimitSelectModal {...limitSelect} />}
    </View>
  );
}
