import type { CustomerInfo } from 'react-native-purchases';

export const PRO_ENTITLEMENT = 'pro';

export type SubscriptionSummary = {
  isActive: boolean;
  expiresAt: string | null;
  productId: string | null;
  willRenew: boolean | null;
  isAnonymous: boolean;
};

export const getSubscriptionSummary = (
  info: CustomerInfo | null,
  entitlementId = PRO_ENTITLEMENT,
): SubscriptionSummary => {
  const active = info?.entitlements?.active?.[entitlementId];
  const all = info?.entitlements?.all?.[entitlementId];

  return {
    isActive: !!active,
    expiresAt: active?.expirationDate ?? all?.expirationDate ?? null,
    productId: active?.productIdentifier ?? all?.productIdentifier ?? null,
    willRenew: active?.willRenew ?? all?.willRenew ?? null,
    isAnonymous: info?.originalAppUserId?.startsWith('$RCAnonymousID:') ?? true,
  };
};

export const hasActiveEntitlement = (
  info: CustomerInfo | null,
  entitlementId?: string,
): boolean => {
  if (!info?.entitlements?.active) return false;

  const activeEntitlements = info.entitlements.active;

  if (!entitlementId) {
    return Object.keys(activeEntitlements).length > 0;
  }

  return activeEntitlements[entitlementId] !== undefined;
};
