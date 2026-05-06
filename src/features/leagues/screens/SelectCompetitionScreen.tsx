import { Error, LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';

import { CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Tables } from '@/types/database.types';
import { WORLD_CUP_COMPETITION, WORLD_CUP_COMPETITION_ID } from '@/features/world-cup/mock/competition';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useGetCompetitions } from '../hooks/useCompetition';

type Competition = Tables<'competitions'>;
type CompetitionListItem = Pick<Competition, 'id' | 'name' | 'area' | 'flag' | 'logo'>;

const SelectCompetitionScreen = () => {
  const { data: competitions, isLoading, error } = useGetCompetitions();
  const { t } = useTranslation();
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const { colors } = useThemeTokens();

  const handleContinue = () => {
    if (!selectedCompetition) return;
    if (selectedCompetition.id === WORLD_CUP_COMPETITION_ID) {
      router.push('/(app)/(public)/myLeagues/world-cup-preview' as never);
      return;
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

  const items: CompetitionListItem[] = [...(competitions ?? []), WORLD_CUP_COMPETITION];

  return (
    <Screen withSafeArea>
      <BackButton title={t('Select a Competition')} />
      <ScrollView className="flex-" contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 24 }}>
        {items.map((comp) => {
          const isWorldCup = comp.id === WORLD_CUP_COMPETITION_ID;
          const isSelected = selectedCompetition?.id === comp.id;
          return (
            <TouchableOpacity key={comp.id} onPress={() => setSelectedCompetition(comp as Competition)}>
              <View
                className="flex-row items-center mb-3 p-4 rounded-xl border-2 bg-surface "
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
                  {isWorldCup && (
                    <View className="mt-1 px-2 py-0.5 rounded bg-primary/20">
                      <CText variant="small" className="text-primary">
                        {t('Preview')}
                      </CText>
                    </View>
                  )}
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
