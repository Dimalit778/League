import { useThemeTokens } from '@/features/settings/hooks/useThemeTokens';

import { getMatchStatus, getMatchStatusColor } from '@/features/matches/utils/matchStatus';
import { dateFormat, dayNameFormat, timeFormat } from '@/utils/formats';
import { AddIcon } from '@assets/icons';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { MatchWithPredictionsType, ScoreType } from '../../types';
const TEAM_LOGO_SIZE = 36;
const STATUS = {
  SCHEDULED: 'SCHEDULED',
  PAUSED: 'PAUSED',
  TIMED: 'TIMED',
  LIVE: 'LIVE',
  IN_PLAY: 'IN_PLAY',
  FINISHED: 'FINISHED',
} as const;

const MatchScoreDisplay = ({
  status,
  matchScore,
  kickOff,
}: {
  status: string | null;
  matchScore: ScoreType | null;
  kickOff: string;
}) => {
  const { colors } = useThemeTokens();
  const normalizedStatus = status?.toUpperCase() ?? '';
  const homeScore = matchScore?.fullTime?.home ?? 0;
  const awayScore = matchScore?.fullTime?.away ?? 0;

  const isLiveOrInPlay =
    normalizedStatus === STATUS.LIVE || normalizedStatus === STATUS.IN_PLAY || normalizedStatus === STATUS.PAUSED;

  const isScheduledOrTimed = normalizedStatus === STATUS.SCHEDULED || normalizedStatus === STATUS.TIMED;

  if (isScheduledOrTimed) {
    return (
      <View className="flex-1 items-center">
        <View className="flex-row items-center gap-2">
          <Ionicons name="time-outline" size={14} color={colors.text} />
          <Text className="text-text text-sm ">{timeFormat(kickOff)}</Text>
        </View>

        <View className="flex-1 items-center justify-center">
          <AddIcon size={30} color={'grey'} />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      {isLiveOrInPlay && (
        <View className="bg-green-500/20 rounded-full px-2.5 py-0.5 mb-2">
          <Text className="text-green-500 text-xs font-bold">LIVE</Text>
        </View>
      )}

      <View className="flex-row items-center justify-center gap-2">
        <Text className="text-muted text-2xl font-semibold ">{homeScore}</Text>

        <Text className="text-muted text-2xl ">:</Text>

        <Text className="text-muted text-2xl font-semibold">{awayScore}</Text>
      </View>
    </View>
  );
};

const PredictionScore = ({ prediction }: { prediction: { home_score: number; away_score: number } }) => (
  <Text className="text-background font-medium text-center">
    {prediction.home_score} - {prediction.away_score}
  </Text>
);

const MatchHeader = ({
  match,
  prediction,
  predictionFinished,
  gradientColors,
}: {
  match: MatchWithPredictionsType;
  prediction: MatchWithPredictionsType['predictions'][0] | null;
  predictionFinished: boolean;
  gradientColors: readonly [string, string, ...string[]];
}) => {
  if (predictionFinished && prediction) {
    return (
      <View className="flex-1">
        <LinearGradient colors={gradientColors}>
          <PredictionScore prediction={prediction} />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View className="bg-muted flex-row items-center justify-center px-4">
      <View className="flex-1">
        <Text className="text-background text-xs font-medium">{dayNameFormat(match.kick_off)}</Text>
      </View>

      <View className="min-w-[80px] mx-3">
        {prediction && (
          <LinearGradient colors={gradientColors}>
            <PredictionScore prediction={prediction} />
          </LinearGradient>
        )}
      </View>

      <View className="flex-1 items-end">
        <Text className="text-background text-xs font-medium">{dateFormat(match.kick_off)}</Text>
      </View>
    </View>
  );
};

const TeamDisplay = ({ team, size }: { team: { logo: string; shortName: string | null }; size: number }) => (
  <View className="flex-1 items-center gap-1">
    <ExpoImage
      source={team.logo}
      style={{ width: size, height: size }}
      cachePolicy="memory-disk"
      contentFit="contain"
      transition={0}
      priority="high"
    />
    <Text className="text-text text-sm font-semibold text-center" numberOfLines={1} ellipsizeMode="tail">
      {team.shortName ?? ''}
    </Text>
  </View>
);

export default function MatchesListCard({ match }: { match: MatchWithPredictionsType }) {
  const { colors } = useThemeTokens();
  const prediction = match.predictions?.[0] ?? null;
  const predictionFinished = prediction && prediction?.is_finished ? true : false;
  const points = prediction?.points ?? 0;

  const matchStatus = getMatchStatus(match.status);
  // const matchFinished = match.status === 'FINISHED';
  // const shouldShowHeader = !(matchFinished && prediction);
  const matchColors = getMatchStatusColor(matchStatus, predictionFinished, points, colors.muted);

  return (
    <Link href={`/(app)/(member)/match/${match.id}`} asChild>
      <Pressable className="mx-2  rounded-2xl bg-surface relative overflow-hidden">
        <MatchHeader
          match={match}
          prediction={prediction}
          predictionFinished={predictionFinished}
          gradientColors={matchColors}
        />

        <View className="flex-row justify-between py-2 ">
          <TeamDisplay team={match.home_team} size={TEAM_LOGO_SIZE} />

          <View className="min-w-[80px] max-w-[100px]">
            <MatchScoreDisplay status={matchStatus} kickOff={match.kick_off} matchScore={match.score} />
          </View>

          <TeamDisplay team={match.away_team} size={TEAM_LOGO_SIZE} />
        </View>
      </Pressable>
    </Link>
  );
}
