import { Error } from '@/components/layout';
import { AvatarImage, Card } from '@/components/ui';
import LeagueSkeleton from '@/features/leagues/components/LeagueSkeleton';
import TopThree from '@/features/leagues/components/TopThree';
import { useGetLeaderboard } from '@/features/leagues/hooks/useLeagues';
import { useMemberStore } from '@/store/MemberStore';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';

const LeagueScreen = () => {
  const leagueId = useMemberStore((s) => s.leagueId ?? '');
  const memberId = useMemberStore((s) => s.memberId ?? '');

  const { data: leaderboard, isLoading, error } = useGetLeaderboard(leagueId);

  const topThree = leaderboard?.slice(0, 3) ?? [];

  if (error) return <Error error={error} />;
  if (!leaderboard || isLoading) return <LeagueSkeleton />;
  return (
    <View className="flex-1 bg-background">
      <TopThree topMembers={topThree} />

      <FlatList
        data={leaderboard}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item, index) => item.member_id ?? `member-${index}`}
        renderItem={({ item, index }) => (
          <LeaderboardCard item={item} index={index} isCurrentUser={item.member_id === memberId} />
        )}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
};

const LeaderboardCard = React.memo(({ item, index, isCurrentUser }: any) => {
  const { nickname, avatar_url, total_points } = item;
  const memberId = item.member_id;
  return (
    <Link
      href={{
        pathname: '/(app)/(member)/member/id',
        params: {
          memberId: memberId,
        },
      }}
      asChild
    >
      <TouchableOpacity activeOpacity={0.7}>
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
    </Link>
  );
});

LeaderboardCard.displayName = 'LeaderboardCard';
export default LeagueScreen;
