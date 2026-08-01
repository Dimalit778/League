import { Row } from '@/components/layout';
import { AvatarImage, PositionBadge } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativewind/nativeWind';
import { useMemberId } from '@/store/PrimaryLeagueStore';
import { Link } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { LeaderboardMember } from '../../types/member.type';
type LeaderboardRowProps = {
  member: LeaderboardMember;
  position: number;
  isCurrentUser: boolean;
};

export function LeaderboardRow({ member, position, isCurrentUser }: LeaderboardRowProps) {
  const { t } = useTranslation();
  const { nickname, avatar_url, member_id, total_points, league_id } = member;
  if (!league_id || !member_id) return null;

  return (
    <Link
      href={{
        pathname: '/(app)/(league)/member/[memberId]',
        params: { leagueId: league_id, memberId: member_id },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.7}>
        <Row
          className={cn(
            'items-center p-3 rounded-xl border border-border',
            isCurrentUser ? 'bg-surface border border-primary' : 'bg-background',
          )}
        >
          <View className="w-10 items-center">
            <PositionBadge position={position} isCurrentUser={isCurrentUser} />
          </View>

          <View className="mx-3 h-11 w-11">
            <AvatarImage path={avatar_url} nickname={nickname} />
          </View>

          <Text numberOfLines={1} className={cn('font-semibold flex-1', isCurrentUser && 'text-primary')}>
            {nickname}
          </Text>

          <View className="items-end ">
            <Text className={cn('font-bold', isCurrentUser && 'text-primary')}>{total_points}</Text>
            <Text variant="bodySmall" tone="muted">
              {t('Pts')}
            </Text>
          </View>
        </Row>
      </TouchableOpacity>
    </Link>
  );
}

export function LeaderboardList({ leaderboard }: { leaderboard: LeaderboardMember[] }) {
  const currentMemberId = useMemberId();
  return (
    <View className=" gap-2 ">
      {leaderboard.map((member, index) => (
        <LeaderboardRow
          key={member.member_id}
          member={member}
          isCurrentUser={currentMemberId === member.member_id}
          position={index + 4}
        />
      ))}
    </View>
  );
}
