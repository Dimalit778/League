import { BackButton, Row, Text } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';
import { dateFormat } from '@/utils/formats';
import { Calendar } from 'lucide-react-native';
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
        <Text variant="subtitle" numberOfLines={1} className="text-center font-semibold">
          {competitionName}
        </Text>

        <Text variant="label" className="text-gray-400">
          {`${t('Matchday')} ${matchday}`}
        </Text>
      </View>

      <Row className="gap-1 bg-subtle px-2 py-1 rounded-md absolute end-4">
        <Text variant="body" className="font-semibold text-white">
          {dateFormat(kickOff)}
        </Text>
        <Calendar size={16} color="white" strokeWidth={2} />
      </Row>
    </View>
  );
}
