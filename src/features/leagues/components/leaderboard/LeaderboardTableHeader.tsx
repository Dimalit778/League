import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

export function LeaderboardTableHeader() {
  const { t } = useTranslation();

  return (
    <View className="mx-3 mb-1 flex-row items-center px-2 py-1">
      <CText className="w-6 text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">#</CText>
      <CText className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">{t('User')}</CText>
      <CText className="w-14 text-center text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">
        {t('Points')}
      </CText>
      <CText className="w-10 text-center text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">
        {t('Correct Scores')}
      </CText>
      <CText className="w-10 text-center text-[10px] font-semibold uppercase tracking-wide text-[#97A7BF]">
        {t('Movement')}
      </CText>
    </View>
  );
}
