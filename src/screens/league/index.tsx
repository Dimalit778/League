import { Error } from '@/components/layout';
import { useGetLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardCard from '@/screens/league/LeaderboardCard';
import LeagueSkeleton from '@/screens/league/LeagueSkeleton';
import TopThree from '@/screens/league/TopThree';
import { useMemberStore } from '@/store/MemberStore';
import { LeagueLeaderboardType } from '@/types';
import { useHeaderHeight } from '@react-navigation/elements';
import { useIsFocused } from '@react-navigation/native';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const League = () => {
  const { member } = useMemberStore();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const contentTop = Math.max(0, headerHeight - insets.top);
  const isFocused = useIsFocused();
  // const [isSwitchingLeague, setIsSwitchingLeague] = useState(false);

  const {
    data: leaderboard,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useGetLeaderboard();

  // const imageUris = useMemo(
  //   () => leaderboard?.map((item) => item.imageUri).filter(Boolean) ?? [],
  //   [leaderboard]
  // );

  // const imagesReady = usePrefetchImages(imageUris);

  const topThree = leaderboard?.slice(0, 3) ?? [];

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const loading =
    (isLoading && !leaderboard) ||
    // isSwitchingLeague ||
    (member?.league_id && !leaderboard);

  if (error) return <Error error={error} />;
  if (loading) return <LeagueSkeleton />;

  return (
    <View className="flex-1 bg-background">
      <View style={{ paddingTop: contentTop }}>
        <TopThree topMembers={topThree as LeagueLeaderboardType[]} />
      </View>

      <FlatList
        data={leaderboard || []}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyExtractor={(item: any) => item.user_id}
        renderItem={({ item, index }) => (
          <LeaderboardCard
            item={item}
            index={index}
            isCurrentUser={item.user_id === member?.user_id}
          />
        )}
        refreshing={isFocused && isRefetching}
        onRefresh={handleRefresh}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        updateCellsBatchingPeriod={50}
        getItemLayout={(_, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
};

export default League;
