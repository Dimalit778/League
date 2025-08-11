import {
  useAutoPredictions,
  useCanPredict,
  useCreateOrUpdatePrediction,
  usePredictionByFixture,
} from "@/hooks/usePredictions";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface PredictionState {
  homeScorePrediction: string;
  awayScorePrediction: string;
  predictionSaved: boolean;
  canPredict: boolean;
  isLoading: boolean;
  isSaving: boolean;
}

export interface PredictionActions {
  setHomeScorePrediction: (score: string) => void;
  setAwayScorePrediction: (score: string) => void;
  setPredictionSaved: (saved: boolean) => void;
  handleSavePrediction: () => Promise<void>;
}

export interface UsePredictionManagerProps {
  fixtureId: number;
}

export const usePredictionManager = ({
  fixtureId,
}: UsePredictionManagerProps): PredictionState & PredictionActions => {
  const [homeScorePrediction, setHomeScorePrediction] = useState("");
  const [awayScorePrediction, setAwayScorePrediction] = useState("");
  const [predictionSaved, setPredictionSaved] = useState(false);

  const { data: existingPrediction, isLoading: predictionLoading } =
    usePredictionByFixture(fixtureId);
  const { data: canPredict, isLoading: canPredictLoading } =
    useCanPredict(fixtureId);
  const savePredictionMutation = useCreateOrUpdatePrediction();

  // Enable auto-predictions
  useAutoPredictions();

  useEffect(() => {
    if (existingPrediction) {
      setHomeScorePrediction(
        existingPrediction.predicted_home_score.toString()
      );
      setAwayScorePrediction(
        existingPrediction.predicted_away_score.toString()
      );
      setPredictionSaved(true);
    }
  }, [existingPrediction]);

  const handleSavePrediction = async () => {
    const homeScore = parseInt(homeScorePrediction);
    const awayScore = parseInt(awayScorePrediction);

    if (isNaN(homeScore) || isNaN(awayScore)) {
      Alert.alert("Error", "Please enter valid scores");
      return;
    }

    if (homeScore < 0 || awayScore < 0) {
      Alert.alert("Error", "Scores cannot be negative");
      return;
    }

    if (!canPredict) {
      Alert.alert("Error", "Prediction time has expired for this match");
      return;
    }

    try {
      await savePredictionMutation.mutateAsync({
        fixtureId,
        homeScore,
        awayScore,
      });
      setPredictionSaved(true);
      Alert.alert("Success", "Your prediction has been saved!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to save prediction");
    }
  };

  return {
    homeScorePrediction,
    awayScorePrediction,
    predictionSaved,
    canPredict: canPredict ?? false,
    isLoading: predictionLoading || canPredictLoading,
    isSaving: savePredictionMutation.isPending,
    setHomeScorePrediction,
    setAwayScorePrediction,
    setPredictionSaved,
    handleSavePrediction,
  };
};
