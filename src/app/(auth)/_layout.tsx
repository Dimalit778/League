import { colors } from "@/constants/Colors";
import { useColorScheme } from "@/context/useColorSchema";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
      <Stack.Screen
        name="signUp"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Sign Up",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? colors.dark.background
                : colors.light.background,
          },
          headerTintColor:
            colorScheme === "dark"
              ? colors.dark.foreground
              : colors.light.foreground,
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Sign In",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? colors.dark.background
                : colors.light.background,
          },
          headerTintColor:
            colorScheme === "dark"
              ? colors.dark.foreground
              : colors.light.foreground,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
