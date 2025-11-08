import { MatchesWithTeamsAndPredictions, MatchScore } from '@/types';
import { Tables } from '@/types/database.types';
import { timeFormat } from '@/utils/formats';
import { getSimpleMatchStatus } from '@/utils/matchHelper';
import { AddIcon } from '@assets/icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import MatchHeader from './MatchHeader';

type MatchItem = MatchesWithTeamsAndPredictions;
type Prediction = Tables<'predictions'>;

const TEAM_LOGO_SIZE = 44;
const STATUS = {
  SCHEDULED: 'SCHEDULED',
  PAUSED: 'PAUSED',
  TIMED: 'TIMED',
  LIVE: 'LIVE',
  IN_PLAY: 'IN_PLAY',
  FINISHED: 'FINISHED',
} as const;

const normalizeStatus = (status: string | null): string => {
  return status?.toUpperCase() ?? '';
};

const ScoreDisplay = memo(
  ({
    homeScore,
    awayScore,
    borderColor = 'border-border',
  }: {
    homeScore: number;
    awayScore: number;
    borderColor?: string;
  }) => (
    <View className="flex-row items-center justify-center ">
      <View className="flex-grow border border-border rounded-md items-center justify-center py-2">
        <Text className="text-text text-xl font-bold ">{homeScore}</Text>
      </View>
      <Text className="text-text text-xl mx-1">:</Text>
      <View className="flex-grow border border-border rounded-md items-center justify-center py-2">
        <Text className="text-text text-xl font-bold">{awayScore}</Text>
      </View>
    </View>
  )
);

const MatchScoreDisplay = memo(
  ({
    status,
    matchScore,
    prediction,
    kickOff,
  }: {
    status: string | null;
    prediction: Prediction | null;
    matchScore: MatchScore | null;
    kickOff: string;
  }) => {
    const normalizedStatus = normalizeStatus(status);
    const hasPrediction = prediction !== null;
    const homeScore = prediction?.home_score ?? 0;
    const awayScore = prediction?.away_score ?? 0;

    const isLiveOrInPlay =
      normalizedStatus === STATUS.LIVE ||
      normalizedStatus === STATUS.IN_PLAY ||
      normalizedStatus === STATUS.PAUSED;

    const isScheduledOrTimed =
      normalizedStatus === STATUS.SCHEDULED ||
      normalizedStatus === STATUS.TIMED;

    // Determine border color based on prediction points if finished
    const getBorderColor = (): string => {
      if (prediction?.is_finished) {
        const points = prediction.points ?? 0;
        if (points === 5) {
          return 'border-yellow-500';
        }
        if (points === 3) {
          return 'border-green-500';
        }
        if (points === 0) {
          return 'border-red-500';
        }
      }
      return 'border-border';
    };

    if (isScheduledOrTimed && !hasPrediction) {
      return (
        <View className="flex-1 items-center justify-center gap-2">
          <Text className="text-text">{timeFormat(kickOff)}</Text>
          <AddIcon size={30} color={'grey'} />
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

        <ScoreDisplay
          homeScore={homeScore}
          awayScore={awayScore}
          borderColor={getBorderColor()}
        />
      </View>
    );
  }
);

const TeamLogo = memo(({ logo, size }: { logo: string; size: number }) => (
  <View className="mb-2">
    <ExpoImage
      source={logo}
      style={{ width: size, height: size }}
      cachePolicy="memory-disk"
      contentFit="contain"
      transition={0}
      priority="high"
    />
  </View>
));

const TeamDisplay = memo(
  ({ team, logoSize }: { team: MatchItem['home_team']; logoSize: number }) => (
    <View className="flex-1 items-center">
      <TeamLogo logo={team.logo} size={logoSize} />
      <Text
        className="text-text text-sm font-semibold text-center px-1"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {team.shortName}
      </Text>
    </View>
  )
);

export const MatchCard = memo(({ match }: { match: MatchItem }) => {
  const router = useRouter();
  const prediction = match.predictions?.[0] ?? null;
  const matchStatus = getSimpleMatchStatus(match.status);

  console.log('match', JSON.stringify(match, null, 2));

  const handlePress = () => {
    router.push({
      pathname: '/(app)/(member)/match/[id]',
      params: {
        id: match.id,
        match: JSON.stringify(match),
      },
    });
  };

  return (
    <Pressable
      className="mx-2 my-2 rounded-3xl bg-surface relative overflow-hidden"
      android_ripple={{ color: '#e5e7eb' }}
      onPress={handlePress}
    >
      <MatchHeader
        status={matchStatus}
        kickOff={match.kick_off}
        prediction={prediction}
      />

      <View className="flex-row justify-between  py-4 px-2">
        <TeamDisplay team={match.home_team} logoSize={TEAM_LOGO_SIZE} />

        <View className="min-w-[80px] max-w-[100px]">
          <MatchScoreDisplay
            status={matchStatus}
            kickOff={match.kick_off}
            matchScore={match.score}
            prediction={prediction}
          />
        </View>

        <TeamDisplay team={match.away_team} logoSize={TEAM_LOGO_SIZE} />
      </View>
    </Pressable>
  );
});

MatchCard.displayName = 'MatchCard';

export default MatchCard;
