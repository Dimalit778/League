import { Loading } from "@/components/Loading";
import { ButtonC, ImageC, TextC } from "@/components/ui";
import { useColorScheme } from "@/hooks/useColorSchema";

import { useCompetitions } from "@/hooks/useQueries";
import { Competition } from "@/types/supabase.types";
import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const generateRandomCode = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default function CreateLeague() {
  const { isDarkColorScheme } = useColorScheme();
  const [leagueName, setLeagueName] = useState("");
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);

  const { data: competitions, isLoading, error } = useCompetitions();

  if (isLoading) return <Loading />;

  if (error) {
    console.log("error  ", error);
  }

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDarkColorScheme ? "bg-black" : "bg-white"}`}
    >
      <ScrollView className="flex-1 px-4 pt-6">
        <TextC className="text-lg font-semibold mb-2">League Name</TextC>
        <TextInput
          value={leagueName}
          onChangeText={setLeagueName}
          placeholder="Enter your league name"
          className="bg-gray-700 rounded-lg px-4 py-3 text-base text-white"
          maxLength={50}
          autoCorrect={false}
        />

        <View className="mb-6 mt-6">
          {competitions?.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              onPress={() => setSelectedCompetition(comp)}
              className={`mb-3 p-4 rounded-xl border-2 ${
                selectedCompetition?.id === comp.id
                  ? "border-blue-500 bg-yellow-500"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <ImageC
                  source={{ uri: comp.flag || "" }}
                  className="border border-gray-200 "
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

                <ImageC
                  source={{ uri: comp.logo }}
                  resizeMode="contain"
                  width={52}
                  height={52}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Create Button */}
        <ButtonC
          title="Continue"
          onPress={() => {
            router.push({
              pathname: "/(app)/(newLeague)/league-preview",
              params: {
                leagueName: leagueName,
                competition: JSON.stringify(selectedCompetition),
                leagueJoinCode: generateRandomCode(6),
              },
            });
          }}
          variant="primary"
          size="lg"
          loading={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
