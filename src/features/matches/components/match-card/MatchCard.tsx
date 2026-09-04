import type { TextTone } from '@/components/ui/Text';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { deriveCardPresentation } from '../../model/matchPresentation';
import { MatchCardBg, type PredictionTab } from '../MatchCardBg';
import { getMatchCardMetrics } from '../matchCardLayout';
import { MatchCardPrediction } from './MatchCardPrediction';
import { MatchCardScore } from './MatchCardScore';
import { MatchCardStatus } from './MatchCardStatus';
import { MatchCardTeam } from './MatchCardTeam';
import type { MatchCardProps } from './types';

function pointsTone(points: number): TextTone {
  if (points >= 5) return 'gold'; // gold
  if (points > 0) return 'success'; // green
  return 'error'; // red
}

export const MatchCard = memo(function MatchCard({
  match,
  logoVariant = 'team',
  onPress,
  layoutWidth,
}: MatchCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const { t } = useTranslation();
  const presentation = deriveCardPresentation(match);
  const metrics = getMatchCardMetrics(layoutWidth ?? screenWidth);
  const logoWidth = metrics.logoBoxSize;
  const logoHeight = logoVariant === 'flag' ? Math.round((logoWidth * 2) / 3) : metrics.logoBoxSize;

  const points = presentation.predictionPoints;
  const scored = points != null;
  const topLabel = scored ? `+${points} ${t('pts')}` : presentation.status.label;
  // Muted by default; only a live match or a scored (finished) prediction keeps its colour.
  const topTone: TextTone = scored ? pointsTone(points) : presentation.isLive ? presentation.status.tone : 'muted';

  const predictionTab: PredictionTab = !presentation.isFinished
    ? 'neutral'
    : points == null
      ? match.prediction
        ? 'neutral'
        : 'miss'
      : points >= 5
        ? 'bingo'
        : points > 0
          ? 'hit'
          : 'miss';

  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${match.id}`))}
      accessibilityRole="button"
      accessibilityLabel={t('{{home}} versus {{away}}, {{status}}', {
        home: match.home.name,
        away: match.away.name,
        status: presentation.status.label,
      })}
      className="w-full items-center"
      style={{ opacity: presentation.isFinished ? 0.9 : 1 }}
    >
      <View
        style={{
          width: metrics.width,
          height: metrics.height,
        }}
      >
        <View className="absolute inset-0">
          <MatchCardBg width={metrics.width} height={metrics.height} predictionTab={predictionTab} />
        </View>

        <MatchCardStatus label={topLabel} tone={topTone} top={metrics.headerTop} emphasize={scored} />

        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{ top: metrics.contentTop, height: metrics.contentHeight, gap: metrics.gap }}
        >
          <MatchCardTeam
            team={match.home}
            width={metrics.teamWidth}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            opacity={presentation.isFinished ? 0.5 : 1}
          />
          <View style={{ width: metrics.centerWidth }}>
            <MatchCardScore score={presentation.score} />
          </View>
          <MatchCardTeam
            team={match.away}
            width={metrics.teamWidth}
            logoWidth={logoWidth}
            logoHeight={logoHeight}
            opacity={presentation.isFinished ? 0.5 : 1}
          />
        </View>

        <MatchCardPrediction
          prediction={presentation.prediction}
          top={metrics.predictionTop}
          height={metrics.predictionHeight}
        />
      </View>
    </Pressable>
  );
});
