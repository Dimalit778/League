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
    <View className="w-full justify-center px-4 py-1">
      <View className="absolute start-4 z-10">
        <BackButton variant="onImage" />
      </View>

      <View className="items-center justify-center px-16" pointerEvents="none">
        <Text variant="subtitle" numberOfLines={1} className="text-center font-semibold">
          {competitionName}
        </Text>
        {matchday > 0 ? (
          <Text variant="label" className="text-gray-400">
            {`${t('Matchday')} ${matchday}`}
          </Text>
        ) : null}
      </View>

      <View className="absolute end-4">
        <Row className="gap-1">
          <Calendar size={14} color="#9ca3af" strokeWidth={2.2} />
          <Text variant="label" className="font-semibold text-gray-400">
            {dateFormat(kickOff)}
          </Text>
        </Row>
      </View>
    </View>
  );
}
