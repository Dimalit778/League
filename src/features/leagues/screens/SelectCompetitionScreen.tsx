import { Error, LoadingOverlay } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';

import Screen from '@/components/layout/Screen';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Tables } from '@/types/database.types';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useGetCompetitions } from '../hooks/useCompetition';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const { data: competitions, isLoading, error } = useGetCompetitions();

  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const { colors } = useThemeTokens();

  const handleContinue = () => {
    if (!selectedCompetition) return;
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
    <Screen className="px-2">
      <BackButton title="Select a Competition" textColor="text-primary" />
      <ScrollView className="flex-1 ">
        {competitions?.map((comp) => (
          <TouchableOpacity key={comp.id} onPress={() => setSelectedCompetition(comp)}>
            <View
              className="flex-row items-center mb-3 p-4 rounded-xl border-2 bg-surface "
              style={{
                borderColor: selectedCompetition?.id === comp.id ? colors.primary : colors.border,
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
                <Text className="text-sm font-bold mb-1 text-muted">{comp.area}</Text>
                <Text
                  className="text-xl text-center font-bold"
                  style={{
                    color: selectedCompetition?.id === comp.id ? colors.primary : colors.text,
                  }}
                >
                  {comp.name}
                </Text>
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
        ))}
      </ScrollView>
      <View className="p-3">
        <Button
          title="Continue"
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
