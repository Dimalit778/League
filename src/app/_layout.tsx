import '../../global.css';

import { SplashScreen } from '@/components/layout';
import { supabase } from '@/lib/supabase';
import { useThemeStore } from '@/store/ThemeStore';
import { themes } from '@/styles/color-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  const { theme, initializeTheme } = useThemeStore();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeTheme();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
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
