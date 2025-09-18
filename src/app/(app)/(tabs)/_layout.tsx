import {
  LeagueIcon,
  MatchesIcon,
  ProfileIcon,
  RankIcon,
} from '../../../../assets/icons';

import { SplashScreen } from '@/components/layout';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useMemberStore } from '@/store/MemberStore';
import { Redirect, Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { member, isLoading } = useMemberStore();
  const { colors } = useThemeTokens();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!member) {
    return <Redirect href="/myLeagues" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: Platform.select({
          ios: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            borderTopColor: colors.border,
          },
          android: {
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            borderTopColor: colors.border,
          },
          default: {},
        }),
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="League"
        options={{
          title: 'League',
          tabBarIcon: ({ color, size }) => (
            <LeagueIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Matches"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color, size }) => (
            <MatchesIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size }) => (
            <RankIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
