import { mapRevenueCatEventToAction } from '../../revenuecat/revenueCatMapper';
import { isAuthorizedWebhookRequest } from '../../revenuecat/revenueCatWebhook';
import type { RevenueCatWebhookEvent } from '../../revenuecat/types';

describe('revenueCatWebhook', () => {
  it('maps active purchase events to BASIC upsert for non-premium product', () => {
    const action = mapRevenueCatEventToAction(
      {
        type: 'INITIAL_PURCHASE',
        app_user_id: 'user-1',
        product_id: 'basic_monthly',
        transaction_id: 'txn-1',
        purchased_at_ms: Date.parse('2026-05-01T00:00:00.000Z'),
        expiration_at_ms: Date.parse('2026-06-01T00:00:00.000Z'),
      },
      new Date('2026-05-24T00:00:00.000Z'),
    );

    expect(action.action).toBe('upsert');
    if (action.action !== 'upsert') return;

    expect(action.payload).toEqual({
      user_id: 'user-1',
      subscription_type: 'BASIC',
      start_date: '2026-05-01T00:00:00.000Z',
      end_date: '2026-06-01T00:00:00.000Z',
      product_id: 'basic_monthly',
      transaction_id: 'txn-1',
    });
  });

  it('maps active purchase events to PREMIUM upsert for premium product', () => {
    const action = mapRevenueCatEventToAction(
      {
        type: 'INITIAL_PURCHASE',
        app_user_id: 'user-1',
        product_id: 'premium_monthly',
        transaction_id: 'txn-2',
        purchased_at_ms: Date.parse('2026-05-01T00:00:00.000Z'),
        expiration_at_ms: Date.parse('2026-06-01T00:00:00.000Z'),
      },
      new Date('2026-05-24T00:00:00.000Z'),
    );

    expect(action.action).toBe('upsert');
    if (action.action !== 'upsert') return;

    expect(action.payload.type).toBe('PRO');
  });

  it('maps expiration to expire action', () => {
    const now = new Date('2026-05-24T12:00:00.000Z');
    const action = mapRevenueCatEventToAction(
      { type: 'EXPIRATION', app_user_id: 'user-1' },
      now,
    );

    expect(action).toEqual({
      action: 'expire',
      userId: 'user-1',
      endDate: now.toISOString(),
    });
  });

  it('ignores billing issue events', () => {
    const action = mapRevenueCatEventToAction({
      type: 'BILLING_ISSUE',
      app_user_id: 'user-1',
    });

    expect(action).toEqual({ action: 'noop', reason: 'billing_issue' });
  });

  it('validates webhook authorization header', () => {
    expect(isAuthorizedWebhookRequest('Bearer secret-123', 'secret-123')).toBe(
      true,
    );
    expect(isAuthorizedWebhookRequest('Bearer wrong', 'secret-123')).toBe(
      false,
    );
    expect(isAuthorizedWebhookRequest(null, 'secret-123')).toBe(false);
  });
});

describe('mapRevenueCatEventToAction - CANCELLATION as noop', () => {
  it('returns noop action for CANCELLATION event (access continues until expiration_at_ms)', () => {
    const event: RevenueCatWebhookEvent = {
      type: 'CANCELLATION',
      app_user_id: 'user-1',
    };
    const result = mapRevenueCatEventToAction(
      event,
      new Date('2026-01-01T00:00:00Z'),
    );
    expect(result).toEqual({
      action: 'noop',
      reason: 'cancellation_pending_expiration',
    });
  });

  it('returns noop even when expiration_at_ms is provided (EXPIRATION event handles actual downgrade)', () => {
    const event: RevenueCatWebhookEvent = {
      type: 'CANCELLATION',
      app_user_id: 'user-1',
      expiration_at_ms: new Date('2026-03-01T00:00:00Z').getTime(),
    };
    const result = mapRevenueCatEventToAction(
      event,
      new Date('2026-01-01T00:00:00Z'),
    );
    expect(result).toEqual({
      action: 'noop',
      reason: 'cancellation_pending_expiration',
    });
  });
});
