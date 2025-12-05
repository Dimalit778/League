// app/_layout.tsx (or similar)
import '../../global.css';

import { SplashScreen as AppSplashScreen, NetworkStatusBanner } from '@/components/layout';
import { AuthProvider, QueryProvider, ThemeProvider, useAuth } from '@/providers';
import { ErrorBoundaryProvider } from '@/providers/ErrorBoundaryProvider';
import { useMemberStore } from '@/store/MemberStore';
import { useThemeStore } from '@/store/ThemeStore';

import footballBg from '@assets/images/football-bg.png';
import { Nunito_400Regular, Nunito_700Bold, Nunito_900Black } from '@expo-google-fonts/nunito';
import { Teko_400Regular, Teko_700Bold } from '@expo-google-fonts/teko';
import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';

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
});

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

const AppBootstrap = () => {
  const ref = useNavigationContainerRef();
  const { isLoggedIn, isAuthLoading } = useAuth();
  const initializeMember = useMemberStore((s) => s.initializeMember);
  const initializeTheme = useThemeStore((s) => s.initializeTheme);
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
    if (!fontsLoaded || isAuthLoading) return;

    let cancelled = false;

    const prepare = async () => {
      try {
        await Promise.all([initializeTheme(), initializeMember(), Asset.fromModule(footballBg).downloadAsync()]);
      } catch (e) {
        } finally {
        if (!cancelled) {
          setIsReady(true);
          await ExpoSplashScreen.hideAsync().catch(() => {});
        }
      }
    };

    prepare();

    return () => {
      cancelled = true;
    };
  }, [fontsLoaded, isAuthLoading, initializeTheme, initializeMember]);

  if (!isReady) {
    return <AppSplashScreen />;
  }

  return (
    <>
      <NetworkStatusBanner />
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </>
  );
};

const RootLayout = () => (
  <ToastProvider>
    <ErrorBoundaryProvider>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider>
            {/* <NotificationProvider> */}
            <GestureHandlerRootView style={{ flex: 1 }}>
              <SafeAreaProvider>
                <KeyboardProvider>
                  <AppBootstrap />
                </KeyboardProvider>
              </SafeAreaProvider>
            </GestureHandlerRootView>
            {/* </NotificationProvider> */}
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundaryProvider>
  </ToastProvider>
);

export default Sentry.wrap(RootLayout);
