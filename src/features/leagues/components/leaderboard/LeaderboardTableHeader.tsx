import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

export function LeaderboardTableHeader() {
  const { t } = useTranslation();

  return (
    <View className="mx-3 mb-1 flex-row items-center px-2 py-1">
      <Text className="w-6 text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">#</Text>
      <Text className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">{t('User')}</Text>
      <Text className="w-14 text-center text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">
        {t('Points')}
      </Text>
      <Text className="w-10 text-center text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">
        {t('Correct Scores')}
      </Text>
      <Text className="w-10 text-center text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">
        {t('Movement')}
      </Text>
    </View>
  );
}
