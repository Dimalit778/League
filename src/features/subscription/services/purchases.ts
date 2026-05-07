/**
 * RevenueCat integration service.
 *
 * Setup:
 *   1. Install SDK:  npx expo install react-native-purchases
 *   2. Run prebuild: npx expo prebuild
 *   3. Add API keys to .env:
 *        EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_xxxxx
 *        EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxx
 *   4. Call `purchasesService.configure()` once on app startup (e.g. in AuthProvider).
 *   5. Replace every TODO stub below with the real SDK call.
 *
 * RevenueCat docs: https://www.revenuecat.com/docs/getting-started/installation/react-native
 *
 * Identifier conventions used here:
 *   - Offering identifier: "default"
 *   - Package identifier: "$rc_monthly"   (RevenueCat built-in monthly alias)
 *   - Entitlement identifier: "pro"
 */

// TODO: uncomment after installing react-native-purchases
// import Purchases, { LOG_LEVEL, PurchasesPackage } from 'react-native-purchases';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export const purchasesService = {
  /**
   * Call once at app startup after the user session is ready.
   */
  configure(userId: string | null): void {
    // TODO:
    // const apiKey = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
    // Purchases.setLogLevel(LOG_LEVEL.DEBUG);      // remove in production
    // Purchases.configure({ apiKey });
    // if (userId) Purchases.logIn(userId);
    void IOS_KEY;
    void ANDROID_KEY;
    void userId;
  },

  /**
   * Switch the RevenueCat user when the Supabase user changes.
   */
  async setUser(userId: string | null): Promise<void> {
    // TODO:
    // if (userId) {
    //   await Purchases.logIn(userId);
    // } else {
    //   await Purchases.logOut();
    // }
    void userId;
  },

  /**
   * Returns the monthly package from the "default" offering, or null if unavailable.
   */
  async getMonthlyPackage(): Promise<null> {
    // TODO:
    // const offerings = await Purchases.getOfferings();
    // return offerings.current?.monthly ?? null;
    return null;
  },

  /**
   * Purchase the monthly package.
   * Returns true on success, false if the user cancelled.
   * Throws on network/store errors.
   */
  async purchaseMonthly(): Promise<boolean> {
    // TODO:
    // const pkg = await this.getMonthlyPackage();
    // if (!pkg) throw new Error('No package available');
    // const { customerInfo } = await Purchases.purchasePackage(pkg);
    // return !!customerInfo.entitlements.active['pro'];
    return false;
  },

  /**
   * Restore previous purchases (required by App Store guidelines).
   * Returns true if the "pro" entitlement is now active.
   */
  async restorePurchases(): Promise<boolean> {
    // TODO:
    // const customerInfo = await Purchases.restorePurchases();
    // return !!customerInfo.entitlements.active['pro'];
    return false;
  },

  /**
   * Check current entitlement status without a network call (uses cache).
   */
  async isProActive(): Promise<boolean> {
    // TODO:
    // const info = await Purchases.getCustomerInfo();
    // return !!info.entitlements.active['pro'];
    return false;
  },
};
