/**
 * RevenueCat integration service.
 *
 * Setup:
 *   1. Add API keys to .env:
 *        EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
 *        EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxx
 *   2. Run prebuild: npx expo prebuild
 *
 * Identifier conventions:
 *   - Offering identifier: "default"
 *   - Package identifier: "$rc_monthly"
 *   - Entitlement identifier: "pro"
 */

import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';
const PRO_ENTITLEMENT = 'pro';

let isConfigured = false;

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

export const purchasesService = {
  /**
   * Call once at app startup after the user session is ready.
   */
  configure(userId: string | null): void {
    if (isConfigured) return;

    const apiKey = getApiKey();
    if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey, appUserID: userId ?? undefined });
    isConfigured = true;
  },

  /**
   * Switch the RevenueCat user when the Supabase user changes.
   */
  async setUser(userId: string | null): Promise<void> {
    if (!isConfigured) return;

    if (userId) {
      await Purchases.logIn(userId);
      return;
    }

    await Purchases.logOut();
  },

  /**
   * Returns the monthly package from the current offering, or null if unavailable.
   */
  async getMonthlyPackage(): Promise<PurchasesPackage | null> {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.monthly ?? null;
  },

  /**
   * Purchase the monthly package.
   * Returns true on success, false if the user cancelled.
   * Throws on network/store errors.
   */
  async purchaseMonthly(): Promise<boolean> {
    const pkg = await this.getMonthlyPackage();
    if (!pkg) throw new Error('No package available');

    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return hasProEntitlement(customerInfo);
    } catch (error) {
      if (isUserCancelledError(error)) return false;
      throw error;
    }
  },

  /**
   * Restore previous purchases (required by App Store guidelines).
   * Returns true if the "pro" entitlement is now active.
   */
  async restorePurchases(): Promise<boolean> {
    const customerInfo = await Purchases.restorePurchases();
    return hasProEntitlement(customerInfo);
  },

  /**
   * Check current entitlement status (uses RevenueCat cache when available).
   */
  async isProActive(): Promise<boolean> {
    const info = await Purchases.getCustomerInfo();
    return hasProEntitlement(info);
  },
};
