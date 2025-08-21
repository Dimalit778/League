import {
  LeagueIcon,
  MatchesIcon,
  ProfileIcon,
  RankIcon,
} from '../../../../assets/icons';

import TabsHeader from '@/components/layout/TabsHeader';
import { useThemeStore } from '@/store/ThemeStore';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { theme } = useThemeStore();
  return (
    <>
      <TabsHeader />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme === 'dark' ? '#f9c04a' : '#f97316',
          tabBarInactiveTintColor: theme === 'dark' ? '#94a3b8' : '#6b7280',

          tabBarStyle: Platform.select({
            ios: {
              // position: "absolute",
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f3f4f6',
              borderTopWidth: 0,
            },
            android: {
              backgroundColor: theme === 'dark' ? '#1e293b' : '#f3f4f6',
              borderTopWidth: 0,
            },
            default: {},
          }),
        }}
      >
        <Tabs.Screen
          name="League"
          options={{
            title: 'League',
            headerShown: false,

            tabBarIcon: ({ color, size }) => (
              <LeagueIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Matches"
          options={{
            title: 'Matches',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MatchesIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Rank"
          options={{
            title: 'Rank',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <RankIcon size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <ProfileIcon size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
