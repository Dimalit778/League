import { AvatarImage } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { LeaderboardRow } from '@/features/leagues/types';
import { useTranslation } from '@/hooks/useTranslation';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type RowProps = {
  user: LeaderboardRow;
  rank: number;
  isCurrentUser: boolean;
};

function Row({ user, rank, isCurrentUser }: RowProps) {
  const textColor = isCurrentUser ? 'text-primaryGold' : 'text-white';

  return (
    <View
      className={`flex-row items-center py-3 px-3 rounded-xl ${
        isCurrentUser ? 'border border-primaryGold bg-goldGlow' : ''
      }`}
    >
      <Text className="text-white w-8">{rank}</Text>

      <View className="h-8 w-8 overflow-hidden rounded-full">
        <AvatarImage nickname={user.nickname} path={user.avatar_url} />
      </View>

      <Text className={`flex-1 ml-3 font-semibold ${textColor}`} numberOfLines={1}>
        {user.nickname}
      </Text>

      <Text className={`font-bold ${textColor}`}>{user.total_points ?? 0}</Text>
    </View>
  );
}

type Props = {
  users: LeaderboardRow[];
  currentMemberId: string;
};

export function TopLeaderboardCard({ users, currentMemberId }: Props) {
  const { t } = useTranslation();

  return (
    <View className="rounded-3xl border border-cardBorder bg-card p-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">{t('Top leaderboard')}</Text>

        <Link href="/(app)/(league)/(tabs)/Rank" asChild>
          <Pressable className="flex-row items-center" accessibilityRole="button">
            <Text className="text-primaryGold">{t('View full table')}</Text>
            <ChevronRight size={18} color="#D99A00" />
          </Pressable>
        </Link>
      </View>

      {users.map((user, index) => (
        <Row
          key={user.member_id ?? index}
          user={user}
          rank={index + 1}
          isCurrentUser={user.member_id === currentMemberId}
        />
      ))}
    </View>
  );
}
