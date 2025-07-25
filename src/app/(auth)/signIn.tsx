import ButtonC from "@/components/ui/ButtonC";
import TextInputC from "@/components/ui/TextInputC";
import { Feather, Fontisto } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const signIn = async () => {
    console.log("signIn");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <View style={styles.inputContainer}>
            <Fontisto
              name="email"
              size={20}
              color="#A0A0A0"
              style={styles.icon}
            />
            <TextInputC
              value={email}
              onChangeText={setEmail}
              placeholder="Email or Username"
              placeholderTextColor="#A0A0A0"
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color="#A0A0A0"
              style={styles.icon}
            />
            <TextInputC
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              secureTextEntry={!showPassword}
              style={styles.input}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#A0A0A0"
              />
            </TouchableOpacity>
          </View>
          {errMsg ? <Text style={styles.errorText}>{errMsg}</Text> : null}
          <ButtonC
            onPress={signIn}
            title="Login"
            loading={loading}
            style={styles.button}
          />
          <TouchableOpacity
            onPress={() => {
              /* Add forgot password functionality */
            }}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signUp")}>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
    fontFamily: "Poppins-Bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 15,
    fontFamily: "Poppins-Regular",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    marginBottom: 15,
  },
  forgotPassword: {
    color: "#007AFF",
    textAlign: "center",
    fontFamily: "Poppins-Regular",
    marginTop: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  footerText: {
    color: "#FFF",
    fontFamily: "Poppins-Regular",
  },
  signUpLink: {
    color: "#007AFF",
    fontWeight: "bold",
    fontFamily: "Poppins-Bold",
  },
});
