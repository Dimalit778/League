import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';
import { hexToRgba } from '@/utils/colorHexToRgba';
import { formatMatchdayDate, formatTime } from '@/utils/formats';
import { AddIcon } from '@assets/icons';
import { Image as ExpoImage } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { MatchWithPredictionsType, PredictionType } from '../../types';
import { getMatchStatus, isMatchFinished, isMatchLive, isMatchScheduled } from '../../utils/matchStatus';
import { getPointsColorKey, POINTS_COLOR } from '../../utils/pointsColor';
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
    <Text className="text-text text-xs text-center mt-1">{team.tla}</Text>
  </View>
);

const ScoreDisplay = ({ isFinished, isLive, isScheduled, homeScore, awayScore }: ScoreDisplayProps) => {
  const { colors } = useThemeTokens();

  if (isFinished) {
    return (
      <View className="flex-row items-center">
        <Text className="text-muted text-xl ">{homeScore}</Text>
        <View className="w-0.5 h-full bg-border mx-3" />
        <Text className="text-muted text-xl ">{awayScore}</Text>
      </View>
    );
  }

  if (isLive) {
    return (
      <View className="items-center ">
        <View className="w-1.5 h-1.5 rounded-full bg-success" />
        <View className="flex-row items-center justify-center gap-1 mt-1">
          <Text className="text-text text-xl ">{homeScore}</Text>
          <Text className="text-text text-xl ">:</Text>
          <Text className="text-text text-xl ">{awayScore}</Text>
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
  const dateStr = formatMatchdayDate(kickOff);
  const kickOffTime = formatTime(kickOff);

  return (
    <View className="flex-row items-center justify-between p-1 px-2  ">
      <Text className="text-text text-xs font-bold">{dateStr}</Text>
      <Text className={isLive ? 'text-success text-xs ' : isFinished ? 'text-muted text-xs ' : 'text-text text-xs '}>
        {isScheduled ? kickOffTime : isLive ? 'Live' : isFinished ? 'FT' : null}
      </Text>
    </View>
  );
};

const PredictionDisplay = ({ prediction, isFinished }: PredictionDisplayProps) => {
  const { colors } = useThemeTokens();
  const points = prediction?.points ?? 0;
  const isPredictionFinished = prediction?.is_finished ?? false;
  const predictionScore =
    prediction?.home_score && prediction?.away_score ? `${prediction.home_score} - ${prediction.away_score}` : null;
  const pointsColorKey = getPointsColorKey(points);
  const pointsTextColor = prediction?.is_finished ? POINTS_COLOR[pointsColorKey] : colors.text;

  return (
    <View className="flex-row items-center justify-between">
      {isPredictionFinished && isFinished && (
        <Text className="text-text text-sm" style={{ color: pointsTextColor }}>
          {pointsColorKey.charAt(0).toUpperCase() + pointsColorKey.slice(1)}
        </Text>
      )}

      <View className="flex-1 items-center">
        {isFinished && !predictionScore ? (
          <Text className="text-muted text-xs ">No prediction</Text>
        ) : (
          <Text className="text-text text-sm">{predictionScore}</Text>
        )}
      </View>

      {isPredictionFinished && isFinished && points != null && (
        <Text className="text-text text-sm font-semibold" style={{ color: pointsTextColor }}>
          {points} pts
        </Text>
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

  return (
    <Link href={`/(app)/(member)/match/${match.id}`} asChild>
      <Pressable
        className="flex-1 m-1.5  rounded-lg  border border-border "
        style={{ backgroundColor: isFinished ? hexToRgba(colors.surface, 0.4) : '' }}
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

        <View className="flex-1 bg-surface border-t border-border  px-2 ">
          <PredictionDisplay prediction={prediction} isFinished={isFinished} />
        </View>
      </Pressable>
    </Link>
  );
}
