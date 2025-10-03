import { Error, LoadingOverlay } from '@/components/layout';
import MatchList from '@/components/matches/MatchList';
import RoundsList from '@/components/matches/RoundsList';
import { useCompetitionRounds } from '@/hooks/useCompetitions';
import { useMemberStore } from '@/store/MemberStore';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';

export default function MatchesPage() {
  const { member } = useMemberStore();
  const {
    data: competition,
    isLoading,
    error,
  } = useCompetitionRounds(member?.league_id);

  const [selectedRound, setSelectedRound] = useState<string | null>(null);

  useEffect(() => {
    if (competition?.current_round && !selectedRound) {
      setSelectedRound(competition.current_round);
    }
  }, [competition?.current_round, selectedRound]);

  const handleRoundPress = useCallback((round: string) => {
    setSelectedRound(round);
  }, []);

  if (error) return <Error error={error} />;

  const userId = member?.user_id;
  const showMatchList = !!selectedRound && !!competition && !!userId;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {isLoading && !selectedRound && <LoadingOverlay />}
      {selectedRound && (
        <RoundsList
          rounds={competition?.rounds || []}
          selectedRound={selectedRound}
          handleRoundPress={handleRoundPress}
        />
      )}

      {showMatchList && (
        <MatchList
          selectedRound={selectedRound}
          competitionId={competition.id}
          userId={userId}
        />
      )}
    </SafeAreaView>
  );
}
