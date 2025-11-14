import { LeagueIcon, MatchesIcon, ProfileIcon, RankIcon } from '@assets/icons';

import { TabsHeader } from '@/components/layout';
import { BottomTabsBar } from '@/components/layout/BottomTabs';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { colors } = useThemeTokens();

  return (
    <Tabs
      tabBar={(props) => <BottomTabsBar {...props} />}
      screenOptions={{
        header: () => <TabsHeader showLeagueName={true} />,
        tabBarHideOnKeyboard: true,
        contentStyle: {
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
