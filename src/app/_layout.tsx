import "../../global.css";

import { SplashScreen } from "@/components/SplashScreen";
import { useAuthStore } from "@/hooks/useAuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { session, loading } = useAuthStore();

  if (loading) {
    return <SplashScreen />;
  }

  const isLoggedIn = !!session;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
