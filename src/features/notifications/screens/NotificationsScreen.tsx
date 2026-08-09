import { EmptyState, Screen } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Stack } from 'expo-router';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('Notifications'),
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Screen contentClassName="flex-1 justify-center">
        <EmptyState icon={Bell} title={t('No notifications yet')} />
      </Screen>
    </>
  );
}
