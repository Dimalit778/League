import { ButtonC } from "@/components/ui";
import { useColorScheme } from "@/context/useColorSchema";
import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  const { colorScheme } = useColorScheme();
  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-5 py-5">
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Text className="text-2xl font-bold">⚽</Text>
          </View>
          <Text style={styles.title}>Welcome to League</Text>
          <Text style={styles.subtitle}>
            Your ultimate football companion. Track leagues, follow matches, and
            stay connected with the beautiful game.
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureTitle}>Live Standings</Text>
            <Text style={styles.featureDescription}>
              Real-time league tables and team rankings
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚽</Text>
            <Text style={styles.featureTitle}>Match Updates</Text>
            <Text style={styles.featureDescription}>
              Live scores and match notifications
            </Text>
          </View>

          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureTitle}>Statistics</Text>
            <Text style={styles.featureDescription}>
              Detailed player and team analytics
            </Text>
          </View>
        </View>
        <ButtonC
          title="Get Started"
          onPress={() => router.push("/signUp")}
          variant="primary"
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    alignItems: "center",
    marginBottom: 48,
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  featuresSection: {
    marginBottom: 48,
  },
  feature: {
    alignItems: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#F7F7F7",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonsContainer: {
    marginTop: "auto",
    paddingTop: 24,
  },
  primaryButton: {
    height: 52,
    backgroundColor: "#6366F1",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    boxShadow: "0px 2px 4px rgba(99, 102, 241, 0.2)",
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: 52,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
});
