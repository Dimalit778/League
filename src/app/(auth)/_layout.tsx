import { TopBar } from "@/shared/components/layout";
import ThemeToggle from "@/shared/components/ui/ThemeToggle";
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
            <TopBar
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
            <TopBar
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
