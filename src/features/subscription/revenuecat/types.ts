import type { SubscriptionPlan } from '../config/plans';

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
  type: SubscriptionPlan;
  start_date: string;
  end_date: string;
  product_id?: string | null;
  transaction_id?: string | null;
};

export type WebhookAction =
  | { action: 'upsert'; payload: SubscriptionUpsertPayload }
  | { action: 'expire'; userId: string; endDate: string }
  | { action: 'noop'; reason: string };
