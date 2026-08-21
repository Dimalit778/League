import { getCurrentSeason } from '@/features/subscription/api/subscriptionApi';
import { KEYS } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

export const useCurrentSeason = () => {
  const { data, isLoading } = useQuery({
    queryKey: KEYS.subscription.currentSeason,
    queryFn: getCurrentSeason,
    staleTime: 60 * 60 * 1000, // 1h — the season window rarely changes.
  });

  return { season: data ?? null, isLoading };
};
