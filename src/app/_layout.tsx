import '../../global.css';

import { SplashScreen } from '@/components/layout';

import { supabase } from '@/lib/supabase';
import { useThemeStore } from '@/store/ThemeStore';

import { getThemeTokens, themes } from '@/lib/nativewind/themes';
import { useMemberStore } from '@/store/MemberStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

const InitialApp = () => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const theme = useThemeStore((state) => state.theme);

  const initializeMemberLeagues = useMemberStore(
    (state) => state.initializeMemberLeagues
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const [fontsLoaded] = useFonts({
    'Teko-Regular': require('@assets/fonts/Teko-Regular.ttf'),
    'Teko-Light': require('@assets/fonts/Teko-Light.ttf'),
    'Teko-Bold': require('@assets/fonts/Teko-Bold.ttf'),
    'Inter-Regular': require('@assets/fonts/Inter-Regular.otf'),
    'Inter-Light': require('@assets/fonts/Inter-Light-BETA.otf'),
  });

  useEffect(() => {
    initializeTheme();
    initializeMemberLeagues();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        supabase.auth.startAutoRefresh();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        supabase.auth.stopAutoRefresh();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      const isLoggedIn = !!session?.user;
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        supabase.auth.startAutoRefresh();
      }
      setLoading(false);
    });

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session?.user;

      setIsLoggedIn(isLoggedIn);
    });

    return () => {
      authSubscription.unsubscribe();
      subscription.remove();
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  if (loading || !fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <View className="flex-1" style={[themes[theme]]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: getThemeTokens(theme).colors.background,
          },
        }}
      >
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </View>
  );
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <KeyboardProvider>
          <InitialApp />
        </KeyboardProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
