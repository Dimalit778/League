import { syncSubscriptionToServerUntilPro } from "@/features/subscription/api/subscriptionApi";
import {
  hasActiveEntitlement,
  PRO_ENTITLEMENT,
  usePaywall,
  useRevenueCatSubscription,
} from "@/lib/revenuecat/purchases";

export const useEnsureProAccess = () => {
  const openPaywall = usePaywall();
  const { subscription, refreshCustomerInfo } = useRevenueCatSubscription();

  const isPro = !!subscription.isActive;

  const ensureProAccess = async (): Promise<boolean> => {
    const hasClientPro = hasActiveEntitlement(
      await refreshCustomerInfo(),
      PRO_ENTITLEMENT,
    );

    if (!hasClientPro) {
      return openPaywall();
    }

    // Client is pro — make sure the server row agrees before proceeding.
    const serverResult = await syncSubscriptionToServerUntilPro();
    return serverResult?.plan === "pro";
  };

  return { isPro, openPaywall, ensureProAccess };
};
