import { LeagueIcon, MatchesIcon, ProfileIcon, RankIcon } from '@assets/icons';

import { TabsHeader } from '@/components/layout';
import { BottomTabsBar } from '@/components/layout/BottomTabs';
import { useTranslation } from '@/hooks/useTranslation';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      tabBar={(props) => <BottomTabsBar {...props} />}
      screenOptions={{
        header: () => <TabsHeader />,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="League"
        options={{
          title: t('League'),
          tabBarIcon: ({ color, size }) => <LeagueIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Matches"
        options={{
          title: t('Matches'),
          tabBarIcon: ({ color, size }) => <MatchesIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Stats"
        options={{
          title: t('Stats'),
          tabBarIcon: ({ color, size }) => <RankIcon size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Profile"
        options={{
          title: t('Profile'),
          tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
