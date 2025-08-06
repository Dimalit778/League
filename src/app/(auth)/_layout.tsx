import { ThemeProvider } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/useColorSchema";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
        <Stack.Screen
          name="signUp"
          options={{
            headerShown: true,
            headerTitle: "Sign Up",
          }}
        />
        <Stack.Screen
          name="signIn"
          options={{
            headerShown: true,
            headerTitle: "Sign In",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
