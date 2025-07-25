import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAuthStore } from "../hooks/useAuthStore";
import { useAppStore } from "../hooks/useAppStore";
import { MatchCard } from "../components/MatchCard";
import { Button } from "../components/Button";
import { getLeagueMatches, getUserPredictions } from "../services/supabase";
import { Match, Prediction, RootStackParamList } from "../types";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuthStore();
  const { selectedLeague, userLeagues, loadUserLeagues } = useAppStore();

  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserLeagues(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedLeague) {
      loadMatches();
      loadPredictions();
    }
  }, [selectedLeague]);

  const loadMatches = async () => {
    if (!selectedLeague) return;

    try {
      setLoading(true);
      const { data, error } = await getLeagueMatches(
        selectedLeague.selected_league
      );
      if (error) {
        Alert.alert("Error", "Failed to load matches");
        return;
      }
      setMatches(data || []);
    } catch (error) {
      Alert.alert("Error", "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    if (!selectedLeague || !user) return;

    try {
      const { data, error } = await getUserPredictions(
        user.id,
        selectedLeague.id
      );
      if (error) {
        console.error("Failed to load predictions:", error);
        return;
      }
      setPredictions(data || []);
    } catch (error) {
      console.error("Failed to load predictions:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadMatches(), loadPredictions()]);
    setRefreshing(false);
  };

  const handleMatchPress = (match: Match) => {
    if (!selectedLeague) return;

    const now = new Date();
    const kickoff = new Date(match.kickoff);

    if (kickoff <= now) {
      Alert.alert(
        "Too Late",
        "You cannot make predictions after the match has started"
      );
      return;
    }

    navigation.navigate("PredictionDetails", {
      matchId: match.id,
      leagueId: selectedLeague.id,
    });
  };

  const getUserPredictionForMatch = (matchId: number) => {
    return predictions.find((p) => p.match_id === matchId);
  };

  const renderMatch = ({ item }: { item: Match }) => {
    const userPrediction = getUserPredictionForMatch(item.id);
    return (
      <MatchCard
        match={item}
        onPress={() => handleMatchPress(item)}
        showPrediction={!!userPrediction}
        userPrediction={userPrediction}
      />
    );
  };

  if (!selectedLeague && userLeagues.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Welcome to LeagueChampion!</Text>
        <Text style={styles.emptyText}>
          Start by creating your first league or joining an existing one.
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Create League"
            onPress={() => navigation.navigate("CreateLeague")}
            size="large"
          />
          <Button
            title="Join League"
            onPress={() => navigation.navigate("JoinLeague", {})}
            variant="secondary"
            size="large"
          />
        </View>
      </View>
    );
  }

  if (!selectedLeague && userLeagues.length > 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Select a League</Text>
        <Text style={styles.emptyText}>
          Go to the Leagues tab to select which league you want to view.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.leagueName}>{selectedLeague?.name}</Text>
        <Text style={styles.leagueType}>
          {selectedLeague?.selected_league.replace("_", " ").toUpperCase()}
        </Text>
      </View>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No upcoming matches found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    backgroundColor: "#fff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#C7C7CC",
  },
  leagueName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C1C1E",
  },
  leagueType: {
    fontSize: 14,
    color: "#8E8E93",
    marginTop: 4,
  },
  listContainer: {
    paddingVertical: 16,
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
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
    width: "100%",
  },
});
