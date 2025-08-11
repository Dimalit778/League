import { formatDate, formatTime } from "@/utils/match-utils";
import footballField from "../../../assets/images/footballField.png";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ArrowLeftIcon } from "../../../assets/icons";

export const MatchInfoCard = ({ match }: { match: any }) => {
  const isNotStarted = match.status_long === "Not Started";
  const isLive =
    match.status_long?.includes("Half") || match.status_long === "Halftime";
  const isFinished = match.status_long === "Match Finished";

  return (
    <ImageBackground source={footballField} imageStyle={{ opacity: 0.4 }}>
      <TouchableOpacity
        className="absolute top-4 left-4"
        onPress={() => router.back()}
      >
        <ArrowLeftIcon width={30} height={30} color={"light"} />
      </TouchableOpacity>

      <View className="p-4">
        <View className="flex-row items-center justify-center">
          <Ionicons name="calendar-outline" size={16} color="#fff" />
          <Text className="text-white ml-1 text-sm font-medium">
            {formatDate(match.date)}
          </Text>
        </View>

        {match.venue_name && (
          <View className="flex-row items-center mt-2 justify-center">
            <Ionicons name="location-outline" size={16} color="#fff" />
            <Text className="text-white ml-1 text-sm font-bold">
              {match.venue_name}
            </Text>
            {match.venue_city && (
              <Text className="text-text text-sm">, {match.venue_city}</Text>
            )}
          </View>
        )}
      </View>

      <View className="p-6">
        <View className="flex-row items-center ">
          {/* Home Team */}
          <View className="flex-1 items-center rounded-lg p-2 bg-gray-500/40">
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
            <Text className="text-white text-base font-bold text-center">
              {match.home_team?.name}
            </Text>
            <Text className="text-white text-sm">Home</Text>
          </View>

          {/* Score */}
          <View className="mx-6">
            {isNotStarted ? (
              <View className=" rounded-2xl p-4 items-center min-w-[100px]">
                <Ionicons name="time-outline" size={24} color="#fff" />
                <Text className="text-white text-sm mt-2 text-center">
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
          <View className="flex-1 items-center rounded-lg p-2 bg-gray-500/40">
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
            <Text className="text-white text-base font-bold text-center">
              {match.away_team?.name}
            </Text>
            <Text className="text-white text-sm">Away</Text>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};
