import { Button } from "@/components/ui/ButtonC";
import ImageC from "@/components/ui/ImageC";
import { useLeagueService } from "@/services/leagueService";
import useAuthStore from "@/services/store/AuthStore";
import { TCompetition } from "@/types/database.types";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
  const { user } = useAuthStore();
  const { getCompetitions } = useLeagueService();
  const [leagueName, setLeagueName] = useState("");
  const [competitions, setCompetitions] = useState<TCompetition[]>([]);

  const [selectedCompetition, setSelectedCompetition] =
    useState<TCompetition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCompetitions = async () => {
    const { data, error } = await getCompetitions();
    if (error) {
      console.error(error);
    } else {
      setCompetitions(data || []);
    }
  };

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const goToLeaguePreview = () => {
    router.push({
      pathname: "/(app)/(newLeague)/league-preview",
      params: {
        leagueName: leagueName,
        competition: JSON.stringify(selectedCompetition),
        leagueJoinCode: generateRandomCode(6),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-4 pt-6">
        {/* League Name Input */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            League Name
          </Text>
          <TextInput
            value={leagueName}
            onChangeText={setLeagueName}
            placeholder="Enter your league name"
            className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base"
            maxLength={50}
          />
        </View>
        <View className="mb-6">
          {competitions.map((comp) => (
            <TouchableOpacity
              key={comp.id}
              onPress={() => setSelectedCompetition(comp)}
              className={`mb-3 p-4 rounded-xl border-2 ${
                selectedCompetition?.id === comp.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center gap-4">
                <ImageC
                  source={{ uri: comp.flag }}
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
        <Button
          title="Continue"
          onPress={goToLeaguePreview}
          variant="primary"
          size="large"
          loading={false}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
