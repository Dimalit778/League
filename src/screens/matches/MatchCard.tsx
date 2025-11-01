import { MatchesWithTeamsAndPredictions } from '@/types';
import { useRouter } from 'expo-router';
import { memo, useMemo } from 'react';
import { Text, View } from 'react-native';

import { dateFormat, timeFormatTimezone } from '@/utils/formats';
import { Image as ExpoImage } from 'expo-image';
import { Pressable } from 'react-native';

type MatchItem = MatchesWithTeamsAndPredictions;

const matchStatusAreEqual = (p: any, n: any) =>
  p.match.status === n.match.status &&
  (p.match.score?.fullTime?.home ?? 0) ===
    (n.match.score?.fullTime?.home ?? 0) &&
  (p.match.score?.fullTime?.away ?? 0) ===
    (n.match.score?.fullTime?.away ?? 0) &&
  p.match.kick_off === n.match.kick_off;

const MatchStatusDisplay = memo(({ match }: { match: MatchItem }) => {
  if (match.status === 'SCHEDULED' || match.status === 'TIMED') {
    return (
      <View className=" items-center rounded-md border border-surface py-1">
        <Text className="text-muted text-xs">{dateFormat(match.kick_off)}</Text>
        <Text className="text-text">{timeFormatTimezone(match.kick_off)}</Text>
      </View>
    );
  }

  if (match.status === 'LIVE' || match.status === 'IN_PLAY') {
    return (
      <View className="items-center py-2">
        <Text className="text-green-500 text-sm">LIVE</Text>
        <View className="flex-row items-center justify-center">
          <Text className="text-text">{match.score?.fullTime?.home ?? 0}</Text>
          <Text className="text-text">-</Text>
          <Text className="text-text">{match.score?.fullTime?.away ?? 0}</Text>
        </View>
      </View>
    );
  }

  if (match.status === 'FINISHED') {
    return (
      <View className="items-center ">
        <View className="flex-row">
          <Text className="text-2xl font-regular text-text ">
            {match.score?.fullTime?.home ?? 0}
          </Text>
          <Text className="text-2xl font-regular text-text mx-1">-</Text>
          <Text className="text-2xl font-regular text-text">
            {match.score?.fullTime?.away ?? 0}
          </Text>
        </View>
        <Text className="text-sm text-muted">FT</Text>
      </View>
    );
  }

  return null;
}, matchStatusAreEqual);

const PredictionBadge = memo(
  ({
    homeScore,
    awayScore,
    isFinished,
    points,
  }: {
    homeScore: number;
    awayScore: number;
    isFinished: boolean;
    points: number;
  }) => {
    const badgeColor = useMemo(() => {
      if (isFinished) {
        return points === 5
          ? 'border-1 border-green-500 text-green-500'
          : points === 3
            ? 'border-1 border-yellow-500 text-yellow-500'
            : 'border-1 border-red-500 text-red-500';
      }
      return 'border border-muted text-muted';
    }, [points, isFinished]);

    return (
      <View
        className={`rounded-md bg-surface border border-border ${badgeColor} px-6 `}
      >
        <Text className={`font-regular text-base text-${badgeColor}`}>
          {homeScore} - {awayScore}
        </Text>
      </View>
    );
  }
);

export const MatchCard = ({ match }: { match: MatchItem }) => {
  const router = useRouter();
  const SIZE = 36;
  const prediction = match.predictions?.[0] ?? null;

  return (
    <Pressable
      className="mx-2 my-2 rounded-3xl bg-border relative"
      android_ripple={{ color: '#e5e7eb' }}
      onPress={() =>
        router.push({
          pathname: '/(app)/(member)/match/[id]',
          params: {
            id: match.id,
            match: JSON.stringify(match),
          },
        })
      }
    >
      {prediction && (
        <View className="absolute -top-2 left-1/2 -translate-x-1/2 ">
          <PredictionBadge
            homeScore={prediction.home_score}
            awayScore={prediction.away_score}
            isFinished={prediction.is_finished}
            points={prediction.points}
          />
        </View>
      )}
      <View className="flex-row justify-between items-center py-2">
        <View className="flex-1 gap-2 items-center ">
          <ExpoImage
            source={match.home_team.logo}
            style={{
              width: SIZE,
              height: SIZE,
            }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={0}
            priority="high"
          />
          <Text className="text-text" numberOfLines={1} ellipsizeMode="tail">
            {match.home_team.shortName}
          </Text>
        </View>

        <View className="min-w-[60px] mx-3 pt-3">
          <MatchStatusDisplay match={match} />
        </View>

        <View className="flex-1 gap-2  items-center">
          <ExpoImage
            source={match.away_team.logo}
            style={{
              width: SIZE,
              height: SIZE,
            }}
            cachePolicy="memory-disk"
            contentFit="contain"
            transition={0}
            priority="high"
          />
          <Text className="text-text " numberOfLines={1} ellipsizeMode="tail">
            {match.away_team.shortName}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};
export default MatchCard;
