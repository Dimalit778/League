import { TMatch } from "@/types/database.types";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";

interface MatchCardProps {
  match: any; // Consider using TMatch here if your match data aligns
  onPress?: (match: any) => void;
}

// StatusIndicator is currently not used in your MatchCard, but keeping its definition
// for future use. Ensure TMatch has full_time_home_score and full_time_away_score
// if you uncomment this.
const StatusIndicator = ({ match }: { match: TMatch }) => {
  if (match.status === "SCHEDULED") {
    return (
      <View className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <View className="w-4 h-4 rounded-full border-2 border-upcoming-gray bg-transparent" />
      </View>
    );
  }

  if (match.status === "LIVE") {
    return (
      <View className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <View className="w-4 h-4 rounded-full bg-live-green animate-pulse" />
      </View>
    );
  }

  // Ensure full_time_home_score and full_time_away_score exist and are numbers for FINISHED status
  if (
    match.status === "FINISHED" &&
    match.full_time_home_score !== undefined &&
    match.full_time_away_score !== undefined
  ) {
    return (
      <View className="absolute -top-2 left-1/2 transform -translate-x-1/2">
        <View className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
          <Text className="text-white">
            {match.full_time_home_score} - {match.full_time_away_score}
          </Text>
        </View>
      </View>
    );
  }

  return null;
};

export const MatchCard = ({ match, onPress }: MatchCardProps) => {
  // Extract team names for clarity and potential fallback
  const homeTeamName = match.home_team?.name || "Unknown Home";
  const homeTeamShortName = match.home_team?.short_name || homeTeamName;
  const awayTeamName = match.away_team?.name || "Unknown Away";
  const awayTeamShortName = match.away_team?.short_name || awayTeamName; // Assuming away_team might also have short_name

  // Fallback for crest_url
  const homeCrestUrl =
    match.home_team?.crest_url ||
    "https://placehold.co/32x32/cccccc/000000?text=NA";
  const awayCrestUrl =
    match.away_team?.crest_url ||
    "https://placehold.co/32x32/cccccc/000000?text=NA";

  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-lg mb-4 shadow-md" // Added shadow for better visual separation
      activeOpacity={0.85}
      onPress={() => onPress && onPress(match)}
    >
      {/* Main row for Home Team, Score/Time, Away Team */}
      <View className="flex-row items-center justify-between border-b border-gray-200 pb-4">
        {/* Home Team */}
        <View className="flex-1 flex-row items-center justify-start pr-2">
          <Image
            source={{ uri: homeCrestUrl }}
            className="w-8 h-8 rounded-full mr-2"
            resizeMode="contain"
          />
          <Text className="text-sm font-medium text-gray-800 flex-shrink">
            {homeTeamShortName}
          </Text>
        </View>

        {/* Score/Time Section */}
        <View className="flex-none items-center justify-center mx-2 relative">
          {/* <StatusIndicator match={match} /> Uncomment if needed and ensure TMatch is properly typed */}
          <View className="bg-gray-100 rounded-md px-3 py-2 min-w-[80px] items-center justify-center">
            {match.status === "SCHEDULED" ? (
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#888"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-xs font-medium text-gray-500">
                  {new Date(match.utc_date).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                {/* Ensure no raw text or unnecessary whitespace between these Text components */}
                <Text className="text-lg font-bold text-gray-900">
                  {match.full_time_home_score ?? 0}
                </Text>
                <Text className="text-lg font-bold text-gray-900 mx-1">-</Text>
                <Text className="text-lg font-bold text-gray-900">
                  {match.full_time_away_score ?? 0}
                </Text>
              </View>
            )}
            {match.status === "LIVE" && (
              <Text className="text-sm text-green-600 font-semibold">LIVE</Text>
            )}
            {match.status === "FINISHED" && (
              <Text className="text-sm text-gray-600">FT</Text>
            )}
          </View>
        </View>

        {/* Away Team */}
        <View className="flex-1 flex-row items-center justify-end pl-2">
          <Text className="text-sm font-medium text-gray-800 flex-shrink">
            {awayTeamShortName}
          </Text>
          <Image
            source={{ uri: awayCrestUrl }}
            className="w-8 h-8 rounded-full ml-2"
            resizeMode="contain"
          />
        </View>
      </View>
      {/* You can add more details about the match below this section if needed */}
    </TouchableOpacity>
  );
};
