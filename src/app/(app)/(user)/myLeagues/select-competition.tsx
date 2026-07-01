import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, UpgardeBadge } from '@/components/ui';

import { CText } from '@/components/ui';
import { useGetCompetitions } from '@/features/leagues/hooks/useCompetition';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { usePaywall, useRevenueCatSubscription } from '@/lib/revenuecat/purchases';
import { Tables } from '@/types/database.types';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, View } from 'react-native';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const { data: competitions, isLoading, error } = useGetCompetitions();
  const openPaywall = usePaywall();
  const { subscription } = useRevenueCatSubscription();
  const { t } = useTranslation();
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const { colors } = useThemeTokens();

  const isPro = !!subscription.isActive;

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
      pathname: '/(app)/(user)/myLeagues/create-league',
      params: {
        competitionId: selectedCompetition.id,
      },
    });
  };

  const renderItem = useCallback(
    ({ item: comp }: { item: Competition }) => {
      const isSelected = selectedCompetition?.id === comp.id;
      const isLocked = requiresUpgrade(comp);
      return (
        <Pressable
          onPress={() => handleSelectCompetition(comp)}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
          className="mb-3"
        >
          <View className="relative overflow-hidden rounded-xl">
            <View
              className="flex-row items-center p-4 border-2 bg-surface rounded-xl"
              style={{ borderColor: isSelected ? colors.primary : colors.border }}
            >
              <ExpoImage
                source={comp.flag}
                style={{ width: 48, height: 48 }}
                cachePolicy="memory-disk"
                contentFit="contain"
                transition={120}
                priority="high"
              />
              <View className="flex-1 items-center">
                <CText variant="caption" className="text-muted">
                  {t(comp.area)}
                </CText>
                <CText
                  variant="body"
                  bold
                  className="text-center"
                  style={{ color: isSelected ? colors.primary : colors.text }}
                >
                  {t(comp.name)}
                </CText>
              </View>
              <ExpoImage
                source={comp.logo}
                style={{ width: 52, height: 52 }}
                cachePolicy="memory-disk"
                contentFit="contain"
                transition={120}
                priority="high"
              />
            </View>
            <UpgardeBadge visible={isLocked} />
          </View>
        </Pressable>
      );
    },
    [selectedCompetition, requiresUpgrade, handleSelectCompetition, colors, t],
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
