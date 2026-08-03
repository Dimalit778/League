import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

export function LeaderboardTableHeader() {
  const { t } = useTranslation();

  return (
    <View className="mx-3 mb-1 flex-row items-center px-2 py-1">
      <Text variant="caption" className="w-6 font-semibold uppercase tracking-wide text-muted">#</Text>
      <Text variant="caption" className="flex-1 font-semibold uppercase tracking-wide text-muted">{t('User')}</Text>
      <Text variant="caption" className="w-14 text-center font-semibold uppercase tracking-wide text-muted">
        {t('Points')}
      </Text>
      <Text variant="caption" className="w-10 text-center font-semibold uppercase tracking-wide text-muted">
        {t('Correct Scores')}
      </Text>
      <Text variant="caption" className="w-10 text-center font-semibold uppercase tracking-wide text-muted">
        {t('Movement')}
      </Text>
    </View>
  );
}
