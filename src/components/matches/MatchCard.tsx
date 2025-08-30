import { FixturesWithTeamsAndPredictionsType } from '@/types';

import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../ui';
import { MatchStatus } from './MatchStatus';
import PredictionStatus from './PredictionStatus';

const MatchCard = ({
  match,
}: {
  match: FixturesWithTeamsAndPredictionsType;
}) => {
  const homeTeamName = match.home_team.name;
  const awayTeamName = match.away_team?.name;

  const homeCrestUrl = match.home_team.logo;
  const awayCrestUrl = match.away_team.logo;

  const prediction = match.predictions?.[0] ?? null;

  const router = useRouter();
  const handlePress = (match: FixturesWithTeamsAndPredictionsType) => {
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
      <Card className="p-2 my-1">
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
          <View className="flex-1 flex-row items-center justify-start max-w-[40%]">
            <Image
              source={{ uri: homeCrestUrl }}
              className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
              resizeMode="contain"
            />
            <Text
              className="text-text flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {homeTeamName}
            </Text>
          </View>

          {/* Score Section */}
          <View className="items-center min-w-[70px] mx-2">
            <MatchStatus
              status={match.status}
              homeScore={match.home_score ?? 0}
              awayScore={match.away_score ?? 0}
              kickOffTime={match.kickoff_time}
            />
          </View>

          {/* Away Team */}
          <View className="flex-1 flex-row items-center justify-end max-w-[40%]">
            <Text
              className="text-text flex-1 text-right"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {awayTeamName}
            </Text>
            <Image
              source={{ uri: awayCrestUrl }}
              className="w-8 h-8 rounded-full ml-2 flex-shrink-0"
              resizeMode="contain"
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default MatchCard;
