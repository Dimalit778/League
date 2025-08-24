import { useGetFixturesByRound } from '@/hooks/useFixtures';

import { FixturesWithTeams } from '@/types';
import { useRouter } from 'expo-router';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import LoadingOverlay from '../layout/LoadingOverlay';
import { MatchStatus } from './MatchStatus';

const MatchList = ({ selectedRound }: { selectedRound: string }) => {
  const {
    data: fixtures,
    isLoading,
    error,
  } = useGetFixturesByRound(selectedRound);

  if (error) console.log('error', error);
  if (isLoading) return <LoadingOverlay />;
  return (
    <View className="flex-1 px-2 mt-4 ">
      <FlatList
        data={fixtures}
        renderItem={({ item }) => <Card match={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="text-textMuted">No matches found</Text>
          </View>
        }
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};
//* Card Component
const Card = ({ match }: { match: FixturesWithTeams }) => {
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
      className="bg-surface p-2 rounded-lg mb-4 shadow-md border border-border"
      activeOpacity={0.85}
      onPress={() => handlePress(match.id)}
    >
      <View className="flex-row items-center justify-between ">
        {/* Home Team */}
        <View className="flex-1 flex-row items-center justify-start pr-2">
          <Image
            source={{ uri: homeCrestUrl }}
            className="w-8 h-8 rounded-full mr-2"
            resizeMode="contain"
          />
          <Text className="text-sm font-medium text-text flex-shrink">
            {homeTeamName}
          </Text>
        </View>

        <MatchStatus
          status={match.status}
          homeScore={match.home_score ?? 0}
          awayScore={match.away_score ?? 0}
          kickOffTime={match.kickoff_time}
        />

        {/* Away Team */}
        <View className="flex-1 flex-row items-center justify-end">
          <Text className="text-sm font-medium text-text flex-shrink ">
            {awayTeamName}
          </Text>
          <Image
            source={{ uri: awayCrestUrl }}
            className="w-8 h-8 rounded-full ml-2"
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
export default MatchList;
