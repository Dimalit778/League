import {
  MatchesWithTeamsAndPredictions,
  MatchScore,
  PredictionLeaderboardType,
} from '@/types';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Text, View } from 'react-native';

import { dateFormat, timeFormatTimezone } from '@/utils/formats';
import { Image as ExpoImage } from 'expo-image';
import { TouchableOpacity } from 'react-native';

import PredictionStatus from './PredictionStatus';

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
      <View className=" items-center rounded-md border border-border py-1">
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
      <View className="flex-row justify-center items-center py-2">
        <Text className="text-xl font-bold text-text ">
          {match.score?.fullTime?.home ?? 0}
        </Text>
        <Text className="text-xl font-bold text-text mx-1">-</Text>
        <Text className="text-xl font-bold text-text">
          {match.score?.fullTime?.away ?? 0}
        </Text>
      </View>
    );
  }

  return null;
}, matchStatusAreEqual);

const matchItemAreEqual = (p: any, n: any) =>
  p.match.id === n.match.id &&
  p.match.status === n.match.status &&
  (p.match.score?.fullTime?.home ?? 0) ===
    (n.match.score?.fullTime?.home ?? 0) &&
  (p.match.score?.fullTime?.away ?? 0) ===
    (n.match.score?.fullTime?.away ?? 0) &&
  p.match.kick_off === n.match.kick_off &&
  p.match.predictions?.[0]?.id === n.match.predictions?.[0]?.id &&
  p.match.predictions?.[0]?.home_score ===
    n.match.predictions?.[0]?.home_score &&
  p.match.predictions?.[0]?.away_score === n.match.predictions?.[0]?.away_score;

export const MatchCard = ({ match }: { match: MatchItem }) => {
  const router = useRouter();
  const SIZE = 30;
  const prediction = match.predictions?.[0] ?? null;

  const score: MatchScore = match.score ?? {
    fullTime: { home: 0, away: 0 },
    halfTime: { home: 0, away: 0 },
    winner: null,
    duration: null,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
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
      <View className=" my-2 bg-surface border-b border-t border-border ">
        <PredictionStatus
          prediction={prediction as PredictionLeaderboardType}
          match={{
            score: match.score,
            status: match.status ?? 'SCHEDULED',
          }}
        />

        <View className="flex-row items-center">
          <View className=" flex-row gap-2 items-center max-w-[40%]">
            <Text
              className="text-text text-sm flex-1 text-right"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {match.home_team.shortName}
            </Text>
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
          </View>

          <View className="min-w-[60px] mx-3">
            <MatchStatusDisplay match={match} />
          </View>

          <View className=" flex-row gap-2 items-center max-w-[40%]">
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
            <Text
              className="text-text text-sm flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {match.away_team.shortName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default MatchCard;
