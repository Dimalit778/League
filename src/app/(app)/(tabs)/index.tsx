import { useAppStore } from "@/hooks/useAppStore";

import { useUserLeagues } from "@/hooks/useQueries";
import useAuthStore from "@/store/AuthStore";
import { League } from "@/types/database.types";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Button,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface LeagueCardProps {
  league: League;
  isSelected: boolean;
  onSelect: () => void;
}

const LeagueCard = ({ league, isSelected, onSelect }: LeagueCardProps) => {
  const getLeagueDisplayName = (league: string) => {
    const names = {
      premier_league: "Premier League",
      la_liga: "La Liga",
      bundesliga: "Bundesliga",
      serie_a: "Serie A",
      ligue_1: "Ligue 1",
    };
    return names[league as keyof typeof names] || league;
  };

  return (
    <TouchableOpacity
      style={[styles.leagueCard, isSelected && styles.selectedCard]}
      onPress={onSelect}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.leagueName}>{league.name}</Text>
        {isSelected && <Text style={styles.selectedIndicator}>Selected</Text>}
      </View>
      <Text style={styles.leagueType}>
        {getLeagueDisplayName(league.selected_league)}
      </Text>
      <Text style={styles.inviteCode}>Code: {league.invite_code}</Text>
    </TouchableOpacity>
  );
};

export default function MyLeagues() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { selectedLeague, setSelectedLeague } = useAppStore();

  // Use our React Query hook to fetch user leagues
  const {
    data: userLeaguesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useUserLeagues(user?.id || "");

  const handleLeagueSelect = (league: League) => {
    setSelectedLeague(league);
  };

  const renderLeague = ({ item }: { item: League }) => (
    <LeagueCard
      league={item}
      isSelected={selectedLeague?.id === item.id}
      onSelect={() => handleLeagueSelect(item)}
    />
  );

  // Extract leagues from the response
  const userLeagues =
    userLeaguesData?.data?.map((member) => member.league) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Leagues</Text>
        <View style={styles.headerButtons}>
          <Button
            title="Create"
            onPress={() => router.push("/(app)/(newLeague)/create-league")}
          />
          <Button
            title="Join"
            onPress={() => router.push("/(app)/(newLeague)/join-league")}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your leagues...</Text>
        </View>
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error Loading Leagues</Text>
          <Text style={styles.errorText}>
            {(error as Error)?.message || "Unknown error"}
          </Text>
          <Button title="Try Again" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={userLeagues}
          renderItem={renderLeague}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => refetch()}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            userLeagues.length === 0 && styles.emptyListContainer,
          ]}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Leagues Yet</Text>
              <Text style={styles.emptyText}>
                Create your first league or join an existing one to get started!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#C7C7CC",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  listContainer: {
    paddingVertical: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#8E8E93",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF3B30",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 16,
  },
  leagueCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leagueName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  selectedIndicator: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  leagueType: {
    fontSize: 16,
    color: "#8E8E93",
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 14,
    color: "#8E8E93",
    fontFamily: "monospace",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
  },
});
