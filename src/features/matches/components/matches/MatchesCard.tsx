import { CText } from '@/components/ui';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { useTranslation } from '@/hooks/useTranslation';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { AddIcon } from '@assets/icons';
import { Image as ExpoImage } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { MatchWithPredictionsType, PredictionType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import { getPredictionResultLabel } from '../../utils/pointsColor';
const TEAM_LOGO_SIZE = 32;

type MatchesCardProps = {
  match: MatchWithPredictionsType;
};
type TeamDisplayProps = {
  team: MatchWithPredictionsType['home_team'];
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

const TeamDisplay = ({ team }: TeamDisplayProps) => (
  <View className="flex-1  items-center ">
    <ExpoImage
      source={team.logo}
      style={{ width: TEAM_LOGO_SIZE, height: TEAM_LOGO_SIZE }}
      cachePolicy="memory-disk"
      contentFit="contain"
      transition={0}
      priority="high"
    />
    <CText className="text-text text-xs text-center mt-1">{team.tla}</CText>
  </View>
);

const ScoreDisplay = ({ isFinished, isLive, isScheduled, homeScore, awayScore }: ScoreDisplayProps) => {
  const { colors } = useThemeTokens();

  if (isFinished) {
    return (
      <View className="flex-row items-center">
        <CText className="text-muted text-xl ">{homeScore}</CText>
        <View className="w-0.5 h-full bg-border mx-3" />
        <CText className="text-muted text-xl ">{awayScore}</CText>
      </View>
    );
  }

  if (isLive) {
    return (
      <View className="items-center ">
        <View className="w-1.5 h-1.5 rounded-full bg-success" />
        <View className="flex-row items-center justify-center gap-1 mt-1">
          <CText className="text-text text-xl ">{homeScore}</CText>
          <CText className="text-text text-xl ">:</CText>
          <CText className="text-text text-xl ">{awayScore}</CText>
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
      <CText className="text-text text-xs font-bold">{dateStr}</CText>
      <CText className={isLive ? 'text-success text-xs ' : isFinished ? 'text-muted text-xs ' : 'text-text text-xs '}>
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
          <CText className="text-text text-sm" style={{ color: predictionResult?.color }}>
            {t(predictionResultTitle)}
          </CText>
        </View>
      )}

      <View className="flex-1 items-center">
        {isFinished && !predictionScore ? (
          <CText className="text-muted text-xs ">{t('No prediction')}</CText>
        ) : (
          <CText className="text-text text-sm">{predictionScore}</CText>
        )}
      </View>

      {isPredictionFinished && isFinished && points != null && (
        <View className="w-1/3 flex-row items-center justify-end">
          <CText className="text-text text-sm font-semibold" style={{ color: predictionResult?.color }}>
            {points} {t('pts')}
          </CText>
        </View>
      )}
    </View>
  );
};
export default function MatchesCard({ match }: MatchesCardProps) {
  const { colors } = useThemeTokens();

  const matchStatus = getMatchStatus(match.status);
  const prediction = match.predictions?.[0] ?? null;
  const homeScore = match.score?.fullTime?.home ?? null;
  const awayScore = match.score?.fullTime?.away ?? null;

  const isFinished = isMatchFinished(matchStatus);
  const isLive = isMatchLive(matchStatus);
  const isScheduled = isMatchScheduled(matchStatus);

  const predictionResult = getPredictionResultLabel(prediction?.points, prediction?.is_finished, isFinished);

  return (
    <View className="flex-1 max-w-[50%] ">
      <Link href={`/(app)/(member)/match/${match.id}`} asChild>
        <Pressable
          className="flex-1 m-1.5  rounded-md border border-border "
          style={{
            backgroundColor: isFinished ? hexToRgba(colors.surface, 0.4) : '',
            borderColor: predictionResult?.color,
          }}
        >
          <HeaderDisplay kickOff={match.kick_off} isScheduled={isScheduled} isLive={isLive} isFinished={isFinished} />

          <View className="flex-row py-3  ">
            <TeamDisplay team={match.home_team} />

            <ScoreDisplay
              isFinished={isFinished}
              isLive={isLive}
              isScheduled={isScheduled}
              homeScore={homeScore}
              awayScore={awayScore}
            />

            <TeamDisplay team={match.away_team} />
          </View>

          <View className="flex-1 bg-surface border-t border-border px-2 rounded-b-md">
            <PredictionDisplay prediction={prediction} isFinished={isFinished} />
          </View>
        </Pressable>
      </Link>
    </View>
  );
}
