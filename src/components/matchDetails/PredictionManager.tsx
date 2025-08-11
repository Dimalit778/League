import { Alert } from "react-native";
import { useState } from "react";

export interface PredictionState {
  homeScorePrediction: string;
  awayScorePrediction: string;
  predictionSaved: boolean;
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

  const handleSavePrediction = async () => {
    if (!homeScorePrediction || !awayScorePrediction) {
      Alert.alert("Error", "Please enter both scores");
      return;
    }

    // TODO: Implement actual prediction saving
    // try {
    //   await savePrediction.mutateAsync({
    //     fixture_id: fixtureId,
    //     predicted_home_score: parseInt(homeScorePrediction),
    //     predicted_away_score: parseInt(awayScorePrediction),
    //   });
    //   setPredictionSaved(true);
    //   Alert.alert("Success", "Your prediction has been saved!");
    // } catch (error) {
    //   Alert.alert("Error", "Failed to save prediction");
    // }
  };

  return {
    homeScorePrediction,
    awayScorePrediction,
    predictionSaved,
    setHomeScorePrediction,
    setAwayScorePrediction,
    setPredictionSaved,
    handleSavePrediction,
  };
};