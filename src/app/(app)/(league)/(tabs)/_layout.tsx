import { FieldIcon, MatchesIcon, ProfileIcon, RankIcon } from '@assets/icons';

import { FloatBottomTabs } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useIsFocused } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform } from 'react-native';

/** RN 7 dropped unmountOnBlur — remount tab content on leave so scroll resets. */
function UnmountOnBlur({ children }: { children: ReactNode }) {
  const isFocused = useIsFocused();
  if (!isFocused) return null;
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
          tabBarIcon: ({ color, size }) => <RankIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
