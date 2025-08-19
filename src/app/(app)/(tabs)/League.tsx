import LoadingOverlay from '@/components/layout/LoadingOverlay';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/myLeagues/TopThree';
import { useGetLeaderboard } from '@/hooks/useMembers';

import { FlatList, View } from 'react-native';

const League = () => {
  const { data: leaderboard, isLoading } = useGetLeaderboard();

  if (isLoading) return <LoadingOverlay />;

  return (
    <View className="flex-1 bg-background">
      <FlatList
        ListHeaderComponent={() => <TopThree topThree={leaderboard || []} />}
        data={leaderboard}
        contentContainerStyle={{ padding: 16, gap: 10, marginTop: 40 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard user={item} index={index + 1} />
        )}
        keyExtractor={(item) => item.user_id.toString()}
      />
    </View>
  );
};

export default League;
