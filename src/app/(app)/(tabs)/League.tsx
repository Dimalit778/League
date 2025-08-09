import LeaderboardCard from "@/components/cards/LeaderboardCard";
import { Loading } from "@/components/Loading";

import { useGetLeaderboard } from "@/hooks/useLeagues";
import { FlatList, View } from "react-native";

const Leaderboard = () => {
  const { data: leaderboard, isLoading } = useGetLeaderboard();
  if (isLoading) return <Loading />;
  return (
    <View className="flex-1 bg-background px-1 pt-6">
      <FlatList
        data={leaderboard}
        contentContainerStyle={{ gap: 10, marginTop: 16, padding: 16 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard user={item} index={index + 1} />
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default Leaderboard;
