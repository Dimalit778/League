import { FieldIcon, MatchesIcon, ProfileIcon, RankIcon } from '@assets/icons';

import { FloatBottomTabs, SidebarMenu } from '@/components/layout';

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
          headerShown: false,

          sceneStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('Home'),
            headerShown: false,
            tabBarIcon: ({ color, size }) => <FieldIcon size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="Matches"
          options={{
            title: t('Matches'),
            headerShown: false,
            tabBarIcon: ({ color, size }) => <MatchesIcon size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="Leaderboard"
          options={{
            title: t('Leaderboard'),
            tabBarIcon: ({ color, size }) => <RankIcon size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="Profile"
          options={{
            title: t('Me'),
            tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} />,
          }}
        />
      </Tabs>
      {isWeb && <SidebarMenu />}
    </>
  );
}
