import LeaderboardCard from "@/components/cards/LeaderboardCard";
import { Loading } from "@/components/Loading";

import { useLeagueService } from "@/services/leagueService";
import { useQuery } from "@tanstack/react-query";
import { FlatList, View } from "react-native";

const Leaderboard = () => {
  const { getLeagueLeaderboard } = useLeagueService();
  const {
    data: leaderboard,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => getLeagueLeaderboard(),
  });

  if (isLoading) return <Loading />;
  if (error) {
    console.log("error  ", error);
  }
  console.log("leaderboard  ", JSON.stringify(leaderboard, null, 2));
  return (
    <View className="flex-1 bg-dark px-4 pt-6">
      <FlatList
        data={leaderboard?.data}
        contentContainerStyle={{ gap: 10, marginTop: 16, padding: 16 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard user={item} index={index + 1} />
        )}
        keyExtractor={(item) => item.user_id || ""}
      />
    </View>
  );
};

export default Leaderboard;
