import {
  isAuthorizedWebhookRequest,
  mapRevenueCatEventToAction,
} from '../revenueCatWebhook';

describe('revenueCatWebhook', () => {
  it('maps active purchase events to BASIC upsert', () => {
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
      subscription_type: 'BASIC',
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

  it('ignores cancellation events', () => {
    const action = mapRevenueCatEventToAction({
      type: 'CANCELLATION',
      app_user_id: 'user-1',
    });

    expect(action).toEqual({ action: 'noop', reason: 'cancellation' });
  });

  it('validates webhook authorization header', () => {
    expect(isAuthorizedWebhookRequest('Bearer secret-123', 'secret-123')).toBe(true);
    expect(isAuthorizedWebhookRequest('Bearer wrong', 'secret-123')).toBe(false);
    expect(isAuthorizedWebhookRequest(null, 'secret-123')).toBe(false);
  });
});
