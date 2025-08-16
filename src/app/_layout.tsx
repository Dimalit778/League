import "../../global.css";

import { ThemeProvider } from "@/providers/ThemeProvider";
import SplashScreen from "@/shared/components/layout/SplashScreen";
import { useAppStore } from "@/store/useAppStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function RootLayout() {
  const { session, loading, initializeSession } = useAppStore();
  const initRef = useRef(false);

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
    if (!initRef.current) {
      initRef.current = true;
      initializeSession();
    }
  }, []);

  if (loading) {
    return <SplashScreen />;
  }
  const isLoggedIn = !!session;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
