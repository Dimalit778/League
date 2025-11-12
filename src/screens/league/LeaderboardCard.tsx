import { AvatarImage, Card } from '@/components/ui';
import { LeagueLeaderboardType } from '@/types';
import { Text, View } from 'react-native';

type Item = {
  item: LeagueLeaderboardType;
  index: number;
  isCurrentUser: boolean;
};
const LeaderboardCard = ({ item, index, isCurrentUser }: Item) => {
  const { nickname, avatar_url, total_points } = item;

  return (
    <Card className={`${isCurrentUser ? 'border-primary' : ''} p-2 mx-3 my-1`}>
      <View className="flex-row items-center gap-3">
        {/* Position Badge */}
        <View className="w-8 h-8 rounded-full items-center justify-center bg-background">
          <Text className="text-text font-semibold text-sm">{index + 1}</Text>
        </View>
        <View className="w-10 h-10 rounded-full overflow-hidden">
          <AvatarImage nickname={nickname!} path={avatar_url} />
        </View>
        {/* User Info */}
        <View className="flex-1">
          <Text className="text-text font-bold" numberOfLines={1}>
            {nickname}
          </Text>
        </View>

        {/* Points Section */}
        <View className="items-center pr-2">
          <Text className="text-text font-bold text-xl">
            {total_points?.toLocaleString() ?? 0}
          </Text>
          <Text className="text-muted text-sm">pts</Text>
        </View>
      </View>
    </Card>
  );
};

export default LeaderboardCard;
