import LeaderboardCard from "@/components/cards/LeaderboardCard";

import { useAppStore } from "@/services/store/AppStore";
import { FlatList, View } from "react-native";

const Leaderboard = () => {
  const { primaryLeague } = useAppStore();
  console.log(
    "primary--------League  ",
    JSON.stringify(primaryLeague, null, 2)
  );

  return (
    <View className="flex-1 bg-dark px-4 pt-6">
      <FlatList
        data={[]}
        contentContainerStyle={{ gap: 10, marginTop: 16, padding: 16 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard user={item} index={index + 1} />
        )}
        // keyExtractor={(item) => item.league.id || ""}
      />
    </View>
  );
};

export default Leaderboard;
