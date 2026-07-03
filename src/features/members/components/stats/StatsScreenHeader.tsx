import { CText } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import Trophy from '@assets/images/Trophy-champo.png';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StatsScreenHeaderProps = {
  leagueName: string;
};

export function StatsScreenHeader({ leagueName }: StatsScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-row items-center justify-between px-4 pb-2 pt-1">
      <View>
        <CText className="text-2xl font-black text-white">{leagueName}</CText>
        <CText className="text-sm text-[#97A7BF]">{t('Your stats')}</CText>
      </View>
      <Image source={Trophy} contentFit="contain" style={{ width: 52, height: 52 }} />
    </View>
  );
}
