import LoadingOverlay from '@/components/layout/LoadingOverlay';
import MatchList from '@/components/matches/MatchList';
import RoundsList from '@/components/matches/RoundsList';
import { useCompetitionRounds } from '@/hooks/useCompetitions';
import { useLeagueStore } from '@/store/LeagueStore';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function MatchesPage() {
  const { primaryLeague } = useLeagueStore();
  const [selectedRound, setSelectedRound] = useState<string>('');

  const {
    data: competition,
    isLoading,
    error,
  } = useCompetitionRounds(primaryLeague?.competition_id!);

  useEffect(() => {
    if (competition?.current_round && !selectedRound) {
      setSelectedRound(competition?.current_round);
    }
  }, [competition, selectedRound]);

  const handleRoundPress = (round: string) => {
    setSelectedRound(round);
  };

  if (error) console.log('error', error);
  return (
    <View className="flex-1 bg-background pt-4 pb-25">
      {isLoading && <LoadingOverlay />}
      <View>
        <RoundsList
          rounds={competition?.rounds || []}
          selectedRound={selectedRound}
          key={selectedRound}
          handleRoundPress={handleRoundPress}
        />
      </View>
      {selectedRound && <MatchList selectedRound={selectedRound} />}
    </View>
  );
}
