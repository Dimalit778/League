import PreviewLeagueCard from "@/components/cards/PreviewLeagueCard";

import { useCreateLeague } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const {
    leagueName,
    leagueJoinCode,
    competition: competitionParam,
  } = useLocalSearchParams();
  const competition =
    typeof competitionParam === "string" ? JSON.parse(competitionParam) : null;

  const compName = competition?.name || "";
  const flag = competition?.flag || "";
  const logo = competition?.logo || "";
  const country = competition?.country || "";
  const [isCreating, setIsCreating] = useState(false);

  const createLeagueMutation = useCreateLeague();

  const handleCreateLeague = () => {
    if (isCreating) return;
    setIsCreating(true);

    const newLeague = {
      name: leagueName as string,
      join_code: leagueJoinCode as string,
      competition_id: competition?.id,
    };

    createLeagueMutation.mutate(newLeague, {
      onSuccess: (data) => {
        console.log(
          "League created successfully",
          JSON.stringify(data, null, 2)
        );

        router.replace("/(app)/(tabs)");
      },
      onError: (error) => {
        console.error("Error creating league:", error);
        setIsCreating(false);
      },
      onSettled: () => {
        setIsCreating(false);
      },
    });
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
