import ButtonC from "@/components/ui/ButtonC";
import { LEAGUE_OPTIONS } from "@/constants/leagues";
import { useAuthStore } from "@/hooks/useAuthStore";
import { supabase } from "@/lib/supabase";
import { FootballLeague } from "@/types/database.types";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateLeague() {
  const { user } = useAuthStore();

  const [leagueName, setLeagueName] = useState("");
  const [selectedLeague, setSelectedLeague] = useState<FootballLeague | null>(
    null
  );
  const [maxMembers, setMaxMembers] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const newCompetition = {
    api_id: "123",
    name: "dima",
    code: "PD",
    type: "league",
    emblem_url:
      "https://upload.wikimedia.org/wikipedia/en/thumb/5/53/La_Liga_logo_%282017%29.svg/1200px-La_Liga_logo_%282017%29.svg.png",
    start_date: "2025-01-01",
    end_date: "2025-01-01",
    current_matchday: 3,
  };

  const handleCreateLeague = async () => {
    const { data, error } = await supabase
      .from("competitions")
      .insert(newCompetition)
      .select()
      .single();
    console.log("data ---", JSON.stringify(data, null, 2));
    console.log("error ---", JSON.stringify(error, null, 2));
  };
  const getCompetitions = async () => {
    const { data, error } = await supabase
      .from("competitions")
      .select("*")
      .limit(10);
    console.log("data ---", JSON.stringify(data, null, 2));
    console.log("error ---", JSON.stringify(error, null, 2));
  };

  const selectedLeagueOption = LEAGUE_OPTIONS.find(
    (option) => option.id === selectedLeague
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create New League
        </Text>

        {/* Error message */}
        {error && (
          <View className="mb-4 p-3 bg-red-100 rounded-lg">
            <Text className="text-red-700">{error}</Text>
          </View>
        )}

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

        {/* League Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-4">
            Select Football League
          </Text>

          {LEAGUE_OPTIONS.map((league) => (
            <TouchableOpacity
              key={league.id}
              onPress={() => setSelectedLeague(league.id)}
              className={`mb-3 p-4 rounded-xl border-2 ${
                selectedLeague === league.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <View className="flex-row items-center">
                {/* Flag */}
                <Image
                  source={league.flag}
                  className="w-12 h-8 rounded mr-4"
                  resizeMode="cover"
                />

                {/* League Logo */}
                <Image
                  source={league.logo}
                  className="w-12 h-12 rounded-lg mr-4"
                  resizeMode="cover"
                />

                {/* League Info */}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    {league.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {league.country}
                  </Text>
                </View>

                {/* Selection Indicator */}
                {selectedLeague === league.id && (
                  <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-bold">✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected League Preview */}
        {selectedLeagueOption && (
          <View className="mb-6 p-4 bg-gray-50 rounded-xl">
            <Text className="text-sm text-gray-600 mb-2">Selected League:</Text>
            <View className="flex-row items-center">
              <Image
                source={selectedLeagueOption.flag}
                className="w-8 h-6 rounded mr-3"
                resizeMode="cover"
              />
              <Text className="text-lg font-semibold text-gray-900">
                {selectedLeagueOption.name}
              </Text>
            </View>
          </View>
        )}

        {/* Create Button */}
        <View className="mb-8">
          <ButtonC
            title="Create League"
            onPress={handleCreateLeague}
            loading={loading}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
