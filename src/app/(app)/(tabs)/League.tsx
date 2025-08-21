import LoadingOverlay from '@/components/layout/LoadingOverlay';
import LeaderboardCard from '@/components/league/LeaderboardCard';
import TopThree from '@/components/league/TopThree';
import { useGetLeaderboard } from '@/hooks/useLeaderboard';
import { FlatList, View } from 'react-native';

const League = () => {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  console.log('leaderboard---', JSON.stringify(leaderboard, null, 2));

  if (isLoading) return <LoadingOverlay />;

  return (
    <View className="flex-1 bg-background pt-10 px-4">
      <TopThree />
      <FlatList
        data={leaderboard}
        contentContainerStyle={{ gap: 10, paddingBottom: 20, paddingTop: 10 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard user={item} index={index} />
        )}
        keyExtractor={(item) => item.user_id}
      />
    </View>
  );
};

export default League;
