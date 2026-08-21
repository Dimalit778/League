import { BackButton, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { View } from 'react-native';

export function MatchHeroMeta({
  kickOff,
  matchday,
  competitionName,
}: {
  kickOff: string;
  matchday: number;
  competitionName: string;
}) {
  const { t } = useTranslation();

  return (
    <View className="w-full justify-center ">
      <View className="absolute start-4 z-10">
        <BackButton variant="onImage" />
      </View>

      <View className="items-center justify-center px-16" pointerEvents="none">
        <Text variant="subtitle" numberOfLines={1} className=" text-white">
          {competitionName}
        </Text>

        <Text variant="label" className="text-gray-400">
          {`${t('Matchday')} ${matchday}`}
        </Text>
      </View>
    </View>
  );
}
