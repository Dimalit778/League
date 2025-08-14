import { Button } from "@/shared/components/ui";
import { router } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 py-5">
        <View className="items-center mb-12">
          <View style={styles.logoContainer}>
            <Text className="text-2xl font-bold">⚽</Text>
          </View>
          <Text className="text-text text-2xl font-bold mb-4">
            Welcome to League
          </Text>
          <Text className="text-textMuted text-base mb-4 text-center px-5">
            Your ultimate football companion. Track leagues, follow matches, and
            stay connected with the beautiful game.
          </Text>
        </View>

        {/* Features Section */}
        <View className="mb-12">
          <View className="items-center mb-8">
            <Text className="text-2xl">🏆</Text>
            <Text className="text-text text-2xl font-bold mb-4">
              Live Standings
            </Text>
            <Text className="text-textMuted text-base mb-4 text-center px-5">
              Real-time league tables and team rankings
            </Text>
          </View>

          <View className="items-center mb-8">
            <Text className="text-2xl">⚽</Text>
            <Text className="text-text text-2xl font-bold mb-4">
              Match Updates
            </Text>
            <Text className="text-textMuted text-base mb-4 text-center px-5">
              Live scores and match notifications
            </Text>
          </View>

          <View className="items-center mb-8">
            <Text className="text-2xl">📊</Text>
            <Text className="text-text text-2xl font-bold mb-4">
              Statistics
            </Text>
            <Text className="text-textMuted text-base mb-4 text-center px-5">
              Detailed player and team analytics
            </Text>
          </View>
        </View>

        <Button
          title="Get Started"
          onPress={() => router.push("/signUp")}
          variant="secondary"
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
