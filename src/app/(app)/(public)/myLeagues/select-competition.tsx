import { Error, LoadingOverlay } from '@/components/layout';
import { BackButton, Button } from '@/components/ui';

import { useThemeTokens } from '@/hooks/useThemeTokens';
import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { competitionService } from '@/services/competitionService';
import { Tables } from '@/types/database.types';
import { useQuery } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const {
    data: competitions,
    isLoading,
    error,
  } = useQuery({
    queryKey: QUERY_KEYS.competitions.all,
    queryFn: () => competitionService.getCompetitions(),

    staleTime: 10 * 60 * 60 * 1000,
    retry: 2,
  });
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const { colors } = useThemeTokens();

  const handleContinue = () => {
    if (!selectedCompetition) {
      Alert.alert('Error', 'Please select a competition to continue.');
      return;
    }
    const competitionId = selectedCompetition?.id;
    const leagueLogo = selectedCompetition?.logo;

    router.push({
      pathname: '/(app)/(public)/myLeagues/create-league',
      params: {
        competitionId: competitionId,
        leagueLogo: leagueLogo,
      },
    });
  };

  if (error) return <Error error={error} />;

  if (isLoading) return <LoadingOverlay />;
  return (
    <SafeAreaView className="flex-1 bg-background ">
      <BackButton title="Select a Competition" />
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
    </SafeAreaView>
  );
};

export default SelectCompetitionScreen;
