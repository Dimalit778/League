import { useThemeTokens } from '@/hooks/useThemeTokens';

import { predictionAccuracy } from '@/utils/match-utils';
import { memo } from 'react';
import { Text, View } from 'react-native';

type PredictionStatusProps = {
  predHomeScore: number;
  predAwayScore: number;
  finalHomeScore: number | null;
  finalAwayScore: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'FINISHED';
};

const PredictionStatus = memo(
  ({
    predHomeScore,
    predAwayScore,
    finalHomeScore,
    finalAwayScore,
    status,
  }: PredictionStatusProps) => {
    const { colors } = useThemeTokens();
    if (
      !predHomeScore ||
      !predAwayScore ||
      !finalHomeScore ||
      !finalAwayScore
    ) {
      return null;
    }

    let accuracy = null;
    const isMatchFinished = status === 'FINISHED';
    const hasScores = finalHomeScore !== null && finalAwayScore !== null;

    if (isMatchFinished && hasScores) {
      accuracy = predictionAccuracy(
        predHomeScore,
        predAwayScore,
        finalHomeScore,
        finalAwayScore
      );
    }

    return (
      <View className="flex-row justify-between p-1 border-b border-border items-center ">
        <View className="w-1/3  ">
          <Text className="text-sm font-bold text-muted">{accuracy?.text}</Text>
        </View>
        <View className="w-1/3 items-center">
          <View className="items-center px-2">
            <Text
              className="text-text text-base font-bold "
              style={{ color: accuracy?.bg }}
            >
              {finalHomeScore ?? 0} - {finalAwayScore ?? 0}
            </Text>
          </View>
        </View>
        <View className="w-1/3 items-end">
          {accuracy && (
            <Text className=" text-sm font-bold text-muted">
              + {accuracy?.points ?? 0} pts
            </Text>
          )}
        </View>
      </View>
    );
  }
);

PredictionStatus.displayName = 'PredictionStatus';

export default PredictionStatus;
