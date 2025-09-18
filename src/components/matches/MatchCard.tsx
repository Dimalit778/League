import { FixturesWithTeamsAndPredictionsType } from '@/types';

import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { MatchStatus } from './MatchStatus';
import PredictionStatus from './PredictionStatus';

type MatchItem = FixturesWithTeamsAndPredictionsType;

const MatchCard = ({ match }: { match: MatchItem }) => {
  const router = useRouter();
  const SIZE = 30;
  const homeTeamName = match.home_team.name;
  const awayTeamName = match.away_team?.name;

  const homeCrestUrl = match.home_team.logo;
  const awayCrestUrl = match.away_team.logo;

  const prediction = match.predictions?.[0] ?? null;

  const handlePress = (match: MatchItem) => {
    router.push({
      pathname: '/(app)/match/[id]',
      params: {
        id: match.id,
        match: JSON.stringify(match),
      },
    });
  };

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => handlePress(match)}>
      <View className="p-2 my-1 bg-surface border-b border-t border-border   ">
        <PredictionStatus
          prediction={prediction}
          match={{
            home_score: match.home_score ?? 0,
            away_score: match.away_score ?? 0,
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
              {homeTeamName}
            </Text>
            <ExpoImage
              source={homeCrestUrl}
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
              homeScore={match.home_score ?? 0}
              awayScore={match.away_score ?? 0}
              kickOffTime={match.kickoff_time}
            />
          </View>

          {/* Away Team */}
          <View className="flex-1 flex-row gap-2 items-center max-w-[40%]">
            <ExpoImage
              source={awayCrestUrl}
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
              {awayTeamName}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MatchCard;
