import { useGetLeaderboard } from "@/features/league/hooks/useLeagueMembers";
import { Loading } from "@/shared/components/ui";
import { useAppStore } from "@/store/useAppStore";

import { useState } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LeaderboardCard from "../components/LeaderboardCard";
import TopThree from "../components/TopThree";
export default function LeagueScreen() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState("Weekly");

  const { data: leaderboard, isLoading } = useGetLeaderboard(
    user?.primary_league_id!
  );

  if (isLoading) return <Loading />;

  const sortedLeaderboard =
    leaderboard?.slice().sort((a, b) => {
      return 0; // Keep original order for now
    }) || [];

  const topThreeData = [
    sortedLeaderboard[0] || null,
    sortedLeaderboard[1] || null,
    sortedLeaderboard[2] || null,
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TopThree topThree={topThreeData} />

      <View className="flex-1 px-4 pt-4">
        <FlatList
          data={sortedLeaderboard}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <LeaderboardCard member={item} index={index + 1} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
