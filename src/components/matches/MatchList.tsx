import { useGetMatchesWithPredictions } from '@/hooks/useMatches';
import { dateFormat, timeFormatTimezone } from '@/utils/formats';

import { MatchesWithTeamsAndPredictionsType } from '@/types';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { memo, useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Error } from '../layout';
import PredictionStatus from './PredictionStatus';
import MatchesSkeleton from './SkeletonMatches';

type MatchItem = MatchesWithTeamsAndPredictionsType;
type MatchListProps = {
  selectedMatchday: number;
  competitionId: number;
  userId: string;
};

const matchStatusAreEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.match.status === nextProps.match.status &&
    prevProps.match.score_fulltime_home ===
      nextProps.match.score_fulltime_home &&
    prevProps.match.score_fulltime_away ===
      nextProps.match.score_fulltime_away &&
    prevProps.match.kick_off === nextProps.match.kick_off
  );
};

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
          <Text className="text-text">{match.score_fulltime_home ?? 0}</Text>
          <Text className="text-text">-</Text>
          <Text className="text-text">{match.score_fulltime_away ?? 0}</Text>
        </View>
      </View>
    );
  }

  if (match.status === 'FINISHED') {
    return (
      <View className="flex-row justify-center items-center py-2">
        <Text className="text-xl font-bold text-text ">
          {match.score_fulltime_home ?? 0}
        </Text>
        <Text className="text-xl font-bold text-text mx-1">-</Text>
        <Text className="text-xl font-bold text-text">
          {match.score_fulltime_away ?? 0}
        </Text>
      </View>
    );
  }

  return null;
}, matchStatusAreEqual);

const matchItemAreEqual = (prevProps: any, nextProps: any) => {
  return (
    prevProps.match.id === nextProps.match.id &&
    prevProps.match.status === nextProps.match.status &&
    prevProps.match.score_fulltime_home ===
      nextProps.match.score_fulltime_home &&
    prevProps.match.score_fulltime_away ===
      nextProps.match.score_fulltime_away &&
    prevProps.match.kick_off === nextProps.match.kick_off &&
    prevProps.match.predictions?.[0]?.id ===
      nextProps.match.predictions?.[0]?.id &&
    prevProps.match.predictions?.[0]?.home_score ===
      nextProps.match.predictions?.[0]?.home_score &&
    prevProps.match.predictions?.[0]?.away_score ===
      nextProps.match.predictions?.[0]?.away_score
  );
};

const MatchCardItem = memo(({ match }: { match: MatchItem }) => {
  const SIZE = 30;
  const prediction = match.predictions?.[0] ?? null;
  const router = useRouter();

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
      <View className="p-2 my-1 bg-surface border-b border-t border-border ">
        <PredictionStatus
          prediction={prediction}
          match={{
            home_score: match.score_fulltime_home ?? 0,
            away_score: match.score_fulltime_away ?? 0,
            status: match.status,
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
}, matchItemAreEqual);

export default function MatchList({
  selectedMatchday,
  competitionId,
  userId,
}: MatchListProps) {
  const {
    data: matches,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetMatchesWithPredictions(selectedMatchday, competitionId, userId);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (error) return <Error error={error} />;
  if (!matches && isLoading) return <MatchesSkeleton />;

  return (
    <FlatList
      data={matches}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      refreshing={isFetching}
      onRefresh={handleRefresh}
      renderItem={({ item }) => <MatchCardItem match={item} />}
      windowSize={5}
      updateCellsBatchingPeriod={100}
      getItemLayout={(_, index) => ({
        length: 120,
        offset: 120 * index,
        index,
      })}
      // Lazy loading optimizations
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      // Memory optimizations
      legacyImplementation={false}
      disableVirtualization={false}
    />
  );
}
