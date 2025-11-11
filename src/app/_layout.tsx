import '../../global.css';

import {
  AppErrorBoundary,
  NetworkStatusBanner,
  SplashScreen,
} from '@/components/layout';

import { supabase } from '@/lib/supabase';
import { useThemeStore } from '@/store/ThemeStore';

import { getThemeTokens, themes } from '@/lib/nativewind/themes';
import { useMemberStore } from '@/store/MemberStore';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: 'https://014844ec8a09d0a4fac8a7fdbb0d17b1@o4510343122190336.ingest.de.sentry.io/4510343191265360',
  attachScreenshot: true,
  sendDefaultPii: true,
  enableLogs: true,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: false,
      maskAllImages: false,
      maskAllVectors: false,
    }),
    navigationIntegration,
    Sentry.spotlightIntegration(),
    Sentry.feedbackIntegration(),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const InitialApp = () => {
  const ref = useNavigationContainerRef();
  useEffect(() => {
    navigationIntegration.registerNavigationContainer(ref);
  }, [ref]);

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
      <NetworkStatusBanner />
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

const RootLayout = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <KeyboardProvider>
            <InitialApp />
          </KeyboardProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};
export default Sentry.wrap(RootLayout);
