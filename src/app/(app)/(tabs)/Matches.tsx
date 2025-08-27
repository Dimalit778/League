import { Error, LoadingOverlay, TopBar } from '@/components/layout';
import Screen from '@/components/layout/Screen';
import MatchList from '@/components/matches/MatchList';
import RoundsList from '@/components/matches/RoundsList';
import { useCompetitionRounds } from '@/hooks/useCompetitions';
import { useEffect, useState } from 'react';

export default function MatchesPage() {
  const [selectedRound, setSelectedRound] = useState<string>('');

  const { data: competition, isLoading, error } = useCompetitionRounds();

  useEffect(() => {
    if (competition?.current_round && !selectedRound) {
      setSelectedRound(competition?.current_round);
    }
  }, [competition, selectedRound]);

  const handleRoundPress = (round: string) => {
    setSelectedRound(round);
  };

  if (error) return <Error error={error} />;

  return (
    <Screen>
      <TopBar showLeagueName={true} />
      {isLoading && <LoadingOverlay />}

      <RoundsList
        rounds={competition?.rounds || []}
        selectedRound={selectedRound}
        key={selectedRound}
        handleRoundPress={handleRoundPress}
      />

      {selectedRound && (
        <MatchList
          selectedRound={selectedRound}
          competitionId={competition?.id ?? 0}
        />
      )}
    </Screen>
  );
}
