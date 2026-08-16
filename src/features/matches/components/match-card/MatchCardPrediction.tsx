import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { CirclePlus } from 'lucide-react-native';
import { View } from 'react-native';
import type { MatchPresentation } from '../../model/matchPresentation';
import type { MatchCardData, PredictionDisplayStatus } from '../../utils/matchCard.mapper';

type MatchCardPredictionProps = {
  prediction: MatchCardData['prediction'];
  predictionStatus: PredictionDisplayStatus;
  presentation: MatchPresentation;
  top: number;
  height: number;
};

export function MatchCardPrediction({
  prediction,
  predictionStatus,
  presentation,
  top,
  height,
}: MatchCardPredictionProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();
  const hasPrediction = prediction?.home != null && prediction.away != null;

  if (presentation.isFinished && !hasPrediction) {
    return (
      <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top, height }}>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {t('No prediction')}
        </Text>
      </View>
    );
  }

  const predictionTextClass =
    predictionStatus === 'correct' ? 'text-success' : predictionStatus === 'incorrect' ? 'text-error' : 'text-info';

  return (
    <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top, height }}>
      {hasPrediction ? (
        <Text className={`${predictionTextClass} font-semibold leading-5`} numberOfLines={1}>
          {prediction.home} - {prediction.away}
        </Text>
      ) : (
        <CirclePlus size={20} color={colors.info} strokeWidth={1.8} />
      )}
    </View>
  );
}
