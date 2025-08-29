  import { QUERY_KEYS } from "@/lib/queryKeys";
import { predictionService } from "@/services/predictionService";
import { useLeagueStore } from "@/store/LeagueStore";
import { useMemberStore } from "@/store/MemberStore";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";






// * Done
// Create Prediction
export const useCreatePrediction = (fixtureId: number, round: string, competitionId: number) => {
  const queryClient = useQueryClient();
  const { member } = useMemberStore();

  return useMutation({
    mutationFn: (prediction: {
      fixture_id: number;
      home_score: number;
      away_score: number;
    }) => predictionService.createPrediction({
      user_id: member!.user_id,
      fixture_id: prediction.fixture_id,
      home_score: prediction.home_score,
      away_score: prediction.away_score,
      league_member_id: member!.id,
      league_id: member!.league_id,
    }),

    // Optimistic update
    onMutate: async (newPrediction) => {
      const queryKey = QUERY_KEYS.allFixtures(member!.user_id, round, competitionId);
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousFixtures = queryClient.getQueryData(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData(queryKey, (old: any[]) => {
        if (!old) return old;
        
        return old.map(fixture => {
          if (fixture.id === newPrediction.fixture_id) {
            return {
              ...fixture,
              predictions: [{
                ...newPrediction,
                user_id: member!.user_id,
                league_member_id: member!.id,
                league_id: member!.league_id,
                id: 'temp-' + Date.now(), // Temporary ID
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                points: 0,
                is_processed: false,
              }]
            };
          }
          return fixture;
        });
      });

      // Return a context object with the snapshotted value
      return { previousFixtures, queryKey };
    },

    // If the mutation fails, use the context to roll back
    onError: (err, newPrediction, context) => {
      if (context?.previousFixtures) {
        queryClient.setQueryData(context.queryKey, context.previousFixtures);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.allFixtures(member!.user_id, round, competitionId) 
      });
    },
  });
};
// * Done
// Update Prediction
export const useUpdatePrediction = (fixtureId: number, round: string, competitionId: number) => {
  const queryClient = useQueryClient();
  const { member } = useMemberStore();

  return useMutation({
    mutationFn: (prediction: {
      id: string; // prediction ID for update
      home_score: number;
      away_score: number;
    }) => predictionService.updatePrediction({
      id: prediction.id,
      home_score: prediction.home_score,
      away_score: prediction.away_score,
      user_id: member!.user_id,
    }),

    onMutate: async (updatedPrediction) => {
      const queryKey = QUERY_KEYS.allFixtures(member!.user_id, round, competitionId);
      
      await queryClient.cancelQueries({ queryKey });
      const previousFixtures = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any[]) => {
        if (!old) return old;
        
        return old.map(fixture => {
          if (fixture.id === fixtureId) {
            return {
              ...fixture,
              predictions: fixture.predictions.map((pred: any) => 
                pred.id === updatedPrediction.id 
                  ? { 
                      ...pred, 
                      home_score: updatedPrediction.home_score,
                      away_score: updatedPrediction.away_score,
                      updated_at: new Date().toISOString()
                    }
                  : pred
              )
            };
          }
          return fixture;
        });
      });

      return { previousFixtures, queryKey };
    },

    onError: (err, updatedPrediction, context) => {
      if (context?.previousFixtures) {
        queryClient.setQueryData(context.queryKey, context.previousFixtures);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.allFixtures(member!.user_id, round, competitionId) 
      });
    },
  });
};
export const useUserPredictionsByRound = (round: string) => {
  const { member } = useMemberStore();
  return useQuery({
    queryKey: ["fixture", "predictions", member?.user_id, round],
    queryFn: () => predictionService.getUserPredictionsByRound(member!.user_id, round),
    enabled: !!member?.user_id && !!round,
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
  const { member } = useMemberStore();

  return useQuery({
    queryKey: ["prediction", member?.user_id, fixtureId],
    queryFn: () => predictionService.getUserPredictionByFixture(member!.user_id, fixtureId),
    enabled: !!member?.user_id && !!fixtureId,
  
  });
};
// Get League Predictions By Fixture
export const useGetLeaguePredictionsByFixture = ( fixtureId: number) => {
  const { member } = useMemberStore();
  const { primaryLeague } = useLeagueStore();
  return useQuery({
    queryKey: ["prediction",fixtureId, primaryLeague?.id],
    queryFn: () => predictionService.getLeaguePredictionsByFixture(fixtureId, primaryLeague!.id),
    enabled: !!member?.user_id && !!fixtureId && !!primaryLeague?.id,

  });
};




// export const useAutoPredictions = () => {
//   const { member } = useMemberStore();
//   const { primaryLeague } = useLeagueStore();
 
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const appState = useRef(AppState.currentState);

//   useEffect(() => {
//     if (!member?.user_id || !primaryLeague) return;

//     const handleAppStateChange = (nextAppState: AppStateStatus) => {
//       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
//         // App has come to the foreground, check for auto-predictions
//         autoPredictionService.scheduleAutoPredictions();
//       }
//       appState.current = nextAppState;
//     };

//     const subscription = AppState.addEventListener('change', handleAppStateChange);

//     // Set up periodic checking (every 30 minutes when app is active)
//     const startPeriodicCheck = () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }

//       intervalRef.current = setInterval(() => {
//         if (AppState.currentState === 'active') {
//           autoPredictionService.scheduleAutoPredictions();
//         }
//       }, 30 * 60 * 1000); // 30 minutes
//     };

//     // Initial check
//     autoPredictionService.scheduleAutoPredictions();
//     startPeriodicCheck();

//     return () => {
//       subscription.remove();
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//       }, [member?.user_id, primaryLeague]);
// };