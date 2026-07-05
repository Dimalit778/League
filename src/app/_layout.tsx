import '../../global.css';

import '@/lib/i18n/autoTranslate';

import { LoadingBall, NetworkStatusBanner } from '@/components/layout';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import {
  AlertProvider,
  AuthProvider,
  ErrorBoundaryProvider,
  LanguageProvider,
  PurchasesProvider,
  QueryProvider,
  ThemeProvider,
  useAuth,
} from '@/providers';

import footballBg from '@/assets/images/football-bg.png';
import * as Sentry from '@sentry/react-native';
import { Asset } from 'expo-asset';
import { Stack, useNavigationContainerRef } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from 'react-native-toast-notifications';
const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: true,
});

Sentry.init({
  dsn: 'https://014844ec8a09d0a4fac8a7fdbb0d17b1@o4510343122190336.ingest.de.sentry.io/4510343191265360',

  enabled: !__DEV__ && Platform.OS !== 'web',

  attachScreenshot: false,
  sendDefaultPii: false,
  tracesSampleRate: 0.2,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,

  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllText: true,
      maskAllImages: true,
      maskAllVectors: true,
    }),
    navigationIntegration,
  ],
});

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

const BOOT_ASSETS_TIMEOUT_MS = 2500;

const AppBootstrap = () => {
  const ref = useNavigationContainerRef();
  const { isLoggedIn, isAuthLoading } = useAuth();

  const { colors } = useThemeTokens();
  const [isAppShellReady, setIsAppShellReady] = useState(false);

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(ref);
  }, [ref]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const prepare = async () => {
      const bootAssetsTimeout = new Promise<void>((resolve) => {
        timeoutId = setTimeout(resolve, BOOT_ASSETS_TIMEOUT_MS);
      });
      const bootAssets = Asset.fromModule(footballBg)
        .downloadAsync()
        .then(() => undefined)
        .catch((e: unknown) => {
          console.error('[AppBootstrap] Error preparing app:', e);
        });

      try {
        await Promise.race([bootAssets, bootAssetsTimeout]);
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (!cancelled) {
          setIsAppShellReady(true);
          await ExpoSplashScreen.hideAsync().catch(() => {});
        }
      }
    };

    prepare();

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (!isAppShellReady || isAuthLoading) {
    return <LoadingBall />;
  }

  return (
    <>
      <NetworkStatusBanner />
      <Stack screenOptions={{ contentStyle: { backgroundColor: colors.background } }}>
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
          <PurchasesProvider>
            <ThemeProvider>
              <LanguageProvider>
                <AlertProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <SafeAreaProvider>
                      <KeyboardProvider>
                        <AppBootstrap />
                      </KeyboardProvider>
                    </SafeAreaProvider>
                  </GestureHandlerRootView>
                </AlertProvider>
              </LanguageProvider>
            </ThemeProvider>
          </PurchasesProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundaryProvider>
  </ToastProvider>
);

export default Sentry.wrap(RootLayout);
