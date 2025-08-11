import { MatchFinished } from "./MatchFinished";
import { MatchLive } from "./MatchLive";
import { MatchNotStarted } from "./MatchNotStarted";
import { PredictionActions, PredictionState } from "./PredictionManager";

interface MatchStatusRendererProps {
  match: any;
  prediction: PredictionState & PredictionActions;
}

export const MatchStatusRenderer = ({
  match,
  prediction,
}: MatchStatusRendererProps) => {
  const isNotStarted = match.status_long === "Not Started";
  const isLive =
    match.status_long?.includes("Half") || match.status_long === "Halftime";
  const isFinished = match.status_long === "Match Finished";

  const getEventIcon = (type: string) => {
    switch (type) {
      case "goal":
        return "football-outline";
      case "yellow_card":
        return "card-outline";
      case "red_card":
        return "card";
      case "substitution":
        return "swap-horizontal-outline";
      default:
        return "information-circle-outline";
    }
  };

  if (isNotStarted) {
    return (
      <MatchNotStarted
        homeScorePrediction={prediction.homeScorePrediction}
        setHomeScorePrediction={prediction.setHomeScorePrediction}
        awayScorePrediction={prediction.awayScorePrediction}
        setAwayScorePrediction={prediction.setAwayScorePrediction}
        predictionSaved={prediction.predictionSaved}
        savePrediction={() => {}}
        handleSavePrediction={prediction.handleSavePrediction}
      />
    );
  }

  if (isLive) {
    return <MatchLive events={match} getEventIcon={getEventIcon} />;
  }

  if (isFinished) {
    return <MatchFinished match={match} userPrediction={""} />;
  }

  return null;
};