import '../../global.css';

import { SplashScreen } from '@/components/layout';
import { supabase } from '@/lib/supabase';
import { useThemeStore } from '@/store/ThemeStore';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { initializeTheme } = useThemeStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    'Teko-Regular': require('../../assets/fonts/Teko-Regular.ttf'),
    'Teko-Light': require('../../assets/fonts/Teko-Light.ttf'),
    'Teko-Bold': require('../../assets/fonts/Teko-Bold.ttf'),
    'Inter-Regular': require('../../assets/fonts/Inter-Regular.otf'),
    'Inter-Light': require('../../assets/fonts/Inter-Light-BETA.otf'),
  });

  useEffect(() => {
    initializeTheme();

    // Monitor app state for session management
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App has come to the foreground, starting auto refresh');
        supabase.auth.startAutoRefresh();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App has gone to the background, stopping auto refresh');
        supabase.auth.stopAutoRefresh();
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isLoggedIn = !!session?.user;
      setIsLoggedIn(isLoggedIn);
      if (isLoggedIn) {
        // Ensure auto refresh is started
        supabase.auth.startAutoRefresh();
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', {
        event,
        session: !!session,
        user: !!session?.user,
      });

      const isLoggedIn = !!session?.user;
      console.log('Setting isLoggedIn to:', isLoggedIn);
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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack.Protected>

          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
