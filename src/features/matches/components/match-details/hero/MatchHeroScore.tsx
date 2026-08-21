import { Divider, Row, Text } from '@/components';
import type { MatchPresentation } from '@/features/matches/model/matchPresentation';
import { dateFormat, formatTime } from '@/utils/formats';
import { View } from 'react-native';

type MatchHeroScoreProps = {
  homeScore: number | null;
  awayScore: number | null;
  kickOff: string;
  presentation: MatchPresentation;
};

export function MatchHeroScore({ homeScore, awayScore, kickOff, presentation }: MatchHeroScoreProps) {
  if (presentation.scoreMode !== 'score') {
    return (
      <View className="  items-center justify-center">
        <Text className="mt-2 text-3xl font-semibold text-white">{formatTime(kickOff)}</Text>
        <Divider className="my-0.5 h-px w-6 bg-gray-400" />

        <Row className="gap-1 ">
          <Text variant="bodySmall" className="font-semibold text-gray-400">
            {dateFormat(kickOff)}
          </Text>
        </Row>
      </View>
    );
  }

  return (
    <View className=" items-center justify-center gap-1">
      {presentation.isLive ? (
        <View className="items-center ">
          <Text variant="display" className="bg-red-500 text-primary">
            {homeScore} : {awayScore}
          </Text>

          <Text variant="label" className="text-center text-gray-400">
            {presentation.detailStatusLabel}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center justify-center rounded-xl border border-white/25 bg-black/20 px-4 py-2">
          <Text className="text-3xl font-bold text-white">{homeScore}</Text>
          <Text className="mx-2 text-2xl text-white/70">:</Text>
          <Text className="text-3xl font-bold text-white">{awayScore}</Text>
        </View>
      )}
    </View>
  );
}
