import { useColorScheme } from "@/hooks/useColorSchema";
import { router, Stack } from "expo-router";
import { Button } from "react-native";

export default function AuthLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="forgotPassword" options={{ headerShown: true }} />
      <Stack.Screen
        name="signUp"
        options={{
          headerShown: true,
          headerTitle: "Sign Up",
          headerLeft: () => (
            <Button title="Back" onPress={() => router.back()} />
          ),
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#242424" : "#fff",
          },
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          gestureEnabled: true,
        }}
      />
      <Stack.Screen
        name="signIn"
        options={{
          headerShown: true,
          headerTitle: "Sign In",
          headerStyle: {
            backgroundColor: colorScheme === "dark" ? "#242424" : "#fff",
          },
          headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
