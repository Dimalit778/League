import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';
import CompetitionCard from '@/features/leagues/components/createLeague/CompetitionCard';
import { useGetCompetitions } from '@/features/leagues/hooks/useCompetition';
import { useEnsureProAccess } from '@/features/subscription/hooks/useEnsureProAccess';
import { useTranslation } from '@/hooks/useTranslation';
import { Tables } from '@/types/database.types';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const { data: competitions, isLoading, error } = useGetCompetitions();
  const { isPro, openPaywall } = useEnsureProAccess();
  const { t } = useTranslation();
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  const requiresUpgrade = useCallback((comp: Competition) => !comp.is_free && !isPro, [isPro]);

  const handleSelectCompetition = useCallback(
    async (comp: Competition) => {
      if (requiresUpgrade(comp)) {
        const payload = await openPaywall();
        if (!payload) return;
      }
      setSelectedCompetition(comp);
    },
    [requiresUpgrade, openPaywall],
  );

  const handleContinue = async () => {
    if (!selectedCompetition) return;

    if (requiresUpgrade(selectedCompetition)) {
      const payload = await openPaywall();
      if (!payload) return;
    }

    router.navigate({
      pathname: '/(app)/(user)/leagues/create-league/details',
      params: {
        competitionId: selectedCompetition.id,
      },
    });
  };

  const renderItem = useCallback(
    ({ item: comp }: { item: Competition }) => (
      <CompetitionCard
        competition={comp}
        isSelected={selectedCompetition?.id === comp.id}
        isLocked={requiresUpgrade(comp)}
        onPress={handleSelectCompetition}
      />
    ),
    [selectedCompetition, requiresUpgrade, handleSelectCompetition],
  );

  if (error) return <Error error={error} />;

  if (isLoading) return <LoadingOverlay />;

  return (
    <Screen edges={['top', 'bottom']}>
      <BackButton title={t('Select a Competition')} />
      <FlatList
        data={competitions ?? []}
        keyExtractor={(comp) => String(comp.id)}
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 24 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
      <View className="p-3">
        <Button
          title={t('Continue')}
          onPress={handleContinue}
          variant="primary"
          disabled={!selectedCompetition}
          size="lg"
          loading={isLoading}
        />
      </View>
    </Screen>
  );
};

export default SelectCompetitionScreen;
