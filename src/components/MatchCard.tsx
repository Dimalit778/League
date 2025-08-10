import { FixtureWithTeams } from "@/types/fixturesTypes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export type MatchStatus = "Not Started" | "In Play" | "Finished";

interface MatchCardProps {
  match: FixtureWithTeams;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  // Extract team names for clarity and potential fallback
  const homeTeamName = match.home_team.name;
  const awayTeamName = match.away_team?.name;

  const homeCrestUrl = match.home_team.logo;
  const awayCrestUrl = match.away_team.logo;
  const router = useRouter();
  const handlePress = (id: number) => {
    console.log("id", id);
    router.push({
      pathname: "/(app)/match/[id]",
      params: { id },
    });
  };
  return (
    <TouchableOpacity
      className="bg-surface p-2 rounded-lg mb-4 shadow-md border border-border"
      activeOpacity={0.85}
      onPress={() => handlePress(match.id)}
    >
      <View className="flex-row items-center justify-between ">
        {/* Home Team */}
        <View className="flex-1 flex-row items-center justify-start pr-2">
          <Image
            source={{ uri: homeCrestUrl }}
            className="w-8 h-8 rounded-full mr-2"
            resizeMode="contain"
          />
          <Text className="text-sm font-medium text-text flex-shrink">
            {homeTeamName}
          </Text>
        </View>

        {/* Score/Time Section */}
        <View className="flex-none items-center justify-center mx-2 relative">
          {/* <StatusIndicator match={match} /> Uncomment if needed and ensure TMatch is properly typed */}
          <View className="bg-border rounded-md px-3 py-2 min-w-[60px] items-center justify-center">
            {match.status_long === "Not Started" ? (
              <View className="items-center gap-1">
                <Ionicons
                  name="time-outline"
                  size={14}
                  color="#888"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-xs font-medium text-textMuted">
                  {new Date(match.date).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center justify-center">
                {/* Ensure no raw text or unnecessary whitespace between these Text components */}
                <Text className="text-lg font-bold text-text">
                  {match.goals_home ?? 0}
                </Text>
                <Text className="text-lg font-bold text-text mx-1">-</Text>
                <Text className="text-lg font-bold text-text">
                  {match.goals_away ?? 0}
                </Text>
              </View>
            )}
            {match.status_long === "In Play" && (
              <Text className="text-sm text-secondary font-semibold">LIVE</Text>
            )}
            {match.status_long === "Finished" && (
              <Text className="text-sm text-textMuted">FT</Text>
            )}
          </View>
        </View>

        {/* Away Team */}
        <View className="flex-1 flex-row items-center justify-end">
          <Text className="text-sm font-medium text-text flex-shrink ">
            {awayTeamName}
          </Text>
          <Image
            source={{ uri: awayCrestUrl }}
            className="w-8 h-8 rounded-full ml-2"
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
