import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>⚽</Text>
      </View>
      <Text style={styles.title}>League</Text>
      <ActivityIndicator size="large" color="#6366F1" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    boxShadow: "0px 4px 8px rgba(99, 102, 241, 0.3)",
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 32,
  },
  loader: {
    marginTop: 20,
  },
});
