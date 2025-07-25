import { Stack } from "expo-router";

export default function AuthLayout() {
  //   const { isSignedIn } = useAuth()

  //   if (isSignedIn) {
  //     <Redirect href={"/"} />
  //   }

  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: "Login" }} />
      <Stack.Screen name="sign-up" options={{ title: "Sign Up" }} />
    </Stack>
  );
}
