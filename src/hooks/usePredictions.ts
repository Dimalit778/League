import { autoPredictionService } from "@/services/autoPredictionService";
import { predictionService } from "@/services/predictionService";
import { useAppStore } from "@/store/useAppStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";



// * Done
export const useCreateOrUpdatePrediction = () => {
  const queryClient = useQueryClient();
  const { session } = useAppStore();

  return useMutation({
    mutationFn: ({
      fixtureId,
      homeScore,
      awayScore,
    }: {
      fixtureId: number;
      homeScore: number;
      awayScore: number;
    }) =>
      predictionService.createOrUpdatePrediction(
        session!.user.id,
        fixtureId,
        homeScore,
        awayScore
      ),
    onSuccess: (_, { fixtureId }) => {
      queryClient.invalidateQueries({ queryKey: ["predictions", session!.user.id] });
      queryClient.invalidateQueries({
        queryKey: ["prediction", session!.user.id, fixtureId],
      });
    },
  });
};
// * Done
export const useCanPredict = (fixtureId: number) => {
  return useQuery({
    queryKey: ["canPredict", fixtureId],
    queryFn: () => predictionService.canUserPredict(fixtureId),
    enabled: !!fixtureId,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const usePredictions = () => {
  const { session ,primaryLeague} = useAppStore();


  return useQuery({
    queryKey: ["predictions", session?.user.id],
    queryFn: () => predictionService.getUserPredictions(session!.user.id),
    enabled: !!session?.user.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePredictionByFixture = (fixtureId: number) => {
  const { session } = useAppStore();

  return useQuery({
    queryKey: ["prediction", session?.user.id, fixtureId],
    queryFn: () => predictionService.getPredictionByUserAndFixture(session!.user.id, fixtureId),
    enabled: !!session?.user.id && !!fixtureId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};


export const useLeaguePredictions = (fixtureId?: number) => {
  const { primaryLeague } = useAppStore();

  return useQuery({
    queryKey: ["leaguePredictions", primaryLeague?.id, fixtureId],
    queryFn: () => predictionService.getLeaguePredictions(primaryLeague!.id, fixtureId),
    enabled: !!primaryLeague?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useLeagueLeaderboard = () => {
  const { primaryLeague } = useAppStore();

  return useQuery({
    queryKey: ["leaderboard", primaryLeague?.id],
    queryFn: () => predictionService.getLeagueLeaderboard(primaryLeague!.id),
    enabled: !!primaryLeague?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
export const useAutoPredictions = () => {
  const { session ,primaryLeague} = useAppStore();
 
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (!session?.user.id || !primaryLeague) return;

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
  }, [session?.user.id, primaryLeague]);
};