import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const PRO_ENTITLEMENT = 'pro';

let isConfigured = false;

export type PurchaseSyncPayload = {
  subscription_type: 'PRO';
  start_date: string;
  end_date: string;
  product_id: string | null;
};

const getApiKey = (): string => {
  const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!apiKey) {
    throw new Error('RevenueCat API key is not configured for this platform');
  }
  return apiKey;
};

const hasProEntitlement = (customerInfo: { entitlements: { active: Record<string, unknown> } }): boolean =>
  Boolean(customerInfo.entitlements.active[PRO_ENTITLEMENT]);

const isUserCancelledError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'userCancelled' in error &&
  Boolean((error as { userCancelled?: boolean }).userCancelled);

const extractSyncPayload = (customerInfo: CustomerInfo): PurchaseSyncPayload | null => {
  const entitlement = customerInfo.entitlements.active[PRO_ENTITLEMENT];
  if (!entitlement) return null;

  return {
    subscription_type: 'PRO',
    start_date: entitlement.latestPurchaseDate,
    end_date:
      entitlement.expirationDate ??
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    product_id: entitlement.productIdentifier ?? null,
  };
};

export const purchasesService = {
  configure(userId: string | null): void {
    if (isConfigured) return;

    const apiKey = getApiKey();
    // if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey, appUserID: userId ?? undefined });
    isConfigured = true;
  },

  async setUser(userId: string | null): Promise<void> {
    if (!isConfigured) return;

    if (userId) {
      await Purchases.logIn(userId);
      return;
    }

    await Purchases.logOut();
  },

  async presentPaywall(): Promise<PurchaseSyncPayload | null> {
    const offerings = await Purchases.getOfferings();
    const mainOffering = offerings.current;
    if (!mainOffering || mainOffering.availablePackages.length === 0) {
      throw new Error('No packages available for main offering');
    }

    const result = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: PRO_ENTITLEMENT,
      offering: mainOffering,
    });

    if (result !== PAYWALL_RESULT.PURCHASED && result !== PAYWALL_RESULT.RESTORED) {
      return null;
    }

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

  async isProActive(): Promise<boolean> {
    const info = await Purchases.getCustomerInfo();
    return hasProEntitlement(info);
  },
};
