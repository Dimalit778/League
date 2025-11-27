import { AppErrorBoundary, NetworkStatusBanner, SplashScreen } from '@/components/layout';
import { useThemeStore } from '@/store/ThemeStore';
import { Nunito_400Regular, Nunito_700Bold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { Teko_400Regular, Teko_700Bold } from '@expo-google-fonts/teko';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../../global.css';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { themes } from '@/lib/nativewind/themes';
import { useMemberStore } from '@/store/MemberStore';

import footballBg from '@assets/images/football-bg.png';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
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
  const theme = useThemeStore((state) => state.theme);
  const { isLoggedIn, isAuthLoading } = useAuth();

  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Teko_700Bold,
    Teko_400Regular,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900Black,
  });

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(ref);
  }, [ref]);

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        useThemeStore.getState().initializeTheme(),
        useMemberStore.getState().initializeMember(),
        Asset.fromModule(footballBg).downloadAsync(),
      ]);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isAuthLoading) {
      setIsReady(true);
    }
  }, [fontsLoaded, isAuthLoading]);

  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <View className="flex-1" style={[themes[theme]]}>
      <NetworkStatusBanner />
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <KeyboardProvider>
              <InitialApp />
            </KeyboardProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};
export default Sentry.wrap(RootLayout);
