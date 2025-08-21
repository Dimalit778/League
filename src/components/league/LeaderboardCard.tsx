import { LeagueLeaderboardType } from '@/types';
import { Text, View } from 'react-native';

const LeaderboardCard = ({
  user,
  index,
}: {
  user: LeagueLeaderboardType;
  index: number;
}) => {
  return (
    <View className="flex-row items-center justify-between bg-surface rounded-lg p-3 shadow-md border border-border gap-4 h-16">
      <View className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-border">
        <Text className="text-sm text-black font-bold">{index}</Text>
      </View>
      <View className="w-12 h-12 rounded-full  flex items-center justify-center border border-border">
        <Text className="text-lg text-black font-bold">{user.avatar_url}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-lg text-text font-bold">{user.nickname}</Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-lg text-text font-bold">
          {user.total_points ?? 0}
        </Text>
        <Text className="text-sm text-textMuted">pts</Text>
      </View>
    </View>
  );
};
export default LeaderboardCard;
