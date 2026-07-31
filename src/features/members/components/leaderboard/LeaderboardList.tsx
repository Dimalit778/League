import { AvatarImage, PositionBadge } from '@/components/ui';
import { Text } from '@/components/ui/Text';
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
  const { nickname, avatar_url, member_id, total_points, league_id } = member;

  return (
    <Link
      href={{
        pathname: '/(app)/(league)/member/[memberId]',
        params: { leagueId: league_id ?? '', memberId: member_id ?? '' },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.7}>
        <View
          className={cn(
            'flex-row items-center py-2 px-3 rounded-md',
            isCurrentUser ? 'bg-surface border border-primary' : 'bg-background',
          )}
        >
          <View className="w-10 items-center">
            <PositionBadge position={position} isCurrentUser={isCurrentUser} />
          </View>

          <View className="mx-3 h-11 w-11">
            <AvatarImage path={avatar_url} nickname={nickname} />
          </View>

          <View className="min-w-0 flex-1">
            <Text numberOfLines={1} className={cn('font-semibold', isCurrentUser && 'text-primary')}>
              {nickname}
            </Text>
          </View>

          <View className="items-end">
            <Text className={cn('font-bold', isCurrentUser && 'text-primary')}>{total_points}</Text>
            <Text className="text-sm mt-0.5 text-muted">points</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
}

export function LeaderboardList({ leaderboard }: { leaderboard: LeaderboardMember[] }) {
  const currentMemberId = useMemberId();
  return (
    <View className="mx-2 bg-surface border border-border rounded-md">
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
