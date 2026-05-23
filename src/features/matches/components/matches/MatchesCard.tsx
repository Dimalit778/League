import { useThemeTokens } from '@/hooks/useThemeTokens';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { MatchWithPredictionsType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import { getPredictionResultLabel } from '../../utils/pointsColor';

import { MatchCardHeader, PredictionDisplay, ScoreDisplay, TeamDisplay } from './MatchCardDisplay';

type MatchesCardProps = {
  match: MatchWithPredictionsType;
};

export default memo(function MatchesCard({ match }: MatchesCardProps) {
  const { colors } = useThemeTokens();
  const isDesktop = useWindowDimensions().width > 768;

  const matchStatus = getMatchStatus(match.status);
  const prediction = match.predictions?.[0] ?? null;
  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;

  const isFinished = isMatchFinished(matchStatus);
  const isLive = isMatchLive(matchStatus);
  const isScheduled = isMatchScheduled(matchStatus);

  const predictionResult = getPredictionResultLabel(prediction?.points, prediction?.is_finished, isFinished);

  return (
    <View className="w-full">
      <Link href={`/(app)/(member)/match/${match.id}`} asChild>
        <Pressable
          className="m-1.5 rounded-md border "
          style={{
            ...(isFinished && { backgroundColor: hexToRgba(colors.surface, 0.4) }),
            ...(predictionResult ? { borderColor: predictionResult?.color } : { borderColor: colors.surface }),
          }}
        >
          <MatchCardHeader kickOff={match.kick_off} isScheduled={isScheduled} isLive={isLive} isFinished={isFinished} />

          <View className="flex-row py-3 ">
            <TeamDisplay team={match.home_team} isDesktop={isDesktop} />

            <ScoreDisplay
              isFinished={isFinished}
              isLive={isLive}
              isScheduled={isScheduled}
              homeScore={homeScore}
              awayScore={awayScore}
            />

            <TeamDisplay team={match.away_team} isDesktop={isDesktop} />
          </View>

          <View className="bg-surface justify-center border-t border-border rounded-b-md min-h-[18px] px-2">
            <PredictionDisplay prediction={prediction} isFinished={isFinished} />
          </View>
        </Pressable>
      </Link>
    </View>
  );
});
