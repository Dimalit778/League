import { Header } from "@/components/ui";
import ThemeToggle from "@/context/ThemeToggle";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
      <Stack.Screen
        name="signUp"
        options={{
          header: () => (
            <Header
              title="Sign Up"
              showBackButton
              rightElement={<ThemeToggle />}
            />
          ),
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          header: () => (
            <Header
              title="Sign In"
              showBackButton
              rightElement={<ThemeToggle />}
            />
          ),
        }}
      />
    </Stack>
  );
}
