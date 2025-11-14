import { Error } from '@/components/layout';
import LeagueSkeleton from '@/components/skeleton/LeagueSkeleton';
import TopThree from '@/components/TopThree';
import { AvatarImage, Card } from '@/components/ui';
import { useGetLeagueLeaderboard } from '@/hooks/useLeagues';
import { useStoreData } from '@/store/store';
import { useHeaderHeight } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { Link } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LeagueScreen() {
  const { member, league } = useStoreData();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const contentTop = Math.max(0, headerHeight - insets.top);
  const isFocused = useIsFocused();

  const { data: leaderboard, isLoading, isRefetching, error, refetch } = useGetLeagueLeaderboard(league.id);

  const topThree = leaderboard?.slice(0, 3) ?? [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (isLoading) return <LeagueSkeleton />;

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: contentTop }}>
        <TopThree topMembers={topThree} />
      </View>

      <FlatList
        data={leaderboard}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item, index) => item.member_id ?? `member-${index}`}
        renderItem={({ item, index }) => (
          <LeaderboardCard item={item} index={index} isCurrentUser={item.user_id === member?.user_id} />
        )}
        refreshing={isFocused && isRefetching}
        onRefresh={handleRefresh}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
        legacyImplementation={false}
        disableVirtualization={false}
      />
    </View>
  );
}
const LeaderboardCard = ({ item, index, isCurrentUser }: any) => {
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
};
