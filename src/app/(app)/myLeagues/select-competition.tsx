import { LoadingOverlay, Screen } from '@/components/layout';
import { BackButton, Button, Image } from '@/components/ui';
import { useGetCompetitions } from '@/hooks/useCompetitions';
import { Tables } from '@/types/database.types';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Competition = Tables<'competitions'>;

export default function SelectCompetitionScreen() {
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
      pathname: '/(app)/myLeagues/league-details',
      params: {
        competitionId: competitionId,
        leagueLogo: leagueLogo,
      },
    });
  };

  if (error) console.log(error);

  return (
    <Screen>
      <BackButton />
      <KeyboardAvoidingView className="flex-1 bg-background" behavior="padding">
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
                    ? 'bg-secondary'
                    : 'border-border bg-surface'
                }`}
              >
                <View className="flex-row items-center gap-4">
                  <Image
                    source={{
                      uri:
                        comp.flag ||
                        'https://placehold.co/48x48/cccccc/000000?text=NoFlag',
                    }}
                    className="border border-border rounded-full"
                    resizeMode="contain"
                    width={48}
                    height={48}
                  />
                  <View className="flex-1 items-center">
                    <Text
                      className={`text-sm font-bold mb-1 ${
                        selectedCompetition?.id === comp.id
                          ? 'text-background'
                          : 'text-textMuted'
                      }`}
                    >
                      {comp.country}
                    </Text>

                    <Text
                      className={`text-xl text-center font-bold ${
                        selectedCompetition?.id === comp.id
                          ? 'text-background'
                          : 'text-textMuted'
                      }`}
                    >
                      {comp.name}
                    </Text>
                  </View>

                  <Image
                    source={{
                      uri:
                        comp.logo ||
                        'https://placehold.co/52x52/cccccc/000000?text=NoLogo',
                    }}
                    resizeMode="contain"
                    width={52}
                    height={52}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <Button
            title="Continue"
            onPress={handleContinue}
            variant="primary"
            disabled={!selectedCompetition}
            size="lg"
            loading={isLoading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
