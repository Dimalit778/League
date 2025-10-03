import {
  LeagueIcon,
  MatchesIcon,
  ProfileIcon,
  RankIcon,
} from '../../../../assets/icons';

import { SplashScreen, TabsHeader } from '@/components/layout';
import { BottomTabsBar } from '@/components/layout/BottomTabsBar';
import { useMemberStore } from '@/store/MemberStore';
import { Redirect, Tabs, usePathname } from 'expo-router';

export default function TabLayout() {
  const { member, isLoading } = useMemberStore();
  const pathname = usePathname();

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!member) {
    return <Redirect href="/myLeagues" />;
  }

  // Hide tabs for edit screens
  const shouldHideTabs =
    pathname.includes('/edit-profile') || pathname.includes('/edit-league');

  return (
    <Tabs
      tabBar={(props) => (shouldHideTabs ? null : <BottomTabsBar {...props} />)}
      screenOptions={{
        header: () => <TabsHeader showLeagueName={true} />,
        tabBarHideOnKeyboard: true,
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
