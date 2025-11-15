import { QUERY_KEYS } from '@/lib/tanstack/keys';
import { predictionService } from '../queries/predictionService';
import { useStoreData } from '@/store/store';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { downloadAndPrefetchAvatars } from '@/utils/downloadAndPrefetchAvatars';

// Create Prediction
export const useCreatePrediction = () => {
  const queryClient = useQueryClient();
  const { member } = useStoreData();

  return useMutation({
    mutationFn: (prediction: { fixture_id: number; home_score: number; away_score: number }) => {
      if (!member?.user_id || !member?.id || !member?.league_id) {
        throw new Error('Member data is required to create prediction');
      }
      return predictionService.createPrediction({
        user_id: member.user_id,
        match_id: prediction.fixture_id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        league_member_id: member.id,
        league_id: member.league_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matches.all });
    },
    onError: (error) => {
      console.error('Failed to create prediction:', error);
    },
  });
};

// Update Prediction
export const useUpdatePrediction = () => {
  const queryClient = useQueryClient();
  const { member } = useStoreData();

  return useMutation({
    mutationFn: (prediction: { id: string; home_score: number; away_score: number }) => {
      if (!member?.user_id) {
        throw new Error('User ID is required to update prediction');
      }
      return predictionService.updatePrediction({
        id: prediction.id,
        home_score: prediction.home_score,
        away_score: prediction.away_score,
        user_id: member.user_id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matches.all });
    },
    onError: (error) => {
      console.error('Failed to update prediction:', error);
    },
  });
};
export const useMemberPredictionsByRound = (round: string) => {
  const { member } = useStoreData();
  const userId = member?.user_id;

  return useQuery({
    queryKey: QUERY_KEYS.predictions.byUserAndMatchday(userId || '', parseInt(round)),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required to fetch predictions');
      }
      return predictionService.getMemberPredictionsByRound(userId, round);
    },
    enabled: !!userId && !!round,
  });
};

export const useMemberPredictions = (userId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.byUser(userId),
    queryFn: () => predictionService.getMemberPredictions(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
// Get User Prediction By Fixture
export const useMemberPredictionByFixture = (fixtureId: number) => {
  const { member } = useStoreData();
  const userId = member?.user_id;

  return useQuery({
    queryKey: QUERY_KEYS.predictions.byFixture(fixtureId),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required to fetch prediction');
      }
      return predictionService.getMemberPredictionByFixture(userId, fixtureId);
    },
    enabled: !!userId && !!fixtureId,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
// Get League Predictions By Fixture
export const useGetLeaguePredictionsByFixture = (fixtureId: number, leagueId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.predictions.leagueByFixture(fixtureId, leagueId),
    queryFn: async () => {
      const rows = await predictionService.getLeaguePredictionsByFixture(fixtureId, leagueId);
      const paths = rows.map((r) => r.member.avatar_url).filter(Boolean) as string[];
      const imageUrls = await downloadAndPrefetchAvatars(paths);
      return rows.map((r) => ({
        ...r,
        member: {
          ...r.member,
          avatar_url: r.member.avatar_url ? (imageUrls.get(r.member.avatar_url) ?? null) : null,
        },
      }));
    },

    staleTime: 1000 * 60 * 5,
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
