import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';

import { CText } from '@/components/ui';
import { UpgradeSubscriptionOverlay } from '@/features/subscription/components/UpgradeSubscriptionOverlay';
import { usePurchaseAndSyncSubscription, useSubscription } from '@/features/subscription/hooks/useSubscription';
import { isPaidPlan } from '@/features/subscription/utils/getSubscriptionLimits';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Tables } from '@/types/database.types';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useGetCompetitions } from '../hooks/useCompetition';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const { data: competitions, isLoading, error } = useGetCompetitions();
  const { mutateAsync: openPaywall } = usePurchaseAndSyncSubscription();
  const { data: subscription } = useSubscription();
  const { t } = useTranslation();
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const { colors } = useThemeTokens();

  const hasPaidSubscription = isPaidPlan(subscription?.type);

  const requiresUpgrade = (comp: Competition) => !comp.is_free && !hasPaidSubscription;

  const handleSelectCompetition = async (comp: Competition) => {
    if (requiresUpgrade(comp)) {
      const payload = await openPaywall();
      if (!payload) return;
    }

    setSelectedCompetition(comp);
  };

  const handleContinue = async () => {
    if (!selectedCompetition) return;

    if (requiresUpgrade(selectedCompetition)) {
      const payload = await openPaywall();
      if (!payload) return;
    }

    router.push({
      pathname: '/(app)/(public)/myLeagues/create-league',
      params: {
        competitionId: selectedCompetition.id,
      },
    });
  };

  if (error) return <Error error={error} />;

  if (isLoading) return <LoadingOverlay />;

  return (
    <Screen withSafeArea>
      <BackButton title={t('Select a Competition')} />
      <ScrollView className="flex-" contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 24 }}>
        {(competitions ?? []).map((comp) => {
          const isSelected = selectedCompetition?.id === comp.id;
          const isLocked = requiresUpgrade(comp);

          return (
            <TouchableOpacity
              key={comp.id}
              onPress={() => handleSelectCompetition(comp)}
              activeOpacity={0.85}
              className="mb-3"
            >
              <View className="relative overflow-hidden rounded-xl">
                <View
                  className="flex-row items-center p-4 border-2 bg-surface rounded-xl"
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
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
                      style={{
                        color: isSelected ? colors.primary : colors.text,
                      }}
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

                <UpgradeSubscriptionOverlay visible={isLocked} />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
