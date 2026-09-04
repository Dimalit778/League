// deno-lint-ignore no-import-prefix
import { createClient } from 'npm:@supabase/supabase-js@2.75.0';
import {
  PRO_ENTITLEMENT,
  PRO_SEASON_PRODUCT_ID,
  resolveSeasonPassAccess,
  type ProSeason,
} from '../_shared/seasonPass.ts';
import { createRequestId, logException, monitoredErrorResponse } from '../_shared/monitoring.ts';

const JOB = 'revenuecat-webhook';

const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const HANDLED_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'NON_RENEWING_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'REFUND_REVERSED',
  'TRANSFER',
]);

// Edge Functions use the project schema dynamically; generated database types
// are not bundled into this runtime module.
// deno-lint-ignore no-explicit-any
type AdminClient = any;
type RevenueCatEvent = {
  id?: string | null;
  type?: string;
  app_user_id?: string | null;
  aliases?: string[];
  product_id?: string | null;
  entitlement_id?: string | null;
  entitlement_ids?: string[];
  purchased_at_ms?: number | null;
  expiration_at_ms?: number | null;
  transaction_id?: string | null;
  cancel_reason?: string | null;
  transferred_from?: string[];
  transferred_to?: string[];
};

function response(message: string, status = 200) {
  return new Response(message, { status });
}

async function isDuplicateEvent(supabase: AdminClient, eventId: string | null) {
  if (!eventId) return false;
  const { data, error } = await supabase
    .from('revenuecat_events')
    .select('id')
    .eq('event_id', eventId)
    .limit(1)
    .maybeSingle();
  if (error) logException(JOB, error, { operation: 'revenuecat_events.duplicate_check' });
  return !!data;
}

async function storeEvent(
  supabase: AdminClient,
  body: unknown,
  event: RevenueCatEvent,
  processed: boolean,
) {
  const { error } = await supabase.from('revenuecat_events').insert({
    app_user_id: event.app_user_id ?? null,
    event_type: event.type ?? 'UNKNOWN',
    event_id: event.id ?? null,
    payload: body,
    processed,
  });
  if (error) logException(JOB, error, { operation: 'revenuecat_events.insert' });
}

async function resolveUserId(supabase: AdminClient, revenueCatIds: string[]) {
  for (const revenueCatId of [...new Set(revenueCatIds.filter(Boolean))]) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', revenueCatId)
      .maybeSingle();
    if (userError) logException(JOB, userError, { operation: 'users.lookup' });
    if (user?.id) return user.id as string;

    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('user_id')
      .eq('revenuecat_app_user_id', revenueCatId)
      .maybeSingle();
    if (subscriptionError) {
      logException(JOB, subscriptionError, { operation: 'user_subscriptions.lookup' });
    }
    if (subscription?.user_id) return subscription.user_id as string;
  }
  return null;
}

async function fetchCurrentSeason(
  supabase: AdminClient,
): Promise<{ season: ProSeason | null; failed: boolean }> {
  const { data, error } = await supabase.rpc('get_current_season');
  if (error) {
    logException(JOB, error, { operation: 'get_current_season' });
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

async function upsertSeasonPass(
  supabase: AdminClient,
  userId: string,
  event: RevenueCatEvent,
  season: ProSeason | null,
) {
  const transaction = {
    id: event.transaction_id ?? null,
    purchase_date: event.purchased_at_ms
      ? new Date(event.purchased_at_ms).toISOString()
      : null,
  };
  const isRefund = event.type === 'CANCELLATION';
  const access = resolveSeasonPassAccess({
    transaction,
    season,
    cancelledTransactionId: isRefund ? transaction.id : null,
  });
  const revenueCatAppUserId = event.app_user_id ?? userId;

  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan: access.plan,
    status: access.status,
    entitlement_id: access.entitlementId,
    product_id: PRO_SEASON_PRODUCT_ID,
    revenuecat_app_user_id: revenueCatAppUserId,
    expires_at: access.expiresAt,
    season_code: access.seasonCode,
    purchased_at: access.purchasedAt,
    transaction_id: access.transactionId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });

  if (error) throw error;
  return access;
}

function legacyPlan(event: RevenueCatEvent): 'pro' | 'free' {
  if (event.type === 'EXPIRATION') return 'free';
  if (event.type === 'BILLING_ISSUE') {
    return event.expiration_at_ms && event.expiration_at_ms > Date.now() ? 'pro' : 'free';
  }
  return 'pro';
}

function legacyStatus(event: RevenueCatEvent) {
  if (event.type === 'EXPIRATION') return 'expired';
  if (event.type === 'BILLING_ISSUE') return 'billing_issue';
  if (event.type === 'CANCELLATION') return 'cancelled';
  return 'active';
}

async function upsertLegacySubscription(
  supabase: AdminClient,
  userId: string,
  event: RevenueCatEvent,
) {
  const plan = legacyPlan(event);
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;
  const entitlementId = event.entitlement_id ?? event.entitlement_ids?.[0] ?? null;
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan,
    status: legacyStatus(event),
    entitlement_id: plan === 'pro' ? entitlementId ?? PRO_ENTITLEMENT : null,
    product_id: event.product_id ?? null,
    revenuecat_app_user_id: event.app_user_id ?? userId,
    expires_at: expiresAt,
    season_code: null,
    purchased_at: event.purchased_at_ms
      ? new Date(event.purchased_at_ms).toISOString()
      : null,
    transaction_id: null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) throw error;
}

async function handleTransfer(supabase: AdminClient, event: RevenueCatEvent) {
  const sourceIds = event.transferred_from ?? [];
  const targetIds = event.transferred_to ?? [];
  const sourceUserId = await resolveUserId(supabase, sourceIds);
  if (!sourceUserId) return false;

  const { data: source, error: sourceError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', sourceUserId)
    .maybeSingle();
  if (sourceError) logException(JOB, sourceError, { operation: 'transfer.source_lookup' });
  if (!source) return false;

  // Each target is an independent user_subscriptions row (onConflict: user_id),
  // so the transfers can run concurrently.
  const results = await Promise.all(
    targetIds.map(async (targetId) => {
      const targetUserId = await resolveUserId(supabase, [targetId]);
      if (!targetUserId) return false;
      const { error } = await supabase.from('user_subscriptions').upsert({
        ...source,
        user_id: targetUserId,
        revenuecat_app_user_id: targetId,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      if (error) {
        logException(JOB, error, { operation: 'transfer.target_upsert', targetUserId });
      }
      return !error;
    }),
  );
  return results.some(Boolean);
}

const handleRequest = async (req: Request) => {
  if (req.method !== 'POST') return response('Method not allowed', 405);
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== REVENUECAT_WEBHOOK_SECRET) {
    return response('Unauthorized', 401);
  }

  let body: { event?: RevenueCatEvent };
  try {
    body = await req.json();
  } catch {
    return response('Invalid JSON', 400);
  }

  const event = body.event;
  if (!event?.type) return response('Missing event', 400);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const eventId = event.id ?? null;
  if (await isDuplicateEvent(supabase, eventId)) return response('Duplicate event ignored');

  if (!HANDLED_EVENTS.has(event.type)) {
    await storeEvent(supabase, body, event, true);
    return response('Event ignored');
  }

  if (event.type === 'TRANSFER') {
    const processed = await handleTransfer(supabase, event);
    await storeEvent(supabase, body, event, processed);
    return response(processed ? 'TRANSFER processed' : 'TRANSFER stored');
  }

  const userId = await resolveUserId(supabase, [event.app_user_id ?? '', ...(event.aliases ?? [])]);
  if (!userId) {
    await storeEvent(supabase, body, event, false);
    return response('User not found, event stored');
  }

  try {
    if (event.product_id === PRO_SEASON_PRODUCT_ID) {
      const seasonResult = await fetchCurrentSeason(supabase);
      if (seasonResult.failed) throw new Error('Failed to fetch current season');
      await upsertSeasonPass(supabase, userId, event, seasonResult.season);
    } else if (event.type !== 'NON_RENEWING_PURCHASE' && event.type !== 'REFUND_REVERSED') {
      await upsertLegacySubscription(supabase, userId, event);
    }

    await storeEvent(supabase, body, event, true);
    return response('OK');
  } catch (error) {
    await storeEvent(supabase, body, event, false);
    throw error;
  }
};

Deno.serve(async (req) => {
  const requestId = createRequestId(req);
  try {
    return await handleRequest(req);
  } catch (error) {
    return monitoredErrorResponse(JOB, error, 500, requestId);
  }
});
