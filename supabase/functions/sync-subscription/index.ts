import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const REVENUECAT_SECRET_API_KEY = Deno.env.get('REVENUECAT_SECRET_API_KEY') ?? '';

const PRO_ENTITLEMENT = 'pro';
const REVENUECAT_SYNC_ATTEMPTS = 3;
const REVENUECAT_SYNC_RETRY_DELAY_MS = 1500;

type RevenueCatEntitlement = {
  expires_date?: string | null;
  product_identifier?: string | null;
  unsubscribe_detected_at?: string | null;
  billing_issues_detected_at?: string | null;
};

type RevenueCatSubscriberResponse = {
  subscriber?: {
    entitlements?: Record<string, RevenueCatEntitlement>;
    original_app_user_id?: string;
  };
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRevenueCatSubscriber(appUserId: string): Promise<{
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
    const entitlement = lastData.subscriber?.entitlements?.[PRO_ENTITLEMENT];
    const parsed = parseEntitlement(entitlement);

    if (parsed.plan === 'pro' || attempt === REVENUECAT_SYNC_ATTEMPTS - 1) {
      return { data: lastData, errorStatus: null, errorMessage: null };
    }

    await wait(REVENUECAT_SYNC_RETRY_DELAY_MS);
  }

  return { data: lastData, errorStatus: null, errorMessage: null };
}

function parseEntitlement(
  entitlement: RevenueCatEntitlement | undefined,
): { plan: 'pro' | 'free'; status: string; expiresAt: string | null; productId: string | null } {
  // No entitlement object at all -> the user was never granted Pro.
  if (!entitlement) {
    return { plan: 'free', status: 'inactive', expiresAt: null, productId: null };
  }

  // Non-expiring entitlement (non-consumable / non-renewing season pass):
  // present with no expires_date === active lifetime Pro. The old auto-renewable
  // model always carried an expires_date, so the previous `!expires_date` guard
  // wrongly treated the flat-price season pass as free.
  if (!entitlement.expires_date) {
    return {
      plan: 'pro',
      status: entitlement.billing_issues_detected_at ? 'billing_issue' : 'active',
      expiresAt: null,
      productId: entitlement.product_identifier ?? null,
    };
  }

  const expiresAt = new Date(entitlement.expires_date);
  const isActive = expiresAt.getTime() > Date.now();

  if (!isActive) {
    return {
      plan: 'free',
      status: 'expired',
      expiresAt: expiresAt.toISOString(),
      productId: entitlement.product_identifier ?? null,
    };
  }

  let status = 'active';
  if (entitlement.billing_issues_detected_at) {
    status = 'billing_issue';
  } else if (entitlement.unsubscribe_detected_at) {
    status = 'cancelled';
  }

  return {
    plan: 'pro',
    status,
    expiresAt: expiresAt.toISOString(),
    productId: entitlement.product_identifier ?? null,
  };
}

type CurrentSeason = { code: string; ends_at: string };

async function fetchCurrentSeason(
  adminClient: ReturnType<typeof createClient>,
): Promise<{ season: CurrentSeason | null; failed: boolean }> {
  const { data, error } = await adminClient.rpc('get_current_season');
  if (error) {
    console.error('Failed to fetch current season:', error.message);
    return { season: null, failed: true };
  }
  const row = Array.isArray(data) ? data[0] : data;
  return { season: row ? { code: row.code, ends_at: row.ends_at } : null, failed: false };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  if (!REVENUECAT_SECRET_API_KEY) {
    return json({ error: 'RevenueCat secret API key is not configured' }, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing authorization header' }, 401);
  }

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return json({ error: 'Unauthorized' }, 401);
  }

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

  if (!allowed) {
    return json({ error: 'Too many requests. Try again shortly.' }, 429);
  }

  const revenueCatResult = await fetchRevenueCatSubscriber(user.id);

  if (!revenueCatResult.data) {
    console.error(
      'RevenueCat API error:',
      revenueCatResult.errorStatus,
      revenueCatResult.errorMessage,
    );
    return json({ error: 'Failed to fetch subscription from RevenueCat' }, 502);
  }

  const rcData = revenueCatResult.data;
  const entitlement = rcData.subscriber?.entitlements?.[PRO_ENTITLEMENT];
  const parsed = parseEntitlement(entitlement);

  // This client-triggered sync exists to PROMOTE a user to Pro right after a
  // purchase. Downgrades are owned by the RevenueCat webhook (EXPIRATION /
  // CANCELLATION). If RevenueCat's REST read momentarily lags behind a fresh
  // purchase/renewal and reports 'free', do not let it clobber an active Pro
  // row the webhook already wrote.
  if (parsed.plan === 'free') {
    const { data: existing } = await adminClient
      .from('user_subscriptions')
      .select('plan, status, expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const existingIsActivePro =
      existing?.plan === 'pro' &&
      (!existing.expires_at || new Date(existing.expires_at).getTime() > Date.now());

    if (existingIsActivePro) {
      return json({
        plan: 'pro',
        status: existing.status ?? 'active',
        expires_at: existing.expires_at ?? null,
      });
    }
  }

  // A Pro entitlement is honored only within a defined season window, with the
  // fixed calendar expiry set to the season end regardless of purchase date.
  let plan = parsed.plan;
  let status = parsed.status;
  let expiresAt = parsed.expiresAt;
  let seasonCode: string | null = null;

  if (parsed.plan === 'pro') {
    const seasonResult = await fetchCurrentSeason(adminClient);
    if (seasonResult.failed) {
      return json({ error: 'Failed to fetch current season' }, 500);
    }
    const season = seasonResult.season;
    if (!season) {
      // No active season: do not grant Pro (aligned with the client blocking sale).
      plan = 'free';
      status = 'inactive';
      expiresAt = null;
    } else {
      expiresAt = season.ends_at;
      seasonCode = season.code;
      // Re-derive active state from the clamped, season-bounded expiry.
      if (new Date(season.ends_at).getTime() <= Date.now()) {
        plan = 'free';
        status = 'expired';
      }
    }
  }

  const { error } = await adminClient.from('user_subscriptions').upsert(
    {
      user_id: user.id,
      plan,
      status,
      entitlement_id: plan === 'pro' ? PRO_ENTITLEMENT : null,
      product_id: parsed.productId,
      revenuecat_app_user_id: rcData.subscriber?.original_app_user_id ?? user.id,
      expires_at: expiresAt,
      season_code: seasonCode,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to upsert user_subscriptions:', error);
    return json({ error: 'Failed to sync subscription' }, 500);
  }

  return json({ plan, status, expires_at: expiresAt });
});
