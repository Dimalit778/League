import { useGetMatchesWithPredictions } from '@/hooks/useMatches';

import { MatchesWithTeamsAndPredictionsType } from '@/types';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { Error } from '../layout';
import { MatchStatus } from './MatchStatus';
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
      pathname: '/(app)/match/[id]',
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
            {/* Home Team */}
            <View className="flex-1 flex-row gap-2 items-center max-w-[40%]">
              <Text
                className="text-text text-sm flex-1 text-right"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {match.home_team.name}
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

            {/* Score Section */}
            <View className="items-center min-w-[60px] mx-3">
              <MatchStatus
                status={match.status}
                homeScore={match.score_fulltime_home ?? 0}
                awayScore={match.score_fulltime_away ?? 0}
                kickOffTime={match.kick_off}
              />
            </View>

            {/* Away Team */}
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
                {match.away_team.name}
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
      renderItem={({ item }) => <MatchItem match={item} />}
      showsVerticalScrollIndicator={false}
      keyExtractor={keyExtractor}
      refreshing={isLoading}
      onRefresh={handleRefresh}
    />
  );
};

export default MatchList;
