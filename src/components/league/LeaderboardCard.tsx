import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { Card, Image } from '../ui';

interface LeaderboardCardProps {
  nickname: string;
  avatar_url: string;
  total_points: number;
  index: number;
  isCurrentUser?: boolean;
}

const LeaderboardCard = ({
  nickname,
  avatar_url,
  total_points,
  index,
  isCurrentUser = false,
}: LeaderboardCardProps) => {
  return (
    <Card className={`${isCurrentUser ? 'border-primary' : ''} p-2 mx-3 my-1`}>
      <View className="flex-row items-center gap-3">
        {/* Position Badge */}
        <View className="w-8 h-8 rounded-full items-center justify-center">
          <Text className="text-text font-semibold text-sm">{index}</Text>
        </View>

        {/* User Avatar */}

        {avatar_url ? (
          <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-border">
            <Image
              source={{
                uri: avatar_url,
              }}
              className="w-full h-full"
              width={40}
              height={40}
            />
          </View>
        ) : (
          <FontAwesome name="user-circle-o" size={40} color="grey" />
        )}

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
