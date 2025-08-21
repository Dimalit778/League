import { useLeagueMembersFixturePoints } from '@/hooks/useLeaderboard';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

type MatchPredictionsProps = {
  fixtureId: number;
};

export const MatchPredictions = ({ fixtureId }: MatchPredictionsProps) => {
  const { data: predictions, isLoading } =
    useLeagueMembersFixturePoints(fixtureId);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (!predictions || predictions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-4">
        <Text className="text-gray-500">No predictions for this match yet</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 py-2">
      <Text className="text-lg font-bold mb-3">League Predictions</Text>

      <FlatList
        data={predictions}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <View className="flex-row items-center p-3 mb-2 bg-gray-100 rounded-lg">
            <View className="flex-1">
              <Text className="font-semibold">{item.nickname}</Text>
            </View>

            {item.home_score !== null && item.away_score !== null ? (
              <View className="flex-row items-center">
                <View className="bg-gray-200 px-3 py-1 rounded-lg">
                  <Text className="font-bold">
                    {item.home_score} - {item.away_score}
                  </Text>
                </View>
                {item.points !== null && (
                  <View className="ml-3 bg-green-100 px-2 py-1 rounded-lg">
                    <Text className="font-bold text-green-800">
                      +{item.points}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text className="text-gray-500">No prediction</Text>
            )}
          </View>
        )}
      />
    </View>
  );
};

export default MatchPredictions;
