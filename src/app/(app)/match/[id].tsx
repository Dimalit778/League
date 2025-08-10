import { MatchFinished } from "@/components/matchDetails/MatchFinished";
import { MatchInfoCard } from "@/components/matchDetails/MatchInfoCard";
import { MatchLive } from "@/components/matchDetails/MatchLive";
import { MatchNotStarted } from "@/components/matchDetails/MatchNotStarted";
import { useTheme } from "@/context/ThemeContext";
import { useGetFixtureById } from "@/hooks/useFixtures";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface MatchEvent {
  id: string;
  type: "goal" | "yellow_card" | "red_card" | "substitution";
  time: number;
  player: string;
  team: "home" | "away";
  details?: string;
}

export default function MatchDetails() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const { data: match, isLoading, error } = useGetFixtureById(Number(id));
  console.log("match", JSON.stringify(match, null, 2));

  const [homeScorePrediction, setHomeScorePrediction] = useState("");
  const [awayScorePrediction, setAwayScorePrediction] = useState("");
  const [predictionSaved, setPredictionSaved] = useState(false);

  const handleSavePrediction = async () => {
    if (!homeScorePrediction || !awayScorePrediction) {
      Alert.alert("Error", "Please enter both scores");
      return;
    }

    // try {
    //   await savePrediction.mutateAsync({
    //     fixture_id: Number(id),
    //     predicted_home_score: parseInt(homeScorePrediction),
    //     predicted_away_score: parseInt(awayScorePrediction),
    //   });
    //   setPredictionSaved(true);
    //   Alert.alert("Success", "Your prediction has been saved!");
    // } catch (error) {
    //   Alert.alert("Error", "Failed to save prediction");
    // }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal":
        return "football-outline";
      case "yellow_card":
        return "card-outline";
      case "red_card":
        return "card";
      case "substitution":
        return "swap-horizontal-outline";
      default:
        return "information-circle-outline";
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-text mt-4 text-lg">Loading match details...</Text>
      </View>
    );
  }

  if (error || !match) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-4">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-text text-xl font-bold mt-4 text-center">
          Failed to load match details
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isNotStarted = match.status_long === "Not Started";
  const isLive =
    match.status_long?.includes("Half") || match.status_long === "Halftime";
  const isFinished = match.status_long === "Match Finished";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={
            theme === "dark" ? ["#1E293B", "#334155"] : ["#FFFFFF", "#F8FAFC"]
          }
          className="pt-12 pb-6 px-4"
        >
          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center bg-white/10 px-4 py-2 rounded-xl"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">Back</Text>
            </TouchableOpacity>

            <View className="flex-row items-center">
              <Ionicons name="trophy-outline" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                Match Details
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Match Info Card */}
        <MatchInfoCard match={match} theme={theme} />

        <View className="mx-4 mt-4">
          {isNotStarted && (
            <MatchNotStarted
              isNotStarted={isNotStarted}
              match={match}
              homeScorePrediction={homeScorePrediction}
              setHomeScorePrediction={setHomeScorePrediction}
              awayScorePrediction={awayScorePrediction}
              setAwayScorePrediction={setAwayScorePrediction}
              predictionSaved={predictionSaved}
              savePrediction={() => {}}
              handleSavePrediction={handleSavePrediction}
            />
          )}

          {isLive && <MatchLive events={match} getEventIcon={getEventIcon} />}

          {isFinished && <MatchFinished match={match} userPrediction={""} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
