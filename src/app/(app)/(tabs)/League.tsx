import LeaderboardCard from "@/components/cards/LeaderboardCard";
import PreviewLeagueCard from "@/components/cards/PreviewLeagueCard";
import { useLeagueService } from "@/services/leagueService";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

const Leaderboard = () => {
  const { getLeagueLeaderboard } = useLeagueService();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [league, setLeague] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const getLeaderboard = async () => {
    const { data, error } = await getLeagueLeaderboard();

    setLeaderboard(data as any);
    setLoading(false);
  };
  useEffect(() => {
    getLeaderboard();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 12 }}>Loading leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* League Card */}
      {league && (
        <PreviewLeagueCard
          leagueName={league.name}
          competitionName={league.competitions?.name}
          competitionFlag={league.competitions?.flag}
          competitionLogo={league.competitions?.logo}
          competitionCountry={league.competitions?.country}
        />
      )}

      <FlatList
        data={leaderboard}
        contentContainerStyle={{ gap: 10, marginTop: 16, padding: 16 }}
        renderItem={({ item, index }) => (
          <LeaderboardCard user={item} index={index + 1} />
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default Leaderboard;
