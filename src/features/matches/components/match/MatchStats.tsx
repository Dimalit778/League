import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

export default function MatchStats({
  stats,
}: {
  stats: { label: string; home: number; away: number; isPercentage: boolean }[];
}) {
  const { t } = useTranslation();
  return (
    <View className="flex-1 bg-background items-center ">
      <View className=" mt-14 items-center justify-center">
        <CText className="text-text text-center text-3xl font-nunito-black">{t('Coming Soon...')}</CText>
      </View>
    </View>
  );
}
