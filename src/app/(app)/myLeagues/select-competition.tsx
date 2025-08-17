import { Loading } from "@/components/layout";
import { Button, Image } from "@/components/ui";
import { useColorScheme } from "@/hooks/useColorSchema";
import { useLeagueService } from "@/services/leagueService";
import { Tables } from "@/types/database.types";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Competition = Tables<"competitions">;

export default function SelectCompetitionScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);

  const { getCompetitions } = useLeagueService();

  const {
    data: competitions,
    isLoading,
    error,
  } = useQuery<Competition[]>({
    queryKey: ["competitions"],
    queryFn: () => getCompetitions(),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const validateSelection = (): boolean => {
    if (!selectedCompetition) {
      Alert.alert("Error", "Please select a competition to continue.");
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateSelection()) return;
    const competitionId = selectedCompetition?.id;
    const leagueLogo = selectedCompetition?.logo;

    router.push({
      pathname: "/(app)/myLeagues/league-details",
      params: {
        competitionId: competitionId,
        leagueLogo: leagueLogo,
      },
    });
  };

  if (isLoading) return <Loading />;

  if (error) {
    console.error(
      "SelectCompetitionScreen error: ",
      JSON.stringify(error, null, 2)
    );
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-black">
        <Text className="text-red-500 text-lg">
          Failed to load competitions.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDarkColorScheme ? "bg-black" : "bg-white"}`}
      behavior="padding"
    >
      <ScrollView className="flex-1 px-4 pt-6">
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
                  ? "border-blue-500 bg-yellow-100"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <Image
                  source={{
                    uri:
                      comp.flag ||
                      "https://placehold.co/48x48/cccccc/000000?text=NoFlag",
                  }}
                  className="border border-gray-200 rounded-full"
                  resizeMode="contain"
                  width={48}
                  height={48}
                />
                <View className="flex-1 items-center">
                  <Text className="text-sm font-bold text-gray-600">
                    {comp.country}
                  </Text>

                  <Text className="text-lg text-center font-bold text-gray-900">
                    {comp.name}
                  </Text>
                </View>

                <Image
                  source={{
                    uri:
                      comp.logo ||
                      "https://placehold.co/52x52/cccccc/000000?text=NoLogo",
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
          size="lg"
          loading={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
