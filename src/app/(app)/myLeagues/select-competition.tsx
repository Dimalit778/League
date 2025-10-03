import { LoadingOverlay } from '@/components/layout';
import { BackButton, Button, MyImage } from '@/components/ui';

import { useGetCompetitions } from '@/hooks/useCompetitions';
import { Tables } from '@/types/database.types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Competition = Tables<'competitions'>;

const SelectCompetitionScreen = () => {
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);

  const { data: competitions, isLoading, error } = useGetCompetitions();

  const validateSelection = (): boolean => {
    if (!selectedCompetition) {
      Alert.alert('Error', 'Please select a competition to continue.');
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateSelection()) return;
    const competitionId = selectedCompetition?.id;
    const leagueLogo = selectedCompetition?.logo;

    router.push({
      pathname: '/(app)/myLeagues/create-league',
      params: {
        competitionId: competitionId,
        leagueLogo: leagueLogo,
      },
    });
  };

  if (error) console.log(error);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <BackButton />
      {isLoading && <LoadingOverlay />}
      <ScrollView className="flex-1 px-3">
        <Text className="text-2xl font-bold mb-6 text-center text-text  ">
          Select a Competition
        </Text>

        <View className="mb-6">
          {competitions?.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              onPress={() => setSelectedCompetition(comp)}
              className={`mb-3 p-4 rounded-xl border-2 ${
                selectedCompetition?.id === comp.id
                  ? 'border-primary '
                  : 'border-border bg-surface'
              }`}
            >
              <View className="flex-row items-center gap-4">
                <MyImage source={{ uri: comp.flag }} width={48} height={48} />
                <View className="flex-1 items-center">
                  <Text className="text-sm font-bold mb-1 text-muted">
                    {comp.country}
                  </Text>

                  <Text className="text-xl text-center font-bold text-text">
                    {comp.name}
                  </Text>
                </View>

                <MyImage
                  source={{ uri: comp.logo }}
                  width={52}
                  height={52}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          disabled={!selectedCompetition}
          size="lg"
          loading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SelectCompetitionScreen;
