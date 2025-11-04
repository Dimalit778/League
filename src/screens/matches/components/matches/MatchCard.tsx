import { useThemeTokens } from '@/hooks/useThemeTokens';
import { MatchesWithTeamsAndPredictions, MatchScore } from '@/types';
import { Tables } from '@/types/database.types';
import { dateFormat, dayNameFormat } from '@/utils/formats';
import { AddIcon } from '@assets/icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

type MatchItem = MatchesWithTeamsAndPredictions;
type Prediction = Tables<'predictions'>;

const TEAM_LOGO_SIZE = 44;
const STATUS = {
  SCHEDULED: 'SCHEDULED',
  TIMED: 'TIMED',
  LIVE: 'LIVE',
  IN_PLAY: 'IN_PLAY',
  FINISHED: 'FINISHED',
} as const;

type MatchStatus = keyof typeof STATUS | string | null;

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
    <View
      className={`flex-row items-center justify-center border ${borderColor} rounded-md px-3 py-2`}
    >
      <Text className="text-text text-xl font-bold">{homeScore}</Text>
      <Text className="text-text text-lg mx-1">-</Text>
      <Text className="text-text text-xl font-bold">{awayScore}</Text>
    </View>
  )
);

const AddIconButton = memo(() => {
  const { colors } = useThemeTokens();
  return (
    <View className="items-center justify-center py-3 px-4">
      <View className="bg-surface/50 rounded-full p-2 border border-border/50">
        <AddIcon size={24} color={colors.muted} />
      </View>
    </View>
  );
});

const MatchStatusDisplay = memo(
  ({
    status,
    prediction,
  }: {
    status: string | null;
    prediction: Prediction | null;
    matchScore: MatchScore | null;
  }) => {
    const normalizedStatus = normalizeStatus(status);
    const hasPrediction = prediction !== null;
    const homeScore = prediction?.home_score ?? 0;
    const awayScore = prediction?.away_score ?? 0;
    const isScheduledOrTimed =
      normalizedStatus === STATUS.SCHEDULED ||
      normalizedStatus === STATUS.TIMED;
    const isLiveOrInPlay =
      normalizedStatus === STATUS.LIVE || normalizedStatus === STATUS.IN_PLAY;

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
      return <AddIconButton />;
    }

    return (
      <View className="flex-1 items-center justify-center">
        {isLiveOrInPlay && (
          <View className="bg-green-500/20 rounded-full px-2.5 py-0.5 mb-1">
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

const MatchHeader = memo(({ match }: { match: MatchItem }) => {
  return (
    <View className="flex-row items-center px-4 py-1 bg-muted">
      <View className="flex-1">
        <Text className="text-dark text-xs font-medium uppercase tracking-wide">
          {dayNameFormat(match.kick_off)}
        </Text>
      </View>
      <View className="min-w-[70px] mx-3 items-center">
        {match.status === STATUS.LIVE || match.status === STATUS.IN_PLAY ? (
          <Text className="text-green-200 text-xs font-bold">LIVE</Text>
        ) : (
          <Text className="text-dark text-xs font-bold">
            {match.score?.fullTime?.home ?? 0} -{' '}
            {match.score?.fullTime?.away ?? 0}
          </Text>
        )}
      </View>
      <View className="flex-1 items-end">
        <Text className="text-dark text-xs font-medium">
          {dateFormat(match.kick_off)}
        </Text>
      </View>
    </View>
  );
});
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
      <MatchHeader match={match} />

      <View className="flex-row justify-between  py-4 px-2">
        <TeamDisplay team={match.home_team} logoSize={TEAM_LOGO_SIZE} />

        <View className="min-w-[80px] max-w-[100px]">
          <MatchStatusDisplay
            status={match.status}
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
