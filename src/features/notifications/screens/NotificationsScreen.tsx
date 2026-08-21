import { EmptyState, Screen } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { Bell } from 'lucide-react-native';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  return (
    <Screen contentClassName="flex-1 justify-center">
      <EmptyState icon={Bell} title={t('No notifications yet')} />
    </Screen>
  );
}
