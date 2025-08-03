import PreviewLeagueCard from "@/components/cards/PreviewLeagueCard";
import { useLeagueService } from "@/services/leagueService";
import { TCompetition } from "@/types/database.types";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LeaguePreview() {
  const { createLeague } = useLeagueService();
  const { leagueName, leagueJoinCode, competition } = useLocalSearchParams();
  const [isCreating, setIsCreating] = useState(false);

  const competitionData: TCompetition =
    typeof competition === "string" ? JSON.parse(competition) : null;

  const {
    name: compName = "",
    logo = "",
    flag = "",
    country = "",
    type = "",
    round = "",
  } = competitionData || {};

  const handleCreateLeague = async () => {
    if (isCreating) return;

    setIsCreating(true);

    try {
      const newLeague = {
        name: leagueName as string,
        join_code: leagueJoinCode as string,
        competition_id: competitionData.id as unknown as number,
      };

      const { data, error } = await createLeague(newLeague);

      if (error) {
        console.error("Error creating league:", error);

        // Handle specific constraint error
        if (
          error.message === "23505" &&
          error.message.includes("idx_user_primary_league")
        ) {
          Alert.alert(
            "Primary League Conflict",
            "There was an issue setting this as your primary league. The league was created but please set it as primary manually.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Error", "Failed to create league. Please try again.", [
            { text: "OK" },
          ]);
        }
      } else {
        console.log("League created successfully:", data);
        Alert.alert("Success!", "League created successfully! 🎉", [
          {
            text: "OK",
            onPress: () => {
              router.push("/(app)/(tabs)");
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.", [
        { text: "OK" },
      ]);
    } finally {
      setIsCreating(false);
    }
  };

  // Handler to copy join code
  const handleCopyJoinCode = () => {
    if (typeof leagueJoinCode === "string") {
      Clipboard.setString(leagueJoinCode);
      Alert.alert("Copied", "Join code copied to clipboard!");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-10">
      <PreviewLeagueCard
        leagueName={leagueName as string}
        competitionName={compName}
        competitionFlag={flag}
        competitionLogo={logo}
        competitionCountry={country}
      />

      {/* Join Code */}
      <View className="items-center mb-8">
        <Text className="text-base text-gray-700 mb-2">League Join Code</Text>
        <TouchableOpacity
          onPress={handleCopyJoinCode}
          className="bg-gray-100 px-6 py-3 rounded-lg border border-gray-200"
          disabled={isCreating} // Disable during creation
        >
          <Text className="text-xl font-mono font-bold text-blue-700 tracking-widest">
            {leagueJoinCode}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400 mt-1">Tap to copy</Text>
      </View>

      {/* Create League Button */}
      <TouchableOpacity
        onPress={handleCreateLeague}
        className={`py-4 rounded-xl items-center ${
          isCreating
            ? "bg-blue-400" // Lighter color when loading
            : "bg-blue-600"
        }`}
        activeOpacity={0.85}
        disabled={isCreating} // Disable when loading
      >
        {isCreating ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="white" className="mr-2" />
            <Text className="text-lg font-bold text-white">
              Creating League...
            </Text>
          </View>
        ) : (
          <Text className="text-lg font-bold text-white">Create League</Text>
        )}
      </TouchableOpacity>

      {/* Optional: Loading overlay for entire screen */}
      {isCreating && (
        <View className="absolute inset-0 bg-black/20 justify-center items-center">
          <View className="bg-white p-6 rounded-xl items-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-700 mt-3 font-medium">
              Creating your league...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
