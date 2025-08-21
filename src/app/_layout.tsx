import '../../global.css';

import { SplashScreen } from '@/components/layout';
import { useAuthStore } from '@/store/AuthStore';
import { useLeagueStore } from '@/store/LeagueStore';
import { useThemeStore } from '@/store/ThemeStore';
import { themes } from '@/styles/color-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const { user, initializeAuth, loading } = useAuthStore();
  const { theme, initializeTheme } = useThemeStore();
  const { initializeLeagues } = useLeagueStore();
  const queryClient = new QueryClient();

  useEffect(() => {
    initializeAuth();
    initializeTheme();
  }, []);

  // Initialize leagues whenever user changes
  useEffect(() => {
    if (user) {
      initializeLeagues(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return <SplashScreen />;
  }

  const isLoggedIn = !!user;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={themes[theme]} className="flex-1">
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
