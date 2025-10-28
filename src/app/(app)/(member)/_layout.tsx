import { useThemeTokens } from '@/hooks/useThemeTokens';
import { SettingsIcon, TrophyIcon } from '@assets/icons';
import { router, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function MemberLayout() {
  const { colors } = useThemeTokens();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerRight: () => (
            <TouchableOpacity
              accessibilityRole="button"
              className="p-2"
              onPress={() => router.push('/myLeagues')}
            >
              <TrophyIcon size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              accessibilityRole="button"
              className="p-2"
              onPress={() => router.push('/(app)/(public)/settings')}
            >
              <SettingsIcon size={24} color={colors.primary} />
            </TouchableOpacity>
          ),
          headerTitle: 'League',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            color: colors.primary,
            fontSize: 20,
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen name="match/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
    </Stack>
  );
}
