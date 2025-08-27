import { useGetFixturesByRound } from '@/hooks/useFixtures';

import { useUserPredictionsByRound } from '@/hooks/usePredictions';
import { FlatList, View } from 'react-native';
import { Error, LoadingOverlay } from '../layout';
import MatchCard from './MatchCard';

const MatchList = ({
  selectedRound,
  competitionId,
}: {
  selectedRound: string;
  competitionId: number;
}) => {
  const {
    data: fixtures,
    isLoading,
    error,
  } = useGetFixturesByRound(selectedRound, competitionId);
  const { data: predictions } = useUserPredictionsByRound(selectedRound);
  console.log('predictions', JSON.stringify(predictions, null, 2));

  if (isLoading) return <LoadingOverlay />;
  if (error) return <Error error={error} />;

  return (
    <View className="flex-1 ">
      <FlatList
        data={fixtures}
        renderItem={({ item }) => <MatchCard match={item} />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default MatchList;
