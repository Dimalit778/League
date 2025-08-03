import "../../global.css";

import { SplashScreen } from "@/components/SplashScreen";
import useAuthStore from "@/services/store/AuthStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";

export default function RootLayout() {
  const { session, initializeSession, loading } = useAuthStore();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    initializeSession();
  }, []);

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
