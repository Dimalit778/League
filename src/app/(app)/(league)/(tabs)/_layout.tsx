import { FieldIcon, MatchesIcon } from '@assets/icons';

import { FloatBottomTabs } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsFocused, useNavigation, useNavigationState } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import { Podium, UserIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';
function useLeagueStackOverlay() {
  const navigation = useNavigation();

  return useNavigationState(() => {
    let current = navigation.getParent();

    while (current) {
      const state = current.getState();
      if ('routeNames' in state && state.routeNames.includes('(tabs)')) {
        return state.index > 0;
      }
      current = current.getParent();
    }

    return false;
  });
}

function UnmountOnBlur({ children }: { children: ReactNode }) {
  const isFocused = useIsFocused();
  const isUnderStackOverlay = useLeagueStackOverlay();

  if (!isFocused && !isUnderStackOverlay) return null;
  return children;
}

export default function TabLayout() {
  const { colors } = useThemeTokens();
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      tabBar={isWeb ? () => null : (props) => <FloatBottomTabs {...props} />}
      screenLayout={({ children }) => <UnmountOnBlur>{children}</UnmountOnBlur>}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <FieldIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Matches"
        options={{
          tabBarIcon: ({ color, size }) => <MatchesIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Leaderboard"
        options={{
          tabBarIcon: ({ color, size }) => <Podium size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => <UserIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
