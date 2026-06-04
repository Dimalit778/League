import '../../global.css';

import '@/lib/i18n/autoTranslate';

import { SplashScreen as AppSplashScreen, NetworkStatusBanner } from '@/components/layout';
import { usePrimaryMember } from '@/features/members/hooks/useMembers';
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

  attachScreenshot: true,
  sendDefaultPii: true,
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
  ],
});

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

const AppBootstrap = () => {
  const ref = useNavigationContainerRef();
  const { isLoggedIn, isAuthLoading } = useAuth();

  const { colors } = useThemeTokens();
  const [isReady, setIsReady] = useState(false);

  const { status: memberStatus } = usePrimaryMember();
  const isMemberSettled = !isLoggedIn || memberStatus === 'success' || memberStatus === 'error';

  useEffect(() => {
    navigationIntegration.registerNavigationContainer(ref);
  }, [ref]);

  useEffect(() => {
    if (isAuthLoading || !isMemberSettled) return;

    let cancelled = false;

    const prepare = async () => {
      try {
        await Asset.fromModule(footballBg).downloadAsync();
      } catch (e: any) {
        console.error('[AppBootstrap] Error preparing app:', e);
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
  }, [isAuthLoading, isMemberSettled]);

  if (!isReady) {
    return <AppSplashScreen />;
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
