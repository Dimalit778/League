import {
  getLatestSeasonPassTransaction,
  resolveSeasonPassAccess,
  transactionBelongsToSeason,
  type ProSeason,
} from './seasonPass.ts';

const assertEquals = (actual: unknown, expected: unknown) => {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, received ${actualJson}`);
  }
};

const season: ProSeason = {
  code: '2026-27',
  starts_at: '2026-08-01T00:00:00.000Z',
  ends_at: '2027-08-01T00:00:00.000Z',
};

Deno.test('selects the latest pro_season transaction', () => {
  const latest = getLatestSeasonPassTransaction({
    subscriber: {
      non_subscriptions: {
        pro_season: [
          { id: 'old', purchase_date: '2025-08-20T10:00:00Z' },
          { id: 'current', purchase_date: '2026-08-20T10:00:00Z' },
        ],
      },
    },
  });

  assertEquals(latest?.id, 'current');
});

Deno.test('grants pro only when the purchase belongs to the active season', () => {
  const transaction = { id: 'tx-current', purchase_date: '2026-08-20T10:00:00Z' };
  assertEquals(transactionBelongsToSeason(transaction, season), true);

  assertEquals(
    resolveSeasonPassAccess({
      transaction,
      season,
      now: new Date('2026-09-01T00:00:00Z'),
    }),
    {
      plan: 'pro',
      status: 'active',
      entitlementId: 'pro',
      productId: 'pro_season',
      expiresAt: season.ends_at,
      seasonCode: season.code,
      purchasedAt: '2026-08-20T10:00:00.000Z',
      transactionId: 'tx-current',
    },
  );
});

Deno.test('does not carry a previous season purchase into the current season', () => {
  const result = resolveSeasonPassAccess({
    transaction: { id: 'tx-old', purchase_date: '2025-08-20T10:00:00Z' },
    season,
    now: new Date('2026-09-01T00:00:00Z'),
  });

  assertEquals(result.plan, 'free');
  assertEquals(result.status, 'expired');
});

Deno.test('a refunded transaction stays cancelled until a newer purchase exists', () => {
  const result = resolveSeasonPassAccess({
    transaction: { id: 'tx-refunded', purchase_date: '2026-08-20T10:00:00Z' },
    season,
    cancelledTransactionId: 'tx-refunded',
    now: new Date('2026-09-01T00:00:00Z'),
  });

  assertEquals(result.plan, 'free');
  assertEquals(result.status, 'cancelled');
});

Deno.test('does not grant before or after the configured season window', () => {
  const transaction = { id: 'tx-current', purchase_date: '2026-08-20T10:00:00Z' };
  assertEquals(
    resolveSeasonPassAccess({ transaction, season, now: new Date('2027-08-01T00:00:00Z') }).plan,
    'free',
  );
});
