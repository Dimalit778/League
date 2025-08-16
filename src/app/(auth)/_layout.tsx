import { TopBar } from "@/shared/components/layout";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signUp"
        options={{
          header: () => <TopBar title="Sign Up" showBackButton />,
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          header: () => <TopBar title="Sign In" showBackButton />,
        }}
      />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
    </Stack>
  );
}
