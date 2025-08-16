import { usePredictionByFixture } from "@/features/predictions/hooks/usePredictions";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Text, View } from "react-native";
import { LeagueLeaderboard } from "../LeagueLeaderboard";
import { MatchPredictions } from "../MatchPredictions";

interface MatchFinishedProps {
  match: any;
  userPrediction?: any;
}

export const MatchFinished = ({ match }: MatchFinishedProps) => {
  const { data: userPrediction, isLoading } = usePredictionByFixture(match.id);

  if (isLoading) {
    return (
      <View className="items-center p-4">
        <ActivityIndicator size="large" color="#6366F1" />
        <Text className="text-text mt-2">Loading prediction data...</Text>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      {/* Final Result */}
      <LinearGradient
        colors={["#10B981", "#059669"]}
        className="rounded-2xl p-6"
      >
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
            <Ionicons name="trophy" size={20} color="white" />
          </View>
          <Text className="text-white text-xl font-bold ml-3">
            Final Result
          </Text>
        </View>

        <View className="flex-row items-center justify-center">
          <Text className="text-white text-4xl font-black">
            {match.goals_home ?? 0}
          </Text>
          <Text className="text-white/70 text-3xl mx-4">-</Text>
          <Text className="text-white text-4xl font-black">
            {match.goals_away ?? 0}
          </Text>
        </View>
      </LinearGradient>

      {/* User Prediction Result */}
      {userPrediction && (
        <View className="bg-surface rounded-2xl p-6">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-primary rounded-full items-center justify-center">
              <Ionicons name="person" size={20} color="white" />
            </View>
            <Text className="text-text text-xl font-bold ml-3">
              Your Prediction
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="items-center">
              <Text className="text-textMuted text-sm mb-1">
                Your Prediction
              </Text>
              <Text className="text-text text-2xl font-bold">
                {userPrediction.predicted_home_score} -{" "}
                {userPrediction.predicted_away_score}
              </Text>
            </View>

            <View className="items-center">
              <Text className="text-textMuted text-sm mb-1">Points Earned</Text>
              <LinearGradient
                colors={
                  userPrediction.points > 0
                    ? ["#10B981", "#059669"]
                    : ["#6B7280", "#9CA3AF"]
                }
                className="rounded-xl px-4 py-2"
              >
                <Text className="text-white text-xl font-bold">
                  {userPrediction.points} pts
                </Text>
              </LinearGradient>
            </View>
          </View>

          <View className="mt-4 p-4 bg-primary/10 rounded-xl">
            <Text className="text-center text-textMuted">
              {userPrediction.points === 10
                ? "🎉 Perfect prediction!"
                : userPrediction.points === 3
                  ? "👍 Correct result!"
                  : "😕 Better luck next time!"}
            </Text>
          </View>
        </View>
      )}

      {/* Match Predictions */}
      <MatchPredictions fixtureId={match.id} />

      {/* League Leaderboard */}
      <LeagueLeaderboard />
    </View>
  );
};
