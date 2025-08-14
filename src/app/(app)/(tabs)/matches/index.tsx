import { MatchCard } from "@/features/fixtures/components/MatchCard";
import { useGetFixturesByRound } from "@/features/fixtures/hooks/useFixturesv1";
import RoundsList from "@/features/fixtures/RoundsList";
import { useCompetitionRounds } from "@/features/leagues/hooks/useCompetitions";
import useLeagueStore from "@/features/leagues/store/useLeagueStore";
import LoadingOverlay from "@/shared/components/ui/LoadingOverlay";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

export default function MatchesPage() {
  const [selectedRound, setSelectedRound] = useState<string>("");
  const { primaryLeague } = useLeagueStore();

  const {
    data: competition,
    isLoading,
    error,
  } = useCompetitionRounds(primaryLeague?.competition_id);
  const {
    data: fixtures,
    isLoading: fixturesLoading,
    error: fixturesError,
  } = useGetFixturesByRound(selectedRound);

  useEffect(() => {
    if (competition && !selectedRound) {
      const defaultRound =
        competition.currentRound || competition.rounds[0] || "";
      setSelectedRound(defaultRound);
    }
  }, [competition, selectedRound]);

  const handleRoundPress = (round: string) => {
    setSelectedRound(round);
  };

  if (error || fixturesError) console.log("error", error);

  return (
    <View className="flex-1 bg-background pt-4 pb-25">
      {isLoading || (fixturesLoading && <LoadingOverlay />)}

      <View>
        <RoundsList
          rounds={competition?.rounds || []}
          selectedRound={selectedRound}
          key={selectedRound}
          handleRoundPress={handleRoundPress}
        />
      </View>
      <View className="flex-1 px-2 mt-4 ">
        <FlatList
          data={fixtures}
          renderItem={({ item }) => <MatchCard match={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center">
              <Text className="text-textMuted">No matches found</Text>
            </View>
          }
          keyExtractor={(item) => item.id.toString()}
        />
      </View>
    </View>
  );
}
