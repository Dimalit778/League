import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

const PRO_ENTITLEMENT = 'pro';

export type PurchaseSyncPayload = {
  type: 'PRO';
  start_date: string;
  end_date: string;
  product_id: string | null;
};

const isUserCancelledError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'userCancelled' in error &&
  Boolean((error as { userCancelled?: boolean }).userCancelled);

const extractSyncPayload = (customerInfo: CustomerInfo): PurchaseSyncPayload | null => {
  const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT];
  if (!entitlement) return null;

  return {
    type: 'PRO',
    start_date: entitlement.latestPurchaseDate,
    end_date: entitlement.expirationDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    product_id: entitlement.productIdentifier ?? null,
  };
};

export const purchasesService = {
  async presentPaywall(): Promise<PurchaseSyncPayload | null> {
    const offerings = await Purchases.getOfferings();

    const mainOffering = offerings.current;

    if (!mainOffering || mainOffering.availablePackages.length === 0) {
      throw new Error('No packages available for main offering');
    }

    const result = await RevenueCatUI.presentPaywall({
      offering: mainOffering,
    });

    if (result !== PAYWALL_RESULT.PURCHASED && result !== PAYWALL_RESULT.RESTORED) {
      return null;
    }

    await Purchases.invalidateCustomerInfoCache();
    const customerInfo = await Purchases.getCustomerInfo();
    return extractSyncPayload(customerInfo);
  },

  async getMonthlyPackage(): Promise<PurchasesPackage | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.monthly ?? null;
  },

  async purchaseMonthly(): Promise<PurchaseSyncPayload | null> {
    const pkg = await this.getMonthlyPackage();
    if (!pkg) throw new Error('No package available');

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return extractSyncPayload(customerInfo);
    } catch (error) {
      if (isUserCancelledError(error)) return null;
      throw error;
    }
  },

  async restorePurchases(): Promise<PurchaseSyncPayload | null> {
    const customerInfo = await Purchases.restorePurchases();
    return extractSyncPayload(customerInfo);
  },

  async getActiveSyncPayload(): Promise<PurchaseSyncPayload | null> {
    const customerInfo = await Purchases.getCustomerInfo();
    return extractSyncPayload(customerInfo);
  },
};
export const paywallService = {
  async presentIfNeeded() {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: PRO_ENTITLEMENT,
      });

      const purchased = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;

      if (purchased) {
        await Purchases.invalidateCustomerInfoCache();
      }

      return {
        purchased,
        result,
      };
    } catch (error) {
      console.error('Failed to present paywall:', error);

      return {
        purchased: false,
        result: PAYWALL_RESULT.ERROR,
      };
    }
  },

  async present() {
    try {
      const result = await RevenueCatUI.presentPaywall();

      const purchased = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;

      if (purchased) {
        await Purchases.invalidateCustomerInfoCache();
      }

      return {
        purchased,
        result,
      };
    } catch (error) {
      console.error('Failed to present paywall:', error);

      return {
        purchased: false,
        result: PAYWALL_RESULT.ERROR,
      };
    }
  },
};
