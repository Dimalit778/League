import { FixturesWithTeams } from '@/types';
import { useRouter } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../ui';
import { MatchStatus } from './MatchStatus';

const MatchCard = ({ match }: { match: FixturesWithTeams }) => {
  const homeTeamName = match.home_team.name;
  const awayTeamName = match.away_team?.name;

  const homeCrestUrl = match.home_team.logo;
  const awayCrestUrl = match.away_team.logo;
  const router = useRouter();
  const handlePress = (id: number) => {
    router.push({
      pathname: '/(app)/match/[id]',
      params: { id },
    });
  };
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => handlePress(match.id)}
    >
      <Card className="p-2 my-1">
        <View className="flex-row items-center justify-between ">
          {/* Home Team */}
          <View className="flex-1 flex-row items-center justify-start pr-2">
            <Image
              source={{ uri: homeCrestUrl }}
              className="w-8 h-8 rounded-full mr-2"
              resizeMode="contain"
            />
            <Text className="text-text">{homeTeamName}</Text>
          </View>
          <View className="items-center min-w-[70px]">
            <MatchStatus
              status={match.status}
              homeScore={match.home_score ?? 0}
              awayScore={match.away_score ?? 0}
              kickOffTime={match.kickoff_time}
            />
          </View>
          {/* Away Team */}
          <View className="flex-1 flex-row items-center justify-end">
            <Text className="text-text">{awayTeamName}</Text>
            <Image
              source={{ uri: awayCrestUrl }}
              className="w-8 h-8 rounded-full ml-2"
              resizeMode="contain"
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default MatchCard;
