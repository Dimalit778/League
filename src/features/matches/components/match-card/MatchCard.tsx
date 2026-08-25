import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { deriveCardPresentation } from '../../model/matchPresentation';
import { MatchCardBg } from '../MatchCardBg';
import { getMatchCardMetrics } from '../matchCardLayout';
import { MatchCardPrediction } from './MatchCardPrediction';
import { MatchCardScore } from './MatchCardScore';
import { MatchCardStatus } from './MatchCardStatus';
import { MatchCardTeam } from './MatchCardTeam';
import type { MatchCardProps } from './types';

export const MatchCard = memo(function MatchCard({
  match,
  logoVariant = 'team',
  onPress,
  layoutWidth,
}: MatchCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const presentation = deriveCardPresentation(match);
  const compact = presentation.score.kind === 'score' && presentation.isFinished;
  const metrics = getMatchCardMetrics(layoutWidth ?? screenWidth, compact);
  const logoWidth = metrics.logoBoxSize;
  const logoHeight = logoVariant === 'flag' ? Math.round((logoWidth * 2) / 3) : metrics.logoBoxSize;
  const showDateTab = !compact;

  return (
    <Pressable
      onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${match.id}`))}
      accessibilityRole="button"
      className="w-full items-center"
    >
      <View
        style={{
          width: metrics.width,
          height: metrics.height,
        }}
      >
        <View className="absolute inset-0">
          <MatchCardBg
            width={metrics.width}
            height={metrics.height}
            predictionStatus={match.predictionStatus}
            showDateTab={showDateTab}
          />
        </View>

        {showDateTab ? <MatchCardStatus status={presentation.status} top={metrics.headerTop} /> : null}

        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{ top: metrics.contentTop, height: metrics.contentHeight, gap: metrics.gap }}
        >
          <MatchCardTeam team={match.home} width={metrics.teamWidth} logoWidth={logoWidth} logoHeight={logoHeight} />
          <View className="" style={{ width: metrics.centerWidth }}>
            <MatchCardScore score={presentation.score} />
          </View>
          <MatchCardTeam team={match.away} width={metrics.teamWidth} logoWidth={logoWidth} logoHeight={logoHeight} />
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
