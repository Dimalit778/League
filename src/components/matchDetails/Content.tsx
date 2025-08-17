import {
  isMatchFinished,
  isMatchInPlay,
  isMatchScheduled,
} from "@/utils/match-utils";
import { MatchFinished } from "./matchStatus/MatchFinished";
import { MatchLive } from "./matchStatus/MatchLive";
import { MatchNotStarted } from "./matchStatus/MatchNotStarted";
import { PredictionActions, PredictionState } from "./PredictionManager";

interface MatchStatusRendererProps {
  match: any;
  prediction: PredictionState & PredictionActions;
}

export const MatchInfoContent = ({
  match,
  prediction,
}: MatchStatusRendererProps) => {
  console.log(
    "matchMatchInfoContent prediction --",
    JSON.stringify(prediction, null, 2)
  );
  const isScheduled = isMatchScheduled(match.status_long);
  const isLive = isMatchInPlay(match.status_long);
  const isFinished = isMatchFinished(match.status_long);

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

  if (isScheduled) {
    return (
      <MatchNotStarted
        homeScorePrediction={prediction.homeScorePrediction}
        setHomeScorePrediction={prediction.setHomeScorePrediction}
        awayScorePrediction={prediction.awayScorePrediction}
        setAwayScorePrediction={prediction.setAwayScorePrediction}
        predictionSaved={prediction.predictionSaved}
        handleSavePrediction={prediction.handleSavePrediction}
        canPredict={prediction.canPredict}
        isSaving={prediction.isSaving}
      />
    );
  }

  if (isLive) {
    return <MatchLive events={match} getEventIcon={getEventIcon} />;
  }

  if (isFinished) {
    return <MatchFinished match={match} />;
  }

  return null;
};
