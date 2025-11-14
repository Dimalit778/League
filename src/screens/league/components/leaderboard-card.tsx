import { AvatarImage, Card } from '@/components/ui';
import { useStoreData } from '@/store/store';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import { Tables } from '@/types/database.types';
interface LeaderboardCardProps {
  item: Tables<'league_leaderboard_view'>;
  index: number;
  isCurrentUser: boolean;
}
export default function LeaderboardCard({ item, index, isCurrentUser }: LeaderboardCardProps) {
  const { nickname, avatar_url, total_points, member_id } = item;
  const { league } = useStoreData();
  const router = useRouter();

  const handlePress = () => {
    if (!member_id || !league?.id) return;

    router.push({
      pathname: '/(app)/(member)/member/details',
      params: {
        memberId: member_id,
        leagueId: league.id,
        nickname: nickname ?? '',
        avatarUrl: avatar_url || '',
        position: index + 1,
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
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
            <Text className="text-text font-bold text-xl">{total_points?.toLocaleString() ?? 0}</Text>
            <Text className="text-muted text-sm">pts</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
