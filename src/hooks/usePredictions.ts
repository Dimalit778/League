import { autoPredictionService } from "@/services/autoPredictionService";
import { predictionService } from "@/services/predictionService";
import { useAuthStore } from "@/store/AuthStore";
import { useLeagueStore } from "@/store/LeagueStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";






// * Done
// Create Prediction
export const useCreatePrediction = (fixtureId: number ) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { primaryLeague } = useLeagueStore();

  return useMutation({
    mutationFn: (prediction: {
      fixture_id: number;
      home_score: number;
      away_score: number;
    }) => predictionService.createPrediction({
      user_id: user!.id,
      fixture_id: prediction.fixture_id,
      home_score: prediction.home_score,
      away_score: prediction.away_score,
      league_id: primaryLeague!.id,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions", user!.id] });
      queryClient.invalidateQueries({
        queryKey: ["prediction", user!.id, fixtureId],
      });
    },
    onError: (error) => {
      console.error("Error creating prediction:", error);
    },
  });
};
// * Done
// Update Prediction
export const useUpdatePrediction = (fixtureId: number) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: (prediction: {
      prediction_id: string;
      home_score: number;
      away_score: number;
    }) => predictionService.updatePrediction(prediction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["predictions", user!.id] });
      queryClient.invalidateQueries({
        queryKey: ["prediction", user!.id, fixtureId],
      });
    },
  });
};

export const useUserPredictions = (userId: string) => {
  return useQuery({
    queryKey: ["predictions", userId],
    queryFn: () => predictionService.getUserPredictions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, 
  });
};
// Get User Prediction By Fixture
export const useUserPredictionByFixture = (fixtureId: number) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["prediction", user?.id, fixtureId],
    queryFn: () => predictionService.getUserPredictionByFixture(user!.id, fixtureId),
    enabled: !!user?.id && !!fixtureId,
    staleTime: 1000 * 60 * 2, 
  });
};
// Get League Predictions By Fixture
export const useGetLeaguePredictionsByFixture = ( fixtureId: number) => {
  const { user } = useAuthStore();
  const { primaryLeague } = useLeagueStore();
  return useQuery({
    queryKey: ["prediction", user?.id, fixtureId, primaryLeague?.id],
    queryFn: () => predictionService.getLeaguePredictionsByFixture(fixtureId, primaryLeague!.id),
    enabled: !!user?.id && !!fixtureId && !!primaryLeague?.id,
    staleTime: 1000 * 60 * 2, 
  });
};




export const useAutoPredictions = () => {
  const { user } = useAuthStore();
  const { primaryLeague } = useLeagueStore();
 
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!user?.id || !primaryLeague) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground, check for auto-predictions
        autoPredictionService.scheduleAutoPredictions();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Set up periodic checking (every 30 minutes when app is active)
    const startPeriodicCheck = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        if (AppState.currentState === 'active') {
          autoPredictionService.scheduleAutoPredictions();
        }
      }, 30 * 60 * 1000); // 30 minutes
    };

    // Initial check
    autoPredictionService.scheduleAutoPredictions();
    startPeriodicCheck();

    return () => {
      subscription.remove();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    }, [user?.id, primaryLeague]);
};