import { autoPredictionService } from "@/services/autoPredictionService";
import { predictionService } from "@/services/predictionService";
import { useAuthStore } from "@/store/AuthStore";
import { useLeagueStore } from "@/store/LeagueStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";



// * Done
export const useCreateOrUpdatePrediction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

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
        user!.id,
        fixtureId,
        homeScore,
        awayScore
      ),
    onSuccess: (_, { fixtureId }) => {
      queryClient.invalidateQueries({ queryKey: ["predictions", user!.id] });
      queryClient.invalidateQueries({
        queryKey: ["prediction", user!.id, fixtureId],
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

export const useUserPredictions = (userId: string) => {
  return useQuery({
    queryKey: ["predictions", userId],
    queryFn: () => predictionService.getUserPredictions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, 
  });
};

export const usePredictionByFixture = (fixtureId: number) => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["prediction", user?.id, fixtureId],
    queryFn: () => predictionService.getPredictionByUserAndFixture(user!.id, fixtureId),
    enabled: !!user?.id && !!fixtureId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};


export const useLeaguePredictions = (fixtureId?: number) => {
  const { primaryLeague } = useLeagueStore();

  return useQuery({
    queryKey: ["leaguePredictions", primaryLeague?.id, fixtureId],
    queryFn: () => predictionService.getLeaguePredictions(Number(primaryLeague!.id), fixtureId),
    enabled: !!primaryLeague?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useLeagueLeaderboard = () => {
  const { primaryLeague } = useLeagueStore();

  return useQuery({
    queryKey: ["leaderboard", primaryLeague?.id],
    queryFn: () => predictionService.getLeagueLeaderboard(Number(primaryLeague!.id)),
    enabled: !!primaryLeague?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
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