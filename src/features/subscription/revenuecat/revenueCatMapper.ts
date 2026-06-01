import { getSubscriptionPlanFromProductId } from '../config/plans';
import type { RevenueCatEventType, RevenueCatWebhookEvent, WebhookAction } from './types';

const ACTIVE_EVENTS = new Set<RevenueCatEventType>(['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']);

const DEFAULT_SUBSCRIPTION_DURATION_DAYS = 30;

const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const getStartDate = (purchasedAtMs: number | null | undefined, now: Date): string => {
  return purchasedAtMs ? new Date(purchasedAtMs).toISOString() : now.toISOString();
};

const getEndDate = (expirationAtMs: number | null | undefined, now: Date): string => {
  return expirationAtMs
    ? new Date(expirationAtMs).toISOString()
    : addDays(now, DEFAULT_SUBSCRIPTION_DURATION_DAYS).toISOString();
};

export const mapRevenueCatEventToAction = (event: RevenueCatWebhookEvent, now: Date = new Date()): WebhookAction => {
  if (!event.app_user_id) {
    return { action: 'noop', reason: 'missing_app_user_id' };
  }

  if (ACTIVE_EVENTS.has(event.type)) {
    return {
      action: 'upsert',
      payload: {
        user_id: event.app_user_id,
        type: getSubscriptionPlanFromProductId(event.product_id),
        start_date: getStartDate(event.purchased_at_ms, now),
        end_date: getEndDate(event.expiration_at_ms, now),
        product_id: event.product_id ?? null,
        transaction_id: event.transaction_id ?? null,
      },
    };
  }

  if (event.type === 'EXPIRATION') {
    return {
      action: 'expire',
      userId: event.app_user_id,
      endDate: now.toISOString(),
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
