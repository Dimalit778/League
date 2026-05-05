import { CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/nativeWind';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { AddIcon } from '@assets/icons';
import { Image as ExpoImage } from 'expo-image';
import { Link } from 'expo-router';
import { memo } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { MatchWithPredictionsType, PredictionType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import { getPredictionResultLabel } from '../../utils/pointsColor';
const TEAM_LOGO_SIZE = 32;

type MatchesCardProps = {
  match: MatchWithPredictionsType;
};
type TeamDisplayProps = {
  team: MatchWithPredictionsType['home_team'];
  isDesktop: boolean;
};
type ScoreDisplayProps = {
  isFinished: boolean;
  isLive: boolean;
  isScheduled: boolean;
  homeScore?: number | null;
  awayScore?: number | null;
};

type HeaderDisplayProps = {
  kickOff: string;
  isScheduled: boolean;
  isLive: boolean;
  isFinished: boolean;
};

type PredictionDisplayProps = {
  prediction: PredictionType | null;
  isFinished: boolean;
};

const TeamDisplay = ({ team, isDesktop }: TeamDisplayProps) => (
  <View className="flex-1  items-center ">
    <ExpoImage
      source={team.logo}
      style={{ width: TEAM_LOGO_SIZE, height: TEAM_LOGO_SIZE }}
      cachePolicy="memory-disk"
      contentFit="contain"
      transition={0}
      priority="high"
    />
    <CText variant="caption" className="text-center mt-2">
      {isDesktop ? team.shortName : team.tla}
    </CText>
  </View>
);

const ScoreDisplay = ({ isFinished, isLive, isScheduled, homeScore, awayScore }: ScoreDisplayProps) => {
  const { colors } = useThemeTokens();

  if (isFinished) {
    return (
      <View className="flex-row items-center">
        <CText variant="h3" className="text-muted ">
          {homeScore}
        </CText>
        <View className="w-0.5 h-full bg-border mx-3" />
        <CText variant="h3" className="text-muted ">
          {awayScore}
        </CText>
      </View>
    );
  }

  if (isLive) {
    return (
      <View className="items-center ">
        <View className="w-1.5 h-1.5 rounded-full bg-success" />
        <View className="flex-row items-center justify-center gap-1 mt-1">
          <CText variant="h3" className="text-text ">
            {homeScore}
          </CText>
          <CText variant="h3" className="text-text ">
            :
          </CText>
          <CText variant="h3" className="text-text ">
            {awayScore}
          </CText>
        </View>
      </View>
    );
  }

  if (isScheduled) {
    return (
      <View className=" items-center justify-center ">
        <AddIcon size={24} color={colors.text} />
      </View>
    );
  }

  return null;
};

const HeaderDisplay = ({ kickOff, isScheduled, isLive, isFinished }: HeaderDisplayProps) => {
  const { t, language } = useTranslation();
  const locale = language === 'he' ? 'he-IL' : 'en-GB';
  const dateStr = formatMatchdayDate(kickOff, locale);
  const kickOffTime = formatTime(kickOff);

  return (
    <View className="flex-row items-center justify-between p-1 px-2  ">
      <CText variant="caption" className={isScheduled ? 'text-text' : 'text-muted'}>
        {dateStr}
      </CText>
      <CText variant="caption" className={cn(isLive ? 'text-success ' : isFinished ? 'text-muted ' : 'text-text ')}>
        {isScheduled ? kickOffTime : isLive ? t('Live') : isFinished ? t('FT') : null}
      </CText>
    </View>
  );
};

const PredictionDisplay = ({ prediction, isFinished }: PredictionDisplayProps) => {
  const { t } = useTranslation();
  const points = prediction?.points ?? 0;
  const isPredictionFinished = prediction?.is_finished ?? false;
  const predictionScore =
    prediction?.home_score !== null &&
    prediction?.away_score !== null &&
    prediction?.home_score !== undefined &&
    prediction?.away_score !== undefined
      ? `${prediction.home_score} - ${prediction.away_score}`
      : null;
  const predictionResult = getPredictionResultLabel(prediction?.points, isPredictionFinished, isFinished);
  const predictionResultTitle = predictionResult?.title ?? '';
  return (
    <View className="flex-row items-center justify-between">
      {isPredictionFinished && isFinished && (
        <View className="w-1/3 flex-row items-center">
          <CText variant="caption" className="text-text" style={{ color: predictionResult?.color }}>
            {t(predictionResultTitle)}
          </CText>
        </View>
      )}

      <View className="flex-1 items-center">
        {isFinished && !predictionScore ? (
          <CText variant="caption" className="text-muted ">
            {t('No prediction')}
          </CText>
        ) : (
          <CText variant="caption" className="text-text ">
            {predictionScore}
          </CText>
        )}
      </View>

      {isPredictionFinished && isFinished && points != null && (
        <View className="w-1/3 flex-row items-center justify-end">
          <CText variant="caption" className="text-text" style={{ color: predictionResult?.color }}>
            {points} {t('pts')}
          </CText>
        </View>
      )}
    </View>
  );
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
    <View className="w-1/2">
      <Link href={`/(app)/(member)/match/${match.id}`} asChild>
        <Pressable
          className="m-1.5 rounded-md border "
          style={{
            ...(isFinished && { backgroundColor: hexToRgba(colors.surface, 0.4) }),
            ...(predictionResult ? { borderColor: predictionResult?.color } : { borderColor: colors.surface }),
          }}
        >
          <HeaderDisplay kickOff={match.kick_off} isScheduled={isScheduled} isLive={isLive} isFinished={isFinished} />

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
