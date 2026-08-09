import { AvatarImage, Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Link } from 'expo-router';
import { Pin } from 'lucide-react-native';
import { TouchableOpacity, View } from 'react-native';
import { LeaderboardMember } from '../../types/member.type';

type LeaderboardRowProps = {
  member: LeaderboardMember;
  position: number;
  isCurrentUser: boolean;
  clickable: boolean;
};

export function LeaderboardRow({ member, position, isCurrentUser, clickable }: LeaderboardRowProps) {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();
  const { nickname, avatar_url, member_id, total_points, league_id, user_id } = member;
  if (!league_id || !member_id) return null;
  const displayName = user_id ? (nickname ?? t('Unknown User')) : t('Deleted Player');

  const content = (
    <Row
      className={cn(
        'rounded-2xl border p-3',
        isCurrentUser ? 'border-primary bg-surface' : 'border-border bg-surface/40',
      )}
    >
      <View className="w-7 items-center">
        <Text ltr className={cn('font-teko-bold text-[20px]', isCurrentUser ? 'text-primary' : 'text-muted')}>
          {position}
        </Text>
      </View>

      <View className="mx-3 h-11 w-11">
        <AvatarImage path={avatar_url} nickname={displayName} />
      </View>

      <Text numberOfLines={1} className={cn('flex-1 font-semibold', isCurrentUser && 'text-primary')}>
        {displayName}
      </Text>

      <Text ltr className={cn('font-bold', isCurrentUser ? 'text-primary' : 'text-text')}>
        {total_points ?? 0} {t('pts')}
      </Text>

      {isCurrentUser ? (
        <Row keepLtr className="ms-2 gap-1 rounded-full bg-primary/15 px-2 py-1">
          <Pin size={12} color={colors.primary} strokeWidth={2} fill={colors.primary} />
          <Text variant="caption" tone="primary" className="font-semibold">
            {t('You')}
          </Text>
        </Row>
      ) : null}
    </Row>
  );

  const accessibilityLabel = t('{{name}}, position {{position}}, {{points}} points', {
    name: displayName,
    position,
    points: total_points ?? 0,
  });

  if (!clickable) {
    return (
      <View accessibilityLabel={accessibilityLabel} accessible>
        {content}
      </View>
    );
  }

  return (
    <Link
      href={{
        pathname: '/(app)/(league)/member/[memberId]',
        params: { leagueId: league_id, memberId: member_id },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.7} accessibilityRole="button" accessibilityLabel={accessibilityLabel}>
        {content}
      </TouchableOpacity>
    </Link>
  );
}

export function LeaderboardList({
  leaderboard,
  currentUserId,
  clickable = true,
}: {
  leaderboard: LeaderboardMember[];
  currentUserId?: string | null;
  clickable?: boolean;
}) {
  return (
    <View className="gap-2">
      {leaderboard.map((member, index) => (
        <LeaderboardRow
          key={member.member_id}
          member={member}
          isCurrentUser={!!currentUserId && currentUserId === member.user_id}
          position={index + 4}
          clickable={clickable}
        />
      ))}
    </View>
  );
}
