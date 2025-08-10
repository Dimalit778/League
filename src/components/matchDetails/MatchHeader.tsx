import {
  formatDate,
  formatTime,
  getMatchStatusColor,
} from "@/utils/match-utils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Text, View } from "react-native";

export const MatchHeader = ({
  match,
  theme,
  isNotStarted,
  isLive,
  isFinished,
}: {
  match: any;
  theme: string;
  isNotStarted: boolean;
  isLive: boolean;
  isFinished: boolean;
}) => {
  return (
    <View className="mx-4 mt-4">
      <LinearGradient
        colors={
          theme === "dark" ? ["#1E293 B", "#334155"] : ["#FFFFFF", "#F8FAFC"]
        }
        className="rounded-2xl overflow-hidden shadow-lg"
      >
        {/* Match Header Info */}
        <View className="p-4 border-b border-border/20">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text className="text-textMuted ml-1 text-sm font-medium">
                  {formatDate(match.date)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text className="text-textMuted ml-1 text-sm font-medium">
                  {formatTime(match.date)}
                </Text>
              </View>
            </View>

            <LinearGradient
              colors={getMatchStatusColor(match.status_long || "") as any}
              className="px-3 py-1 rounded-full"
            >
              <Text className="text-white text-xs font-bold">
                {isLive ? "● LIVE" : isFinished ? "FULL TIME" : "UPCOMING"}
              </Text>
            </LinearGradient>
          </View>

          {match.venue_name && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="location-outline" size={16} color="#6B7280" />
              <Text className="text-textMuted ml-1 text-sm">
                {match.venue_name}
              </Text>
              {match.venue_city && (
                <Text className="text-textMuted text-sm">
                  , {match.venue_city}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Teams and Score */}
        <View className="p-6">
          <View className="flex-row items-center justify-between">
            {/* Home Team */}
            <View className="flex-1 items-center">
              <View className="relative">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
                  <Image
                    source={{ uri: match.home_team?.logo }}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>
                <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">H</Text>
                </View>
              </View>
              <Text className="text-text text-lg font-bold text-center">
                {match.home_team?.name}
              </Text>
              <Text className="text-textMuted text-sm">Home</Text>
            </View>

            {/* Score */}
            <View className="mx-6">
              {isNotStarted ? (
                <View className="bg-border/30 rounded-2xl p-4 items-center min-w-[100px]">
                  <Ionicons name="time-outline" size={24} color="#6B7280" />
                  <Text className="text-textMuted text-sm mt-2 text-center">
                    {formatTime(match.date)}
                  </Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  className="rounded-2xl p-4 items-center min-w-[100px]"
                >
                  <View className="flex-row items-center">
                    <Text className="text-white text-3xl font-black">
                      {match.goals_home ?? 0}
                    </Text>
                    <Text className="text-white/70 text-2xl mx-2">:</Text>
                    <Text className="text-white text-3xl font-black">
                      {match.goals_away ?? 0}
                    </Text>
                  </View>
                  {isLive && (
                    <Text className="text-white/90 text-xs font-bold mt-1">
                      81' ⚽ LIVE
                    </Text>
                  )}
                </LinearGradient>
              )}
            </View>

            {/* Away Team */}
            <View className="flex-1 items-center">
              <View className="relative">
                <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-3">
                  <Image
                    source={{ uri: match.away_team?.logo }}
                    className="w-16 h-16"
                    resizeMode="contain"
                  />
                </View>
                <View className="absolute -top-1 -left-1 w-6 h-6 bg-secondary rounded-full items-center justify-center">
                  <Text className="text-white text-xs font-bold">A</Text>
                </View>
              </View>
              <Text className="text-text text-lg font-bold text-center">
                {match.away_team?.name}
              </Text>
              <Text className="text-textMuted text-sm">Away</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};
