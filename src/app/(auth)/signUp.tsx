import useAuthStore from "@/store/AuthStore";
import { Link } from "expo-router";
import * as React from "react";
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SignUpScreen() {
  const { register, loading, error } = useAuthStore();
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");

  const [password, setPassword] = React.useState("");

  const onSignUpPress = async () => {
    const result = await register(email, password, firstName, lastName);
    if (!result) {
      Alert.alert("Error", "Invalid email or password");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={email}
        placeholder="Enter email"
        placeholderTextColor="#aaa"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={firstName}
        placeholder="First Name"
        placeholderTextColor="#aaa"
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        value={lastName}
        placeholder="Last Name"
        placeholderTextColor="#aaa"
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor="#aaa"
        secureTextEntry
        onChangeText={setPassword}
      />
      {error && <Text className="text-red-500">{error}</Text>}

      <Button title="Continue" onPress={onSignUpPress} />
      <View className="flex-row items-center gap-2 mt-4">
        <Text>Already have an account? </Text>
        <Link href="/(auth)/signIn">
          <Text className="text-primary">Sign in</Text>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "black",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "lightgrey",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: "white",
  },
});
