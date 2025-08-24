import { useGetLeaderboard } from '@/hooks/useLeaderboard';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export default function Rank() {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold mb-4">Leaderboard</Text>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item, index }) => (
          <View className="flex-row items-center p-3 mb-2 bg-gray-100 rounded-lg">
            <Text className="w-8 font-bold">{index + 1}.</Text>
            <View className="flex-1">
              <Text className="font-semibold">{item.nickname}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="font-bold text-lg mr-2">
                {item.total_points}
              </Text>
              <Text className="text-gray-500">
                ({item.predictions_count} predictions)
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
