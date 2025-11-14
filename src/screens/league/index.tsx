import { Error } from '@/components/layout';
import { useGetLeagueLeaderboard } from '@/hooks/useLeagues';
import LeaderboardCard from '@/screens/league/components/leaderboard-card';
import LeagueSkeleton from '@/screens/league/components/skeleton';
import TopThree from '@/screens/league/components/top-tree';
import { useStoreData } from '@/store/store';
import { useHeaderHeight } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LeagueScreen = () => {
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
};

export default LeagueScreen;
