import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { useAuthStore } from "../hooks/useAuthStore";

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signIn, signUp, loading } = useAuthStore();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (isSignUp) {
      if (!displayName) {
        Alert.alert("Error", "Please enter your display name");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }

      const result = await signUp(email, password, displayName);
      if (!result.success) {
        Alert.alert("Sign Up Failed", result.error || "An error occurred");
      } else {
        Alert.alert(
          "Success",
          "Account created! Please check your email to verify your account."
        );
      }
    } else {
      const result = await signIn(email, password);
      if (!result.success) {
        Alert.alert("Sign In Failed", result.error || "An error occurred");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>LeagueChampion</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />

          {isSignUp && (
            <>
              <Input
                label="Display Name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your display name"
              />

              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirm your password"
              />
            </>
          )}

          <Button
            title={isSignUp ? "Sign Up" : "Sign In"}
            onPress={handleSubmit}
            loading={loading}
            size="large"
          />

          <Button
            title={
              isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"
            }
            onPress={() => setIsSignUp(!isSignUp)}
            variant="secondary"
            size="medium"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1C1C1E",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#8E8E93",
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
});
