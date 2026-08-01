import { images } from '@/assets/images';
import { Text } from '@/components/ui';
import { useTranslation } from '@/hooks/useTranslation';
import { Image } from 'expo-image';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type LeaderboardScreenHeaderProps = {
  leagueName: string;
};

export function LeaderboardScreenHeader({ leagueName }: LeaderboardScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={{ paddingTop: insets.top }} className="flex-row items-center justify-between px-4 pb-2 pt-1">
      <View>
        <Text className="text-2xl font-black text-white">{leagueName}</Text>
        <Text className="text-sm text-muted">{t('League table')}</Text>
      </View>
      <Image source={images.trophyGold} contentFit="contain" style={{ width: 52, height: 52 }} />
    </View>
  );
}
