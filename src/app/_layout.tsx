import '../../global.css';

import { SplashScreen } from '@/components/layout/SplashScreen';
import { useAppStore } from '@/store/useAppStore';

import { themes } from '@/styles/color-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
  const { session, initializeSession, loading, theme } = useAppStore();

  const queryClient = new QueryClient();

  useEffect(() => {
    initializeSession();
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  const isLoggedIn = !!session;

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
