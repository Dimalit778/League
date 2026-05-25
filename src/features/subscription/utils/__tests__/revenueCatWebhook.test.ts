import {
  isAuthorizedWebhookRequest,
  mapRevenueCatEventToAction,
  type RevenueCatWebhookEvent,
} from '../revenueCatWebhook';

describe('revenueCatWebhook', () => {
  it('maps active purchase events to PRO upsert', () => {
    const action = mapRevenueCatEventToAction(
      {
        type: 'INITIAL_PURCHASE',
        app_user_id: 'user-1',
        product_id: 'pro_monthly',
        transaction_id: 'txn-1',
        purchased_at_ms: Date.parse('2026-05-01T00:00:00.000Z'),
        expiration_at_ms: Date.parse('2026-06-01T00:00:00.000Z'),
      },
      new Date('2026-05-24T00:00:00.000Z')
    );

    expect(action.action).toBe('upsert');
    if (action.action !== 'upsert') return;

    expect(action.payload).toEqual({
      user_id: 'user-1',
      subscription_type: 'PRO',
      start_date: '2026-05-01T00:00:00.000Z',
      end_date: '2026-06-01T00:00:00.000Z',
      product_id: 'pro_monthly',
      transaction_id: 'txn-1',
    });
  });

  it('maps expiration to expire action', () => {
    const now = new Date('2026-05-24T12:00:00.000Z');
    const action = mapRevenueCatEventToAction(
      { type: 'EXPIRATION', app_user_id: 'user-1' },
      now
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
    expect(isAuthorizedWebhookRequest('Bearer secret-123', 'secret-123')).toBe(true);
    expect(isAuthorizedWebhookRequest('Bearer wrong', 'secret-123')).toBe(false);
    expect(isAuthorizedWebhookRequest(null, 'secret-123')).toBe(false);
  });
});

describe('mapRevenueCatEventToAction - CANCELLATION as expire', () => {
  it('returns expire action for CANCELLATION event', () => {
    const event: RevenueCatWebhookEvent = {
      type: 'CANCELLATION',
      app_user_id: 'user-1',
    };
    const result = mapRevenueCatEventToAction(event, new Date('2026-01-01T00:00:00Z'));
    expect(result.action).toBe('expire');
    if (result.action === 'expire') {
      expect(result.userId).toBe('user-1');
    }
  });

  it('uses expiration_at_ms for CANCELLATION end date when provided', () => {
    const event: RevenueCatWebhookEvent = {
      type: 'CANCELLATION',
      app_user_id: 'user-1',
      expiration_at_ms: new Date('2026-03-01T00:00:00Z').getTime(),
    };
    const result = mapRevenueCatEventToAction(event, new Date('2026-01-01T00:00:00Z'));
    expect(result.action).toBe('expire');
    if (result.action === 'expire') {
      expect(result.endDate).toBe('2026-03-01T00:00:00.000Z');
    }
  });
});
