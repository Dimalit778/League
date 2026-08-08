import { FieldIcon, MatchesIcon, ProfileIcon, RankIcon } from '@assets/icons';

import { FloatBottomTabs, TabsHeader } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { t } = useTranslation();
  const { colors } = useThemeTokens();

  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      tabBar={isWeb ? () => null : (props) => <FloatBottomTabs {...props} />}
      screenOptions={{
        headerShown: true,
        header: ({ options }) => <TabsHeader title={typeof options.title === 'string' ? options.title : undefined} />,
        sceneStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('Home'),
          tabBarIcon: ({ color, size }) => <FieldIcon size={size} color={color} />,
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
        name="Leaderboard"
        options={{
          title: t('Leaderboard'),
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
