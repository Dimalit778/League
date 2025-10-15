import { useGetMatchesWithPredictions } from '@/hooks/useMatches';
import { dateFormat, timeFormatTimezone } from '@/utils/formats';

import { MatchesWithTeamsAndPredictionsType } from '@/types';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
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

const MatchList = ({
  selectedMatchday,
  competitionId,
  userId,
}: MatchListProps) => {
  const {
    data: matches,
    isLoading,
    error,
    refetch,
  } = useGetMatchesWithPredictions(selectedMatchday, competitionId, userId);

  const router = useRouter();
  const handlePress = (match: MatchItem) => {
    router.push({
      pathname: '/(app)/(member)/match/[id]',
      params: {
        id: match.id,
        match: JSON.stringify(match),
      },
    });
  };

  const MatchItem = useCallback(({ match }: { match: MatchItem }) => {
    const SIZE = 30;

    const prediction = match.predictions?.[0] ?? null;

    return (
      <TouchableOpacity activeOpacity={0.85} onPress={() => handlePress(match)}>
        <View className="p-2 my-1 bg-surface border-b border-t border-border   ">
          <PredictionStatus
            prediction={prediction}
            match={{
              home_score: match.score_fulltime_home ?? 0,
              away_score: match.score_fulltime_away ?? 0,
              status: match.status,
            }}
          />

          <View className="flex-row items-center">
            <View className="flex-1 flex-row gap-2 items-center max-w-[40%]">
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

            <View className="items-center min-w-[60px] mx-3">
              <View className="w-full">
                {match.status === 'SCHEDULED' ||
                  (match.status === 'TIMED' && (
                    <View className="flex-col items-center justify-center rounded-md border border-border py-1">
                      <Text className="text-muted text-xs">
                        {dateFormat(match.kick_off)}
                      </Text>
                      <Text className="text-text">
                        {timeFormatTimezone(match.kick_off)}
                      </Text>
                    </View>
                  ))}

                {match.status === 'LIVE' ||
                  (match.status === 'IN_PLAY' && (
                    <View className="flex-col items-center justify-center py-2">
                      <Text className="text-green-500 text-sm">LIVE</Text>
                      <View className="flex-row items-center justify-center">
                        <Text className="text-text">
                          {match.score_fulltime_home ?? 0}
                        </Text>
                        <Text className="text-text">-</Text>
                        <Text className="text-text">
                          {match.score_fulltime_away ?? 0}
                        </Text>
                      </View>
                    </View>
                  ))}

                {match.status === 'FINISHED' && (
                  <View className="flex-row justify-center py-2">
                    <Text className="text-xl font-bold text-text ">
                      {match.score_fulltime_home ?? 0}
                    </Text>
                    <Text className="text-xl font-bold text-text mx-1">-</Text>
                    <Text className="text-xl font-bold text-text">
                      {match.score_fulltime_away ?? 0}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="flex-1 flex-row gap-2 items-center max-w-[40%]">
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
  }, []);

  const keyExtractor = useCallback((item: MatchItem) => item.id.toString(), []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  if (isLoading) return <MatchesSkeleton />;
  if (error) return <Error error={error} />;

  return (
    <FlatList
      data={matches}
      showsVerticalScrollIndicator={false}
      keyExtractor={keyExtractor}
      refreshing={isLoading}
      onRefresh={handleRefresh}
      renderItem={({ item }) => <MatchItem match={item} />}
    />
  );
};

export default MatchList;
