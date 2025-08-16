import { useLeaguePredictions } from "@/features/predictions/hooks/usePredictions";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

interface MatchPredictionsProps {
  fixtureId: number;
}

export const MatchPredictions = ({ fixtureId }: MatchPredictionsProps) => {
  const {
    data: predictions,
    isLoading,
    error,
  } = useLeaguePredictions(fixtureId);

  if (isLoading) {
    return (
      <View className="p-4 items-center">
        <ActivityIndicator size="small" color="#6366F1" />
        <Text className="text-text/60 mt-2">Loading predictions...</Text>
      </View>
    );
  }

  if (error || !predictions || predictions.length === 0) {
    return (
      <View className="p-4 items-center">
        <Ionicons name="people-outline" size={32} color="#6B7280" />
        <Text className="text-text/60 mt-2">No predictions yet</Text>
      </View>
    );
  }

  const renderPrediction = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between p-4 bg-white/5 rounded-xl mb-2">
      <View className="flex-row items-center flex-1">
        {item.users.avatar_url ? (
          <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gray-500 mr-3 items-center justify-center">
            <Text className="text-white font-bold text-sm">
              {item.users.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text className="text-text font-semibold flex-1" numberOfLines={1}>
          {item.users.full_name}
        </Text>
      </View>

      <View className="flex-row items-center">
        <View className="bg-white/10 rounded-lg px-3 py-2 mr-3">
          <Text className="text-text font-bold text-lg">
            {item.predicted_home_score} - {item.predicted_away_score}
          </Text>
        </View>

        {item.points > 0 && (
          <View className="bg-green-500/20 rounded-full px-2 py-1">
            <Text className="text-green-400 font-bold text-sm">
              {item.points}pts
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View className="p-4">
      <Text className="text-text text-xl font-bold mb-4">
        League Predictions ({predictions.length})
      </Text>

      <FlatList
        data={predictions}
        renderItem={renderPrediction}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};
