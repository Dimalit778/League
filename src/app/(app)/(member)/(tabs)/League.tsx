import { Error, LoadingOverlay } from '@/components/layout';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/league/TopThree';
import { useLeaderboardWithAvatars } from '@/hooks/useLeaderboard';
import { useMemberStore } from '@/store/MemberStore';
import { useHeaderHeight } from '@react-navigation/elements';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const League = () => {
  const { member } = useMemberStore();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const contentTop = Math.max(0, headerHeight - insets.top);

  const {
    data: leaderboard,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useLeaderboardWithAvatars();

  if (error) return <Error error={error} />;

  const topThree = leaderboard?.slice(0, 3);

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <LeaderboardCard
        nickname={item.nickname ?? ''}
        avatar_url={item.avatarUri ?? ''}
        total_points={item.total_points ?? 0}
        index={index + 1}
        isCurrentUser={item.user_id === member?.user_id}
      />
    ),
    [member?.user_id]
  );

  const keyExtractor = useCallback((item: any) => item.user_id ?? '', []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View className="flex-1 bg-background">
      {isLoading && !leaderboard && <LoadingOverlay />}
      <View style={{ paddingTop: contentTop }}>
        <TopThree topMembers={topThree} />
      </View>
      <FlatList
        data={leaderboard || []}
        showsVerticalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isRefetching}
        onRefresh={handleRefresh}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(_, index) => ({
          length: 80, // Approximate height of each leaderboard item
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
};

export default League;
