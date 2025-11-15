import { AppErrorBoundary, NetworkStatusBanner, SplashScreen } from '@/components/layout';
import { useThemeStore } from '@/store/ThemeStore';
import { Nunito_400Regular, Nunito_700Bold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { Teko_400Regular, Teko_700Bold } from '@expo-google-fonts/teko';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../../global.css';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { themes } from '@/lib/nativewind/themes';
import { useAppStore } from '@/store/AppStore';
import { useMemberStore } from '@/store/MemberStore';

import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient({});
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

  const initializeMember = useMemberStore((state) => state.initializeMember);

  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const isAppReady = useAppStore((s) => s.isAppReady);
  const setHasHydrated = useAppStore((s) => s.setHasHydrated);
  const setIsAppReady = useAppStore((s) => s.setIsAppReady);

  const { isLoggedIn, isAuthLoading } = useAuth();

  const [fontsLoaded] = useFonts({
    Teko_700Bold,
    Teko_400Regular,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_900Black,
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeTheme();
      initializeMember();
    }
  }, [initializeTheme, initializeMember]);

  useEffect(() => {
    if (!hasHydrated && !isAuthLoading) {
      setHasHydrated(true);
    }
  }, [hasHydrated, isAuthLoading, setHasHydrated]);

  useEffect(() => {
    if (!isAppReady && hasHydrated && fontsLoaded) {
      setIsAppReady(true);
    }
  }, [isAppReady, hasHydrated, fontsLoaded, setIsAppReady]);

  if (!isAppReady) {
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
