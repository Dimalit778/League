import { TeamDisplay } from '@/components/shared';
import { useThemeTokens } from '@/hooks/useThemeTokens';
import { MatchesWithTeamsAndPredictions, MatchScore } from '@/types';
import { timeFormat } from '@/utils/formats';
import { getSimpleMatchStatus } from '@/utils/matchHelper';
import { AddIcon } from '@assets/icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Header from './header';
type MatchItemType = MatchesWithTeamsAndPredictions;

const TEAM_LOGO_SIZE = 44;
const STATUS = {
  SCHEDULED: 'SCHEDULED',
  PAUSED: 'PAUSED',
  TIMED: 'TIMED',
  LIVE: 'LIVE',
  IN_PLAY: 'IN_PLAY',
  FINISHED: 'FINISHED',
} as const;

const MatchScoreDisplay = memo(
  ({
    status,
    matchScore,
    kickOff,
  }: {
    status: string | null;
    matchScore: MatchScore | null;
    kickOff: string;
  }) => {
    const { colors } = useThemeTokens();
    const normalizedStatus = status?.toUpperCase() ?? '';
    const homeScore = matchScore?.fullTime?.home ?? 0;
    const awayScore = matchScore?.fullTime?.away ?? 0;

    const isLiveOrInPlay =
      normalizedStatus === STATUS.LIVE ||
      normalizedStatus === STATUS.IN_PLAY ||
      normalizedStatus === STATUS.PAUSED;

    const isScheduledOrTimed =
      normalizedStatus === STATUS.SCHEDULED ||
      normalizedStatus === STATUS.TIMED;

    if (isScheduledOrTimed) {
      return (
        <View className="flex-1 items-center">
          <View className="flex-row items-center justify-center gap-1">
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
          <Text className="text-muted text-2xl font-semibold ">
            {homeScore}
          </Text>

          <Text className="text-muted text-2xl ">:</Text>

          <Text className="text-muted text-2xl font-semibold">{awayScore}</Text>
        </View>
      </View>
    );
  }
);

MatchScoreDisplay.displayName = 'MatchScoreDisplay';


export default function MatchItem({ match }: { match: MatchItemType }) {
  const router = useRouter();
  const prediction = match.predictions?.[0] ?? null;
  const matchStatus = getSimpleMatchStatus(match.status);

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
      <Header
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
          />
        </View>

        <TeamDisplay team={match.away_team} logoSize={TEAM_LOGO_SIZE} />
      </View>
    </Pressable>
  );
}
