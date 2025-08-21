import { useLeagueLeaderboard } from '@/hooks/usePredictions';
import { useAuthStore } from '@/store/AuthStore';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

export const LeagueLeaderboard = () => {
  const { data: leaderboard, isLoading, error } = useLeagueLeaderboard();
  const { user } = useAuthStore();

  if (isLoading) {
    return (
      <View className="p-4 items-center">
        <ActivityIndicator size="small" color="#6366F1" />
        <Text className="text-text/60 mt-2">Loading leaderboard...</Text>
      </View>
    );
  }

  if (error || !leaderboard || leaderboard.length === 0) {
    return (
      <View className="p-4 items-center">
        <Ionicons name="trophy-outline" size={32} color="#6B7280" />
        <Text className="text-text/60 mt-2">No leaderboard data</Text>
      </View>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Ionicons name="medal" size={24} color="#FFD700" />;
      case 1:
        return <Ionicons name="medal" size={24} color="#C0C0C0" />;
      case 2:
        return <Ionicons name="medal" size={24} color="#CD7F32" />;
      default:
        return (
          <View className="w-6 h-6 rounded-full bg-gray-500 items-center justify-center">
            <Text className="text-white font-bold text-xs">{index + 1}</Text>
          </View>
        );
    }
  };

  const renderLeaderboardItem = ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => {
    const isCurrentUser = item.user_id === user?.id;

    return (
      <View
        className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
          isCurrentUser
            ? 'bg-primary/20 border border-primary/30'
            : 'bg-white/5'
        }`}
      >
        <View className="flex-row items-center flex-1">
          <View className="mr-4">{getRankIcon(index)}</View>

          {item.users.avatar_url ? (
            <View className="w-10 h-10 rounded-full bg-gray-300 mr-3" />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-500 mr-3 items-center justify-center">
              <Text className="text-white font-bold text-sm">
                {item.users.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View className="flex-1">
            <Text
              className={`font-semibold ${isCurrentUser ? 'text-primary' : 'text-text'}`}
              numberOfLines={1}
            >
              {item.nickname}
            </Text>
            <Text className="text-text/60 text-sm" numberOfLines={1}>
              {item.users.full_name}
            </Text>
          </View>
        </View>

        <View className="items-center">
          <Text
            className={`font-bold text-xl ${isCurrentUser ? 'text-primary' : 'text-text'}`}
          >
            {item.points || 0}
          </Text>
          <Text className="text-text/60 text-xs">points</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="p-4">
      <View className="flex-row items-center mb-4">
        <Ionicons name="trophy" size={24} color="#FFD700" />
        <Text className="text-text text-xl font-bold ml-2">
          League Leaderboard
        </Text>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        // keyExtractor={(item) => item.user_id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    </View>
  );
};
