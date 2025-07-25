import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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
    <View className="flex-1 justify-center items-center bg-background p-4">
      <View className="bg-surface p-6 rounded-lg w-full max-w-sm">
        <Text className="text-textPrimary text-2xl font-bold text-center mb-4">
          Welcome Back
        </Text>
        <Text className="text-textSecondary text-base text-center mb-6">
          Testing Tailwind Classes
        </Text>

        {/* Test various Tailwind classes */}
        <View className="bg-primary p-3 rounded mb-3">
          <Text className="text-white text-center">Primary Color Test</Text>
        </View>

        <View className="bg-secondary p-3 rounded mb-3">
          <Text className="text-black text-center">Secondary Color Test</Text>
        </View>

        <View className="border border-border p-3 rounded">
          <Text className="text-textPrimary text-center">Border Test</Text>
        </View>
      </View>
    </View>
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
