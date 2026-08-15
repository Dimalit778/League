import { NavigationHeader } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

const AdminLayout = () => {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: true,
        fullScreenGestureEnabled: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          header: () => <NavigationHeader title={t('Admin')} fallbackHref="/(app)/(user)/settings" />,
        }}
      />
      <Stack.Screen
        name="users"
        options={{ header: () => <NavigationHeader title={t('User Management')} fallbackHref="/admin" /> }}
      />
      <Stack.Screen
        name="leagues"
        options={{ header: () => <NavigationHeader title={t('League Management')} fallbackHref="/admin" /> }}
      />
      <Stack.Screen
        name="league-members"
        options={{ header: () => <NavigationHeader title={t('League Members')} fallbackHref="/admin" /> }}
      />
      <Stack.Screen
        name="predictions"
        options={{ header: () => <NavigationHeader title={t('Predictions')} fallbackHref="/admin" /> }}
      />
      <Stack.Screen
        name="competitions"
        options={{ header: () => <NavigationHeader title={t('Competitions')} fallbackHref="/admin" /> }}
      />
      <Stack.Screen
        name="reports"
        options={{ header: () => <NavigationHeader title={t('Content Reports')} fallbackHref="/admin" /> }}
      />
    </Stack>
  );
};

export default AdminLayout;
