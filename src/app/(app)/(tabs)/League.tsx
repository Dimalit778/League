import { Error, LoadingOverlay } from '@/components/layout';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/league/TopThree';
import { useLeaderboardWithAvatars } from '@/hooks/useLeaderboard';
import { useMemberStore } from '@/store/MemberStore';
import { useHeaderHeight } from '@react-navigation/elements';
import { FlatList, SafeAreaView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const League = () => {
  const { member } = useMemberStore();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const contentTop = Math.max(0, headerHeight - insets.top);
  const {
    data: leaderboard,
    isLoading,
    error,
    refetch,
  } = useLeaderboardWithAvatars();

  if (error) return <Error error={error} />;

  const topThree = leaderboard?.slice(0, 3);

  const isRefreshing = false;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {isLoading && !leaderboard && <LoadingOverlay />}
      <View style={{ paddingTop: contentTop }}>
        <TopThree topMembers={topThree} />
      </View>
      <FlatList
        data={leaderboard || []}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.user_id ?? ''}
        renderItem={({ item, index }) => (
          <LeaderboardCard
            nickname={item.nickname ?? ''}
            avatar_url={item.avatarUri ?? ''}
            total_points={item.total_points ?? 0}
            index={index + 1}
            isCurrentUser={item.user_id === member?.user_id}
          />
        )}
        refreshing={isRefreshing}
        onRefresh={() => {
          refetch();
        }}
      />
    </SafeAreaView>
  );
};

export default League;
