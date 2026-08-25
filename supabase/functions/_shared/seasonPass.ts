export const PRO_ENTITLEMENT = 'pro';
export const PRO_SEASON_PRODUCT_ID = 'pro_season';

export type RevenueCatTransaction = {
  id?: string | null;
  purchase_date?: string | null;
  is_sandbox?: boolean;
  store?: string | null;
};
export type RevenueCatEntitlement = {
  expires_date?: string | null;
  product_identifier?: string | null;
  purchase_date?: string | null;
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
};

export type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
    non_subscriptions?: Record<string, RevenueCatTransaction[]>;
    original_app_user_id?: string;
  };
};

export type ProSeason = {
  code: string;
  starts_at: string;
  ends_at: string;
};

export type SubscriptionAccess = {
  plan: 'pro' | 'free';
  status: 'active' | 'inactive' | 'expired' | 'cancelled' | 'billing_issue';
  entitlementId: string | null;
  productId: string | null;
  expiresAt: string | null;
  seasonCode: string | null;
  purchasedAt: string | null;
  transactionId: string | null;
};

const validDate = (value: string | null | undefined): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const isSeasonActive = (season: ProSeason, now = new Date()): boolean => {
  const startsAt = validDate(season.starts_at);
  const endsAt = validDate(season.ends_at);
  if (!startsAt || !endsAt) return false;
  return now >= startsAt && now < endsAt;
};

export const getLatestSeasonPassTransaction = (
  response: RevenueCatSubscriberResponse,
): RevenueCatTransaction | null => {
  const transactions = response.subscriber?.non_subscriptions?.[PRO_SEASON_PRODUCT_ID] ?? [];

  return transactions.reduce<RevenueCatTransaction | null>((latest, candidate) => {
    const candidateDate = validDate(candidate.purchase_date);
    if (!candidateDate) return latest;
    const latestDate = validDate(latest?.purchase_date);
    return !latestDate || candidateDate > latestDate ? candidate : latest;
  }, null);
};

export const transactionBelongsToSeason = (
  transaction: RevenueCatTransaction | null,
  season: ProSeason,
): boolean => {
  const purchasedAt = validDate(transaction?.purchase_date);
  const startsAt = validDate(season.starts_at);
  const endsAt = validDate(season.ends_at);
  if (!purchasedAt || !startsAt || !endsAt) return false;
  return purchasedAt >= startsAt && purchasedAt < endsAt;
};

export const resolveSeasonPassAccess = ({
  transaction,
  season,
  cancelledTransactionId = null,
  now = new Date(),
}: {
  transaction: RevenueCatTransaction | null;
  season: ProSeason | null;
  cancelledTransactionId?: string | null;
  now?: Date;
}): SubscriptionAccess => {
  const transactionId = transaction?.id ?? null;
  const purchasedAt = validDate(transaction?.purchase_date)?.toISOString() ?? null;
  const isCancelled = !!transactionId && transactionId === cancelledTransactionId;
  const belongsToCurrentSeason = !!season && transactionBelongsToSeason(transaction, season);
  const canGrant = !!season && isSeasonActive(season, now) && belongsToCurrentSeason && !isCancelled;

  if (canGrant) {
    return {
      plan: 'pro',
      status: 'active',
      entitlementId: PRO_ENTITLEMENT,
      productId: PRO_SEASON_PRODUCT_ID,
      expiresAt: season.ends_at,
      seasonCode: season.code,
      purchasedAt,
      transactionId,
    };
  }

  return {
    plan: 'free',
    status: isCancelled ? 'cancelled' : transaction ? 'expired' : 'inactive',
    entitlementId: null,
    productId: transaction ? PRO_SEASON_PRODUCT_ID : null,
    expiresAt: null,
    seasonCode: null,
    purchasedAt,
    transactionId,
  };
};

/**
 * RevenueCat treats an active entitlement as the source of truth for access.
 * For the non-renewing season pass we still cap access to the season in which
 * it was purchased, rather than accepting the entitlement's unlimited expiry.
 */
export const resolveSeasonPassEntitlementAccess = (
  entitlement: RevenueCatEntitlement | undefined,
  season: ProSeason | null,
  now = new Date(),
): SubscriptionAccess | null => {
  if (!entitlement || entitlement.product_identifier !== PRO_SEASON_PRODUCT_ID) return null;

  const access = resolveSeasonPassAccess({
    transaction: { purchase_date: entitlement.purchase_date },
    season,
    now,
  });

  return access.plan === 'pro' ? access : null;
};

/** Keeps support for older auto-renewing products while the season pass replaces them. */
export const resolveLegacyEntitlementAccess = (
  entitlement: RevenueCatEntitlement | undefined,
  now = new Date(),
): SubscriptionAccess | null => {
  if (!entitlement || entitlement.product_identifier === PRO_SEASON_PRODUCT_ID) return null;
  const expiresAt = validDate(entitlement.expires_date);
  if (!expiresAt || expiresAt <= now) return null;

  return {
    plan: 'pro',
    status: entitlement.billing_issues_detected_at
      ? 'billing_issue'
      : entitlement.unsubscribe_detected_at
        ? 'cancelled'
        : 'active',
    entitlementId: PRO_ENTITLEMENT,
    productId: entitlement.product_identifier ?? null,
    expiresAt: expiresAt.toISOString(),
    seasonCode: null,
    purchasedAt: validDate(entitlement.purchase_date)?.toISOString() ?? null,
    transactionId: null,
  };
};
