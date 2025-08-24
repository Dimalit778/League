import { Text, View } from 'react-native';
import { Image } from '../ui';

import avatar from '../../../assets/images/avatar.jpg';

const LeaderboardCard = ({
  nickname,
  avatar_url,
  total_points,
  index,
}: {
  nickname: string;
  avatar_url: string;
  total_points: number;
  index: number;
}) => {
  return (
    <View className="flex-row items-center justify-between bg-surface rounded-lg p-3 shadow-md border border-border gap-4 h-16">
      <View className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center border border-border">
        <Text className="text-sm text-black font-bold">{index}</Text>
      </View>

      <View className="">
        <Image
          source={{ uri: avatar_url ? avatar_url : avatar }}
          className="w-full h-full rounded-full"
          width={40}
          height={40}
        />
      </View>
      <View className="flex-1">
        <Text className="text-lg text-text font-bold">{nickname}</Text>
      </View>
      <View className="flex-1 items-end">
        <Text className="text-lg text-text font-bold">{total_points ?? 0}</Text>
        <Text className="text-sm text-textMuted">pts</Text>
      </View>
    </View>
  );
};
export default LeaderboardCard;
