import { ErrorState } from "@/components/matchDetails/ErrorState";
import { LoadingState } from "@/components/matchDetails/LoadingState";
import { MatchDetailsContent } from "@/components/matchDetails/MatchDetailsContent";
import { usePredictionManager } from "@/components/matchDetails/PredictionManager";
import { useGetFixtureById } from "@/hooks/useFixtures";
import { useLocalSearchParams } from "expo-router";

export default function MatchDetails() {
  const { id } = useLocalSearchParams();
  const fixtureId = Number(id);

  const { data: match, isLoading, error } = useGetFixtureById(fixtureId);
  console.log("match", JSON.stringify(match, null, 2));

  const prediction = usePredictionManager({ fixtureId });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !match) {
    return <ErrorState />;
  }

  return <MatchDetailsContent match={match} prediction={prediction} />;
}
