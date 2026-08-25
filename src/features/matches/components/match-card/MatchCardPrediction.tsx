import { Text } from '@/components';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { CirclePlus } from 'lucide-react-native';
import { View } from 'react-native';
import type { MatchUiPrediction } from '../../model/matchPresentation';

type MatchCardPredictionProps = {
  prediction: MatchUiPrediction;
  top: number;
  height: number;
};

export function MatchCardPrediction({ prediction, top, height }: MatchCardPredictionProps) {
  const { colors } = useThemeTokens();
  const { t } = useTranslation();

  return (
    <View className="absolute left-0 right-0 z-10 items-center justify-center" style={{ top, height }}>
      {prediction.kind === 'value' ? (
        <Text tone={prediction.tone} className="font-semibold leading-5" numberOfLines={1}>
          {prediction.text.replace('-', ' - ')}
        </Text>
      ) : prediction.kind === 'plus' ? (
        <CirclePlus size={20} color={colors.info} strokeWidth={1.8} />
      ) : (
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {t('No prediction')}
        </Text>
      )}
    </View>
  );
}
