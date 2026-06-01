import { useAuthStore } from '@/store/AuthStore';
import { useCallback } from 'react';
import {
  useCheckSubscriptionLeaguesLimit,
  usePurchaseAndSyncSubscription,
  useSyncSubscriptionFromRevenueCat,
} from './useSubscription';

export const useLeagueResolutionGate = () => {
  const userId = useAuthStore((s) => s.user?.id ?? '');
  const { isFetching: isSyncing } = useSyncSubscriptionFromRevenueCat();
  const limits = useCheckSubscriptionLeaguesLimit();
  const { mutateAsync: purchaseAndSync, isPending: isUpgrading } = usePurchaseAndSyncSubscription();

  const handleUpgrade = useCallback(async () => {
    await purchaseAndSync();
  }, [purchaseAndSync]);

  return {
    needsResolution: limits.needsResolution,
    ownedLeagues: limits.ownedLeagues,
    userId,
    handleUpgrade,
    isLoading: limits.isLoading || isSyncing || isUpgrading,
  };
};
