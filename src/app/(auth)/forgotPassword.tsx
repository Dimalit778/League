import { useAuthStore } from "@/hooks/useAuthStore";

import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPassword() {
  const router = useRouter();
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleResetPassword = async () => {
    clearError();

    try {
      const result = await resetPassword(email.trim());

      if (result.success) {
        setIsSubmitted(true);
      } else {
        Alert.alert("Error", result.error || "An unexpected error occurred");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  const isFormValid = email.trim() && !emailError;

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a password reset link to {email}
            </Text>
            <Text style={styles.description}>
              Click the link in your email to reset your password. If you don't
              see it, check your spam folder.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setIsSubmitted(false)}
            >
              <Text style={styles.primaryButtonText}>Try Different Email</Text>
            </TouchableOpacity>

            <Link href="/(auth)/signIn" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your
            password
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                emailError ? styles.inputError : null,
                email ? styles.inputFilled : null,
              ]}
              value={email}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              onChangeText={setEmail}
              editable={!loading}
              accessibilityLabel="Email address"
              accessibilityHint="Enter your email address to reset password"
            />
            {emailError ? (
              <Text style={styles.fieldError}>{emailError}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              !isFormValid || loading ? styles.primaryButtonDisabled : null,
            ]}
            onPress={handleResetPassword}
            disabled={!isFormValid || loading}
            accessibilityLabel="Send reset link"
            accessibilityHint="Send password reset link to your email"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <Link href="/(auth)/signIn" asChild>
            <TouchableOpacity style={styles.secondaryButton} disabled={loading}>
              <Text style={styles.secondaryButtonText}>Back to Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#1F2937",
  },
  inputFilled: {
    borderColor: "#6366F1",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  fieldError: {
    fontSize: 12,
    color: "#DC2626",
    marginTop: 4,
  },
  primaryButton: {
    height: 48,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  secondaryButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
});
