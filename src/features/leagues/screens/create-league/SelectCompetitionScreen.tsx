import { Button, Error, LoadingOverlay, Screen } from '@/components';
import CompetitionCard from '@/features/leagues/components/createLeague/CompetitionCard';
import { useGetCompetitions } from '@/features/leagues/hooks/useCompetition';
import { useEnsureProAccess } from '@/features/subscription/hooks/useEnsureProAccess';
import { useTranslation } from '@/hooks/useTranslation';
import { Tables } from '@/types/database.types';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, View } from 'react-native';
import CompetitionsSkeleton from '../../components/createLeague/CompetitionsSkeletion';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const { data: competitions, isLoading, error } = useGetCompetitions();
  const { isPro, openPaywall } = useEnsureProAccess();
  const { t } = useTranslation();
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const requiresUpgrade = useCallback((comp: Competition) => !comp.is_free && !isPro, [isPro]);

  const handleSelectCompetition = useCallback(
    async (comp: Competition) => {
      if (requiresUpgrade(comp)) {
        setIsPurchasing(true);
        let payload = false;
        try {
          payload = await openPaywall();
        } finally {
          setIsPurchasing(false);
        }
        if (!payload) return;
      }
      setSelectedCompetition(comp);
    },
    [requiresUpgrade, openPaywall],
  );

  const handleContinue = async () => {
    if (!selectedCompetition) return;

    if (requiresUpgrade(selectedCompetition)) {
      setIsPurchasing(true);
      let payload = false;
      try {
        payload = await openPaywall();
      } finally {
        setIsPurchasing(false);
      }
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
      <View className="flex-1">
        <CompetitionCard
          competition={comp}
          isSelected={selectedCompetition?.id === comp.id}
          isLocked={requiresUpgrade(comp)}
          onPress={handleSelectCompetition}
        />
      </View>
    ),
    [selectedCompetition, requiresUpgrade, handleSelectCompetition],
  );

  if (error) return <Error error={error} />;

  if (isLoading) return <CompetitionsSkeleton />;

  return (
    <Screen edges={['bottom']}>
      {isPurchasing && <LoadingOverlay />}

      <FlatList
        data={competitions ?? []}
        keyExtractor={(comp) => String(comp.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 18, gap: 12, paddingBottom: 16 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      <Button
        label={t('Continue')}
        onPress={handleContinue}
        variant="primary"
        disabled={!selectedCompetition}
        size="lg"
        loading={isLoading}
        className="mx-8"
      />
    </Screen>
  );
};

export default SelectCompetitionScreen;
