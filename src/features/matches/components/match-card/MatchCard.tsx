import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { deriveMatchPresentation } from '../../model/matchPresentation';
import { getMatchCardMetrics, MatchCardBg } from '../MatchCardBg';
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
  const metrics = getMatchCardMetrics(layoutWidth ?? screenWidth);
  const presentation = deriveMatchPresentation({ status: match.status, kickOff: match.kickOff });
  const logoWidth = metrics.logoBoxSize;
  const logoHeight = logoVariant === 'flag' ? Math.round((logoWidth * 2) / 3) : metrics.logoBoxSize;

  const hasResult = match.home.score != null && match.away.score != null;
  const showDateTab = !(presentation.isFinished && hasResult);
  const scoreLabel = hasResult ? `${match.home.score} - ${match.away.score}` : match.time;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${match.home.name}, ${scoreLabel}, ${match.away.name}`}
      onPress={onPress ?? (() => router.push(`/(app)/(league)/match/${match.id}`))}
      className="w-full items-center"
    >
      <View style={{ width: metrics.width, height: metrics.height }}>
        <View className="absolute inset-0">
          <MatchCardBg
            width={metrics.width}
            height={metrics.height}
            predictionStatus={match.predictionStatus}
            showDateTab={showDateTab}
          />
        </View>

        {showDateTab ? <MatchCardStatus presentation={presentation} date={match.date} top={metrics.headerTop} /> : null}

        <View
          className="absolute left-0 right-0 flex-row items-center justify-center"
          style={{ top: metrics.contentTop, height: metrics.contentHeight, gap: metrics.gap }}
        >
          <MatchCardTeam team={match.home} width={metrics.teamWidth} logoWidth={logoWidth} logoHeight={logoHeight} />
          <View style={{ width: metrics.centerWidth }} className="items-center justify-center">
            <MatchCardScore homeScore={match.home.score} awayScore={match.away.score} time={match.time} />
          </View>
          <MatchCardTeam team={match.away} width={metrics.teamWidth} logoWidth={logoWidth} logoHeight={logoHeight} />
        </View>

        <MatchCardPrediction
          prediction={match.prediction}
          predictionStatus={match.predictionStatus}
          presentation={presentation}
          top={metrics.predictionTop}
          height={metrics.predictionHeight}
        />
      </View>
    </Pressable>
  );
});
