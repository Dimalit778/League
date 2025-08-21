import LoadingOverlay from '@/components/layout/LoadingOverlay';
import { MatchInfoHeader } from '@/components/matchDetails/Header';
import { MatchInfo } from '@/components/matchDetails/MatchInfo';
import MatchPredictions from '@/components/matchDetails/MatchPredictions';

import { useGetFixtureById } from '@/hooks/useFixtures';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView, ScrollView, View } from 'react-native';

export default function MatchDetails() {
  const { id } = useLocalSearchParams();

  const { data: match, isLoading, error } = useGetFixtureById(Number(id));

  if (error) console.log('error', error);

  return (
    <SafeAreaView className="flex-1 bg-background">
      {isLoading && <LoadingOverlay />}
      <MatchInfoHeader match={match} />
      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
      >
        <View className="mx-4 mt-4">
          <MatchInfo match={match} />
        </View>
        <View className="mx-4 mt-6">
          <MatchPredictions fixtureId={Number(id)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
