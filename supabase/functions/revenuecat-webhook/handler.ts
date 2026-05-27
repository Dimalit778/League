export type RevenueCatEventType =
  | 'INITIAL_PURCHASE'
  | 'RENEWAL'
  | 'PRODUCT_CHANGE'
  | 'UNCANCELLATION'
  | 'CANCELLATION'
  | 'EXPIRATION'
  | 'BILLING_ISSUE';

export type RevenueCatWebhookEvent = {
  type: RevenueCatEventType;
  app_user_id: string;
  product_id?: string | null;
  transaction_id?: string | null;
  purchased_at_ms?: number | null;
  expiration_at_ms?: number | null;
};

export type SubscriptionUpsertPayload = {
  user_id: string;
  subscription_type: 'PRO' | 'FREE';
  start_date: string;
  end_date: string;
  product_id?: string | null;
  transaction_id?: string | null;
};

export type WebhookAction =
  | { action: 'upsert'; payload: SubscriptionUpsertPayload }
  | { action: 'expire'; userId: string; endDate: string }
  | { action: 'noop'; reason: string };

const ACTIVE_EVENTS = new Set<RevenueCatEventType>([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

export const mapRevenueCatEventToAction = (
  event: RevenueCatWebhookEvent,
  now: Date = new Date()
): WebhookAction => {
  if (!event.app_user_id) {
    return { action: 'noop', reason: 'missing_app_user_id' };
  }

  if (ACTIVE_EVENTS.has(event.type)) {
    const startDate = event.purchased_at_ms
      ? new Date(event.purchased_at_ms).toISOString()
      : now.toISOString();
    const endDate = event.expiration_at_ms
      ? new Date(event.expiration_at_ms).toISOString()
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    return {
      action: 'upsert',
      payload: {
        user_id: event.app_user_id,
        subscription_type: 'PRO',
        start_date: startDate,
        end_date: endDate,
        product_id: event.product_id ?? null,
        transaction_id: event.transaction_id ?? null,
      },
    };
  }

  if (event.type === 'EXPIRATION') {
    return {
      action: 'expire',
      userId: event.app_user_id,
      // Use RevenueCat's canonical expiry timestamp so retried deliveries are
      // idempotent and don't advance end_date on each retry.
      endDate: event.expiration_at_ms
        ? new Date(event.expiration_at_ms).toISOString()
        : now.toISOString(),
    };
  }

  if (event.type === 'CANCELLATION') {
    return { action: 'noop', reason: 'cancellation_pending_expiration' };
  }

  if (event.type === 'BILLING_ISSUE') {
    return { action: 'noop', reason: 'billing_issue' };
  }

  return { action: 'noop', reason: 'unsupported_event' };
};

export const isAuthorizedWebhookRequest = (
  authorizationHeader: string | null,
  expectedSecret: string | undefined
): boolean => {
  if (!expectedSecret) return false;
  if (!authorizationHeader) return false;
  return authorizationHeader === `Bearer ${expectedSecret}`;
};
