import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Match } from "../types";

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  showPrediction?: boolean;
  userPrediction?: { home_score: number; away_score: number; points?: number };
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onPress,
  showPrediction = false,
  userPrediction,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const { date, time } = formatDate(match.kickoff);
  const isFinished = match.status === "finished";
  const isLive = match.status === "live";

  return (
    <TouchableOpacity
      style={[styles.container, isLive && styles.liveContainer]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.date}>{date}</Text>
        <Text style={styles.time}>{time}</Text>
        {isLive && <Text style={styles.liveIndicator}>LIVE</Text>}
      </View>

      <View style={styles.matchInfo}>
        <View style={styles.teamContainer}>
          <Text style={styles.teamName}>{match.home_team}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.teamName}>{match.away_team}</Text>
        </View>

        {isFinished && (
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>
              {match.home_score} - {match.away_score}
            </Text>
          </View>
        )}
      </View>

      {showPrediction && userPrediction && (
        <View style={styles.predictionContainer}>
          <Text style={styles.predictionLabel}>Your prediction:</Text>
          <Text style={styles.prediction}>
            {userPrediction.home_score} - {userPrediction.away_score}
          </Text>
          {userPrediction.points !== undefined && (
            <Text style={styles.points}>{userPrediction.points} pts</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  liveContainer: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF3B30",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: "#8E8E93",
  },
  time: {
    fontSize: 14,
    color: "#8E8E93",
  },
  liveIndicator: {
    fontSize: 12,
    color: "#FF3B30",
    fontWeight: "bold",
  },
  matchInfo: {
    alignItems: "center",
  },
  teamContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
    flex: 1,
  },
  vs: {
    fontSize: 14,
    color: "#8E8E93",
    marginHorizontal: 16,
  },
  scoreContainer: {
    marginTop: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    textAlign: "center",
  },
  predictionContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  predictionLabel: {
    fontSize: 14,
    color: "#8E8E93",
  },
  prediction: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  points: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#34C759",
  },
});
