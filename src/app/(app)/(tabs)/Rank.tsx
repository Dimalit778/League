import { useLeaderboard } from "@/hooks/useQueries";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Text, View } from "react-native";

export default function Rank() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const user = {
    id: "123",
    nickname: "John Doe",
    total_predictions: 10,
    total_points: 100,
    exact_scores: 5,
  };
  // Simulate a selected league for demonstration purposes
  useEffect(() => {
    // In a real app, this would come from user selection or app state
    setSelectedLeagueId("some-league-id");
  }, []);

  // Use our React Query hook to fetch leaderboard data
  const {
    data: leaderboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeaderboard(selectedLeagueId || "");

  if (!selectedLeagueId) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <Text className="text-lg font-semibold">
          Please select a league first
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-gray-600">Loading leaderboard...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center p-4">
        <Text className="text-red-500 font-semibold">
          Error loading leaderboard
        </Text>
        <Text className="text-red-400 mt-2">
          {(error as Error)?.message || "Unknown error"}
        </Text>
        <Button title="Try Again" onPress={() => refetch()} />
      </View>
    );
  }

  const leaderboard = leaderboardData?.data || [];

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-blue-600 p-4">
        <Text className="text-2xl font-bold text-white text-center">
          Leaderboard
        </Text>
      </View>

      {leaderboard.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">
            No rankings available yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={leaderboard}
          className="flex-1 p-4"
          renderItem={({ item, index }) => (
            <View
              className={`flex-row items-center p-4 rounded-lg mb-2 ${
                user?.id === item.user_id ? "bg-blue-100" : "bg-white"
              }`}
            >
              <Text className="text-lg font-bold w-10">{index + 1}</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold">
                  {item.nickname || item.display_name}
                </Text>
                <Text className="text-gray-500">
                  Predictions: {item.total_predictions}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xl font-bold">
                  {item.total_points} pts
                </Text>
                <Text className="text-sm text-gray-500">
                  Exact: {item.exact_scores || 0}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.user_id}
          refreshing={isLoading}
          onRefresh={() => refetch()}
        />
      )}
    </View>
  );
}
