import PreviewLeagueCard from "@/components/cards/PreviewLeagueCard";
import { Link, useLocalSearchParams } from "expo-router";
import { Alert, Clipboard, Text, TouchableOpacity, View } from "react-native";

// Define the Competition type based on your Supabase tables
import { Tables } from "@/types/database.types";
type Competition = Tables<"competitions">;
type League = Tables<"leagues">;

export default function LeagueCreatedScreen() {
  const { league, nickname } = useLocalSearchParams();

  // Parse the competition object back from the JSON string
  const leagueData: League | null = league
    ? JSON.parse(league as string)
    : null;
  console.log("leagueData", JSON.stringify(leagueData, null, 2));
  console.log("nickname", nickname);
  // Extract necessary details from the competition data
  const competitionName = leagueData?.name || "";

  // Handle copying the join code to clipboard
  const handleCopyJoinCode = () => {
    if (typeof leagueData?.join_code === "string") {
      Clipboard.setString(leagueData?.join_code);
      Alert.alert("Copied!", "Join code copied to clipboard.");
    }
  };

  return (
    <View className="flex-1 bg-white px-6 py-10 justify-between">
      {/* League Preview Card */}
      <PreviewLeagueCard
        leagueName={leagueData?.name as string}
        competitionName={competitionName}
        competitionFlag={competitionFlag}
        competitionLogo={competitionLogo}
        competitionCountry={competitionCountry}
      />

      {/* Nickname and Join Code Section */}
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-semibold text-center mb-4">
          Your League Nickname:{" "}
          <Text className="font-bold text-blue-700">{nickname}</Text>
        </Text>

        <Text className="text-base text-gray-700 mb-2">League Join Code</Text>
        <TouchableOpacity
          onPress={handleCopyJoinCode}
          className="bg-gray-100 px-6 py-3 rounded-lg border border-gray-200"
        >
          <Text className="text-xl font-mono font-bold text-blue-700 tracking-widest">
            {leagueData?.join_code}
          </Text>
        </TouchableOpacity>
        <Text className="text-xs text-gray-400 mt-1">Tap to copy</Text>

        <Text className="text-base font-semibold mt-8 text-center px-4">
          Share this code with your friends to invite them to your league!
        </Text>
      </View>

      {/* Start League Button */}
      <Link href="/(app)/(tabs)" asChild>
        <TouchableOpacity
          className="bg-blue-600 rounded-lg items-center py-4 px-4 w-full"
          activeOpacity={0.8}
        >
          <Text className="text-white text-2xl font-bold tracking-widest">
            Start League
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
