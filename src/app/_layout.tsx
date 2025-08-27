import '../../global.css';

import { SplashScreen } from '@/components/layout';
import { supabase } from '@/lib/supabase';
import { useMemberStore } from '@/store/MemberStore';
import { useThemeStore } from '@/store/ThemeStore';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { initializeTheme } = useThemeStore();
  const { initializeMembers } = useMemberStore();

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
        console.log('User is logged in, initializing member data');
        initializeMembers();
        // Ensure auto refresh is started
        supabase.auth.startAutoRefresh();
      }

      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth state changed: ${event}`, session?.user?.id);
      const isLoggedIn = !!session?.user;
      setIsLoggedIn(isLoggedIn);

      if (
        isLoggedIn &&
        (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')
      ) {
        initializeMembers();
      }
    });

    return () => {
      // Clean up subscriptions
      authSubscription.unsubscribe();
      subscription.remove();

      // Stop auto refresh when component unmounts
      supabase.auth.stopAutoRefresh();
    };
  }, []);

  if (loading || !fontsLoaded) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </QueryClientProvider>
  );
}
