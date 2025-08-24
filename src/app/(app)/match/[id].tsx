import { MatchHeader } from '@/components/matchDetails/MatchHeader';
import MatchSkeleton from '@/components/matchDetails/MatchSkeleton';
import { useGetFixtureById } from '@/hooks/useFixtures';
import { useMatchContent } from '@/hooks/useMatchContent';
import { FixturesWithTeams } from '@/types';
import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

export default function MatchDetails() {
  const { id } = useLocalSearchParams();

  const { data: match, isLoading, error } = useGetFixtureById(Number(id));

  if (isLoading) return <MatchSkeleton />;
  if (error) console.log('error', error);

  const Content = useMatchContent(match as FixturesWithTeams);

  return (
    <View className="flex-1 bg-background">
      <MatchHeader match={match as FixturesWithTeams} />

      {Content}
    </View>
  );
}
