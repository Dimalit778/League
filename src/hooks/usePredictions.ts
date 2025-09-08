import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { predictionService } from '@/services/predictionService';
import { useMemberStore } from '@/store/MemberStore';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// * Done
// Create Prediction
export const useCreatePrediction = (
  fixtureId: number,
  round: string,
  competitionId: number
) => {
  const queryClient = useQueryClient();
  const { member } = useMemberStore();

  return useMutation({
    mutationFn: (prediction: {
      fixture_id: number;
      home_score: number;
      away_score: number;
    }) =>
      predictionService.createPrediction({
        user_id: member!.user_id,
        fixture_id: prediction.fixture_id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        league_member_id: member!.id,
        league_id: member!.league_id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures.all });
    },
    onError: (error) => {
      console.error('Failed to create prediction:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures.all });
    },
  });
};
// * Done
// Update Prediction
export const useUpdatePrediction = (
  fixtureId: number,
  round: string,
  competitionId: number
) => {
  const queryClient = useQueryClient();
  const { member } = useMemberStore();

  return useMutation({
    mutationFn: (prediction: {
      id: string;
      home_score: number;
      away_score: number;
    }) =>
      predictionService.updatePrediction({
        id: prediction.id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        user_id: member?.user_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.fixtures.all });
    },
    onError: (error) => {
      console.error('Failed to update prediction:', error);
    },
    onSettled: () => {},
  });
};
export const useUserPredictionsByRound = (round: string) => {
  const { member } = useMemberStore();
  return useQuery({
    queryKey: QUERY_KEYS.predictions.byUserAndRound(
      member?.user_id || '',
      round
    ),
    queryFn: () =>
      predictionService.getUserPredictionsByRound(member!.user_id, round),
    enabled: !!member?.user_id && !!round,
  });
};

export const useUserPredictions = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.byUser(userId),
    queryFn: () => predictionService.getUserPredictions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
// Get User Prediction By Fixture
export const useUserPredictionByFixture = (fixtureId: number) => {
  const { member } = useMemberStore();

  return useQuery({
    queryKey: QUERY_KEYS.predictions.byFixture(fixtureId),
    queryFn: () =>
      predictionService.getUserPredictionByFixture(member!.user_id, fixtureId),
    enabled: !!member?.user_id && !!fixtureId,
  });
};
// Get League Predictions By Fixture
export const useGetLeaguePredictionsByFixture = (fixtureId: number) => {
  const { member } = useMemberStore();
  return useQuery({
    queryKey: QUERY_KEYS.predictions.leagueByFixture(
      fixtureId,
      member?.league_id || ''
    ),
    queryFn: () =>
      predictionService.getLeaguePredictionsByFixture(
        fixtureId,
        member!.league_id
      ),
    enabled: !!member?.user_id && !!fixtureId && !!member?.league_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
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
