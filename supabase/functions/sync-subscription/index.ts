// deno-lint-ignore no-import-prefix
import { createClient } from 'npm:@supabase/supabase-js@2.75.0';
import {
  getLatestSeasonPassTransaction,
  PRO_ENTITLEMENT,
  PRO_SEASON_PRODUCT_ID,
  resolveLegacyEntitlementAccess,
  resolveSeasonPassAccess,
  transactionBelongsToSeason,
  type ProSeason,
  type RevenueCatSubscriberResponse,
  type SubscriptionAccess,
} from '../_shared/seasonPass.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const REVENUECAT_SECRET_API_KEY = Deno.env.get('REVENUECAT_SECRET_API_KEY') ?? '';
const REVENUECAT_SYNC_ATTEMPTS = 3;
const REVENUECAT_SYNC_RETRY_DELAY_MS = 1500;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRevenueCatSubscriber(
  appUserId: string,
  season: ProSeason | null,
): Promise<{
  data: RevenueCatSubscriberResponse | null;
  errorStatus: number | null;
  errorMessage: string | null;
}> {
  let lastData: RevenueCatSubscriberResponse | null = null;

  for (let attempt = 0; attempt < REVENUECAT_SYNC_ATTEMPTS; attempt++) {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_SECRET_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const message = await response.text();
      const retryable =
        response.status === 404 || response.status === 429 || response.status >= 500;

      if (retryable && attempt < REVENUECAT_SYNC_ATTEMPTS - 1) {
        await wait(REVENUECAT_SYNC_RETRY_DELAY_MS);
        continue;
      }

      return { data: null, errorStatus: response.status, errorMessage: message };
    }

    lastData = (await response.json()) as RevenueCatSubscriberResponse;
    const latestTransaction = getLatestSeasonPassTransaction(lastData);
    const foundCurrentPurchase = !!season && transactionBelongsToSeason(latestTransaction, season);
    const legacyEntitlement = resolveLegacyEntitlementAccess(
      lastData.subscriber?.entitlements?.[PRO_ENTITLEMENT],
    );

    if (foundCurrentPurchase || legacyEntitlement || attempt === REVENUECAT_SYNC_ATTEMPTS - 1) {
      return { data: lastData, errorStatus: null, errorMessage: null };
    }

    // RevenueCat's REST snapshot can lag briefly behind purchasePackage().
    await wait(REVENUECAT_SYNC_RETRY_DELAY_MS);
  }

  return { data: lastData, errorStatus: null, errorMessage: null };
}

async function fetchCurrentSeason(
  // deno-lint-ignore no-explicit-any
  adminClient: any,
): Promise<{ season: ProSeason | null; failed: boolean }> {
  const { data, error } = await adminClient.rpc('get_current_season');
  if (error) {
    console.error('Failed to fetch current season:', error.message);
    return { season: null, failed: true };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return {
    season: row
      ? { code: row.code, starts_at: row.starts_at, ends_at: row.ends_at }
      : null,
    failed: false,
  };
}

const toUpsert = (
  userId: string,
  revenueCatAppUserId: string,
  access: SubscriptionAccess,
) => ({
  user_id: userId,
  plan: access.plan,
  status: access.status,
  entitlement_id: access.entitlementId,
  product_id: access.productId,
  revenuecat_app_user_id: revenueCatAppUserId,
  expires_at: access.expiresAt,
  season_code: access.seasonCode,
  purchased_at: access.purchasedAt,
  transaction_id: access.transactionId,
  updated_at: new Date().toISOString(),
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!REVENUECAT_SECRET_API_KEY) {
    return json({ error: 'RevenueCat secret API key is not configured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Missing authorization header' }, 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Unauthorized' }, 401);

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: allowed, error: rateLimitError } = await adminClient.rpc(
    'consume_subscription_sync_attempt',
    { p_user_id: user.id, p_cooldown_seconds: 30 },
  );
  if (rateLimitError) {
    console.error('Subscription sync rate-limit error:', rateLimitError.message);
    return json({ error: 'Failed to check sync limit' }, 500);
  }
  if (!allowed) return json({ error: 'Too many requests. Try again shortly.' }, 429);

  const seasonResult = await fetchCurrentSeason(adminClient);
  if (seasonResult.failed) return json({ error: 'Failed to fetch current season' }, 500);

  const revenueCatResult = await fetchRevenueCatSubscriber(user.id, seasonResult.season);
  if (!revenueCatResult.data) {
    console.error(
      'RevenueCat API error:',
      revenueCatResult.errorStatus,
      revenueCatResult.errorMessage,
    );
    return json({ error: 'Failed to fetch subscription from RevenueCat' }, 502);
  }

  const { data: existing } = await adminClient
    .from('user_subscriptions')
    .select('plan, status, expires_at, season_code, purchased_at, transaction_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const rcData = revenueCatResult.data;
  const latestTransaction = getLatestSeasonPassTransaction(rcData);
  const cancelledTransactionId = existing?.status === 'cancelled' ? existing.transaction_id : null;
  const seasonPassAccess = resolveSeasonPassAccess({
    transaction: latestTransaction,
    season: seasonResult.season,
    cancelledTransactionId,
  });
  const legacyAccess = resolveLegacyEntitlementAccess(
    rcData.subscriber?.entitlements?.[PRO_ENTITLEMENT],
  );
  let access = seasonPassAccess.plan === 'pro' ? seasonPassAccess : legacyAccess ?? seasonPassAccess;

  // Do not regress a verified current-season purchase if RevenueCat's snapshot
  // is briefly stale immediately after a webhook processed it.
  const existingVerifiedCurrentSeason =
    existing?.plan === 'pro' &&
    !!existing.transaction_id &&
    existing.season_code === seasonResult.season?.code &&
    !!existing.expires_at &&
    new Date(existing.expires_at).getTime() > Date.now();

  if (access.plan === 'free' && existingVerifiedCurrentSeason) {
    access = {
      plan: 'pro',
      status: 'active',
      entitlementId: PRO_ENTITLEMENT,
      productId: PRO_SEASON_PRODUCT_ID,
      expiresAt: existing.expires_at,
      seasonCode: existing.season_code,
      purchasedAt: existing.purchased_at,
      transactionId: existing.transaction_id,
    };
  }

  const revenueCatAppUserId = rcData.subscriber?.original_app_user_id ?? user.id;
  const { error } = await adminClient
    .from('user_subscriptions')
    .upsert(toUpsert(user.id, revenueCatAppUserId, access), { onConflict: 'user_id' });

  if (error) {
    console.error('Failed to upsert user_subscriptions:', error);
    return json({ error: 'Failed to sync subscription' }, 500);
  }

  return json({ plan: access.plan, status: access.status, expires_at: access.expiresAt });
});
