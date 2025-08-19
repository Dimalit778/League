import {
  LeagueIcon,
  MatchesIcon,
  ProfileIcon,
  RankIcon,
} from '../../../../assets/icons';

import TabsHeader from '@/components/layout/TabsHeader';
import { useAppStore } from '@/store/useAppStore';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { theme } = useAppStore();
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
              <LeagueIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Matches"
          options={{
            title: 'Matches',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MatchesIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Rank"
          options={{
            title: 'Rank',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <RankIcon width={size} height={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <ProfileIcon width={size} height={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
