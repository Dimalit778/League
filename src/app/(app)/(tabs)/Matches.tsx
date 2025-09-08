import { Error, LoadingOverlay, TopBar } from '@/components/layout';
import Screen from '@/components/layout/Screen';
import MatchList from '@/components/matches/MatchList';
import RoundsList from '@/components/matches/RoundsList';
import { useCompetitionRounds } from '@/hooks/useCompetitions';
import { useMemberStore } from '@/store/MemberStore';
import { useEffect, useState } from 'react';

export default function MatchesPage() {
  const { data: competition, isLoading, error } = useCompetitionRounds();
  const { member } = useMemberStore();
  const [selectedRound, setSelectedRound] = useState<string | null>(null);

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
      {isLoading && !selectedRound && <LoadingOverlay />}
      {selectedRound && (
        <RoundsList
          rounds={competition?.rounds || []}
          selectedRound={selectedRound}
          handleRoundPress={handleRoundPress}
        />
      )}

      {selectedRound && (
        <MatchList
          selectedRound={selectedRound}
          competitionId={competition?.id ?? 0}
          userId={member?.user_id ?? ''}
        />
      )}
    </Screen>
  );
}
