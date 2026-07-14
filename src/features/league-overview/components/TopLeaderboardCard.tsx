import { AvatarImage, Card } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { LeaderboardRow } from '@/features/leagues/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { Link } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type RowProps = {
  user: LeaderboardRow;
  rank: number;
  isCurrentUser: boolean;
  className?: string;
};

function Row({ user, rank, isCurrentUser, className }: RowProps) {
  const { colors } = useThemeTokens();
  const textColor = isCurrentUser ? 'text-primary' : colors.text;

  return (
    <View
      className={cn(
        `flex-row items-center py-2 px-3 rounded-xl ${isCurrentUser ? 'border border-primary ' : ''}`,
        className,
      )}
    >
      <Text className="w-8" semibold>
        {rank}
      </Text>
      <View className="h-7 w-7  overflow-hidden ">
        <AvatarImage nickname={user.nickname} path={user.avatar_url} />
      </View>

      <Text semibold className={`flex-1 ml-3 ${textColor}`} numberOfLines={1}>
        {user.nickname}
      </Text>

      <Text className={`${textColor}`}>{user.total_points ?? 0}</Text>
    </View>
  );
}

type Props = {
  users: LeaderboardRow[];
  currentMemberId: string;
};

export function TopLeaderboardCard({ users, currentMemberId }: Props) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  return (
    <Card>
      <View className="flex-row justify-between items-center ">
        <Text bold>{t('Top leaderboard')}</Text>

        <Link href="/(app)/(league)/(tabs)/Rank" asChild>
          <Pressable className="flex-row items-center" accessibilityRole="button">
            <Text caption className="text-muted">
              {t('View full table')}
            </Text>
            <ChevronRight size={18} color={colors.muted} strokeWidth={1.5} />
          </Pressable>
        </Link>
      </View>
      <View className="h-0.5 w-full bg-border rounded-full mt-2" />
      {users.map((user, index) => (
        <Row
          key={user.member_id ?? index}
          user={user}
          rank={index + 1}
          isCurrentUser={user.member_id === currentMemberId}
          className={index === 0 ? 'rounded-t-xl' : index === users.length - 1 ? 'rounded-b-xl' : ''}
        />
      ))}
    </Card>
  );
}
