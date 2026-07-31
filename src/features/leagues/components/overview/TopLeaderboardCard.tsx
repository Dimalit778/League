import { AvatarImage, Card, DirectionalIcon, PositionBadge } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { LeaderboardRow } from '@/features/leagues/types';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { spacing } from '@/lib/nativewind/spacing';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

type RowProps = {
  user: LeaderboardRow;
  rank: number;
  isCurrentUser: boolean;
  isLast: boolean;
};

function Row({ user, rank, isCurrentUser, isLast }: RowProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  return (
    <View
      className={cn(
        'flex-row items-center py-2.5 px-1.5',
        isCurrentUser && 'rounded-xl border border-primary px-2',
        !isLast && !isCurrentUser && 'border-b border-border',
      )}
    >
      <View className="mr-2">
        <PositionBadge position={rank} />
      </View>
      <View className={cn('min-w-0 flex-1 flex-row items-center', spacing.row)}>
        <View className="h-7 w-7 overflow-hidden rounded-full">
          <AvatarImage nickname={user.nickname} path={user.avatar_url} />
        </View>
        <Text numberOfLines={1} className={cn('font-semibold text-xs', 'flex-1', colors.text)}>
          {user.nickname}
        </Text>
      </View>

      <Text className={cn('text-xs', 'text-right', colors.text)}>
        {user.total_points ?? 0} {t('pts')}
      </Text>
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
    <View>
      <View className="flex-row px-4 py-2">
        <Link href="/(app)/(league)/(tabs)/Leaderboard" asChild>
          <Pressable accessibilityRole="button" className={cn('flex-row items-center', spacing.micro)}>
            <Text className="font-semibold">{t('Top leaderboard')}</Text>
            <DirectionalIcon size={16} color={colors.muted} strokeWidth={2} />
          </Pressable>
        </Link>
      </View>
      <Card className="mx-3" padding="md">
        <View className="flex-row items-center px-2 pb-2 border-b border-border">
          <Text className="text-xs w-6 text-muted">#</Text>
          <Text className="text-xs flex-1 text-muted">{t('USER')}</Text>
          <Text className="text-xs text-muted text-right">{t('POINTS')}</Text>
        </View>

        {users.map((user, index) => (
          <Row
            key={user.member_id ?? index}
            user={user}
            rank={index + 1}
            isCurrentUser={user.member_id === currentMemberId}
            isLast={index === users.length - 1}
          />
        ))}
      </Card>
    </View>
  );
}
