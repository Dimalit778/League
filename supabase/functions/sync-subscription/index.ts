import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const REVENUECAT_SECRET_API_KEY = Deno.env.get('REVENUECAT_SECRET_API_KEY') ?? '';

const PRO_ENTITLEMENT = 'pro';

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

function parseEntitlement(
  entitlement: RevenueCatEntitlement | undefined,
): { plan: 'pro' | 'free'; status: string; expiresAt: string | null; productId: string | null } {
  if (!entitlement?.expires_date) {
    return { plan: 'free', status: 'inactive', expiresAt: null, productId: null };
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

  const rcResponse = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(user.id)}`,
    {
      headers: {
        Authorization: `Bearer ${REVENUECAT_SECRET_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!rcResponse.ok) {
    const message = await rcResponse.text();
    console.error('RevenueCat API error:', rcResponse.status, message);
    return json({ error: 'Failed to fetch subscription from RevenueCat' }, 502);
  }

  const rcData = (await rcResponse.json()) as RevenueCatSubscriberResponse;
  const entitlement = rcData.subscriber?.entitlements?.[PRO_ENTITLEMENT];
  const parsed = parseEntitlement(entitlement);

  const { error } = await adminClient.from('user_subscriptions').upsert(
    {
      user_id: user.id,
      plan: parsed.plan,
      status: parsed.status,
      entitlement_id: parsed.plan === 'pro' ? PRO_ENTITLEMENT : null,
      product_id: parsed.productId,
      revenuecat_app_user_id: rcData.subscriber?.original_app_user_id ?? user.id,
      expires_at: parsed.expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    console.error('Failed to upsert user_subscriptions:', error);
    return json({ error: 'Failed to sync subscription' }, 500);
  }

  return json({
    plan: parsed.plan,
    status: parsed.status,
    expires_at: parsed.expiresAt,
  });
});
