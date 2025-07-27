import { router } from "expo-router";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Welcome() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Logo/Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⚽</Text>
            </View>
            <Text style={styles.title}>Welcome to League</Text>
            <Text style={styles.subtitle}>
              Your ultimate football companion. Track leagues, follow matches,
              and stay connected with the beautiful game.
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

          {/* CTA Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/signUp")}
              accessibilityLabel="Create account"
              accessibilityHint="Sign up for a new account"
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/signIn")}
              accessibilityLabel="Sign in"
              accessibilityHint="Sign in to existing account"
            >
              <Text style={styles.secondaryButtonText}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
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
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
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
    color: "#1F2937",
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
    shadowColor: "#6366F1",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
