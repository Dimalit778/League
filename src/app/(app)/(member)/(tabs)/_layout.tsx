import { FieldIcon, MatchesIcon, ProfileIcon, RankIcon, TrophyIcon } from '@assets/icons';

import { FloatBottomTabs, SidebarMenu, TabsHeader } from '@/components/layout';

import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  const isWeb = Platform.OS === 'web';

  return (
    <>
      <Tabs
        tabBar={isWeb ? () => null : (props) => <FloatBottomTabs {...props} />}
        screenOptions={{
          header: () => <TabsHeader />,
          tabBarHideOnKeyboard: true,
          sceneStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: t('Home'),
            tabBarIcon: ({ color, size }) => <FieldIcon size={size} color={color} />,
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
          name="Matches"
          options={{
            title: t('Matches'),
            tabBarIcon: ({ color, size }) => <MatchesIcon size={size} color={color} />,
          }}
        />

        <Tabs.Screen
          name="Profile"
          options={{
            title: t('Profile'),
            tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="Leagues"
          options={{
            title: t('Leagues'),
            tabBarIcon: ({ color, size }) => <TrophyIcon size={size} color={color} />,
          }}
        />
      </Tabs>
      {isWeb && <SidebarMenu />}
    </>
  );
}
