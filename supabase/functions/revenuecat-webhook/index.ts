import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const HANDLED_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'CANCELLATION',
  'EXPIRATION',
  'BILLING_ISSUE',
  'TRANSFER'
]);
function getStatusFromEvent(eventType) {
  switch(eventType){
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
      return 'active';
    case 'CANCELLATION':
      return 'cancelled';
    case 'EXPIRATION':
      return 'expired';
    case 'BILLING_ISSUE':
      return 'billing_issue';
    default:
      return 'inactive';
  }
}
function getPlanFromEvent(event) {
  const eventType = event.type;
  switch(eventType){
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE':
    case 'UNCANCELLATION':
      return 'pro';
    case 'CANCELLATION':
      /**
       * Important:
       * Cancellation means the user turned off auto-renewal.
       * The user should usually keep PRO access until expiration_at_ms.
       */ return 'pro';
    case 'BILLING_ISSUE':
      {
        /**
       * If Apple / RevenueCat still gives a future expiration,
       * keep access during grace period.
       */ const expirationMs = event.expiration_at_ms;
        if (expirationMs && expirationMs > Date.now()) {
          return 'pro';
        }
        return 'free';
      }
    case 'EXPIRATION':
      /**
       * This is the event that should actually remove PRO access.
       */ return 'free';
    default:
      return 'free';
  }
}
/**
 * Resolve the Supabase user_id from a RevenueCat app_user_id.
 *
 * Normally Purchases.logIn(supabaseUserId) means app_user_id is the Supabase UUID.
 * But anonymous purchases / aliases / old RevenueCat users can make it different.
 */ async function resolveUserId(supabase, appUserId) {
  /**
   * 1. Direct match.
   * If app_user_id is the Supabase user UUID, this will work.
   */ const { data: userRow, error: userError } = await supabase.from('users').select('id').eq('id', appUserId).maybeSingle();
  if (userError) {
    console.warn('Failed checking users table:', userError);
  }
  if (userRow?.id) {
    return userRow.id;
  }
  /**
   * 2. Fallback by stored RevenueCat app user id.
   */ const { data: subRow, error: subError } = await supabase.from('user_subscriptions').select('user_id').eq('revenuecat_app_user_id', appUserId).maybeSingle();
  if (subError) {
    console.warn('Failed checking user_subscriptions table:', subError);
  }
  return subRow?.user_id ?? null;
}
/**
 * Store RevenueCat event for debugging / later retry.
 *
 * Requires this table:
 *
 * create table if not exists public.revenuecat_events (
 *   id uuid primary key default gen_random_uuid(),
 *   app_user_id text,
 *   event_type text,
 *   payload jsonb not null,
 *   processed boolean default false,
 *   created_at timestamptz default now()
 * );
 */ async function storeRevenueCatEvent(supabase, params) {
  const { error } = await supabase.from('revenuecat_events').insert({
    app_user_id: params.appUserId,
    event_type: params.eventType,
    payload: params.payload,
    processed: params.processed
  });
  if (error) {
    console.warn('Failed to store RevenueCat event:', error);
  }
}
async function findSubscriptionByRcIds(supabase, rcIds) {
  if (!rcIds?.length) return null;
  const { data: byRcId } = await supabase.from('user_subscriptions').select('*').in('revenuecat_app_user_id', rcIds).order('updated_at', {
    ascending: false
  }).limit(1).maybeSingle();
  if (byRcId) return byRcId;
  const resolvedUserIds = [];
  for (const rcId of rcIds){
    const userId = await resolveUserId(supabase, rcId);
    if (userId) resolvedUserIds.push(userId);
  }
  if (!resolvedUserIds.length) return null;
  const { data: byUserId } = await supabase.from('user_subscriptions').select('*').in('user_id', resolvedUserIds).order('updated_at', {
    ascending: false
  }).limit(1).maybeSingle();
  return byUserId ?? null;
}
async function handleTransferEvent(supabase, event, body) {
  const transferredFrom = event.transferred_from ?? [];
  const transferredTo = event.transferred_to ?? [];
  const sourceSubscription = await findSubscriptionByRcIds(supabase, transferredFrom);
  let processed = false;
  for (const targetRcId of transferredTo){
    const targetUserId = await resolveUserId(supabase, targetRcId);
    if (!targetUserId) {
      console.warn(`TRANSFER target not resolved: ${targetRcId}`);
      continue;
    }
    const payload = sourceSubscription ? {
      user_id: targetUserId,
      plan: sourceSubscription.plan,
      status: sourceSubscription.status,
      entitlement_id: sourceSubscription.entitlement_id,
      product_id: sourceSubscription.product_id,
      revenuecat_app_user_id: targetRcId,
      expires_at: sourceSubscription.expires_at,
      updated_at: new Date().toISOString()
    } : {
      user_id: targetUserId,
      plan: 'free',
      status: 'inactive',
      entitlement_id: null,
      product_id: null,
      revenuecat_app_user_id: targetRcId,
      expires_at: null,
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('user_subscriptions').upsert(payload, {
      onConflict: 'user_id'
    });
    if (error) {
      console.error(`TRANSFER upsert failed for ${targetUserId}:`, error);
      continue;
    }
    processed = true;
    console.log(`TRANSFER applied to user ${targetUserId} (RC: ${targetRcId})`);
  }
  await storeRevenueCatEvent(supabase, {
    appUserId: transferredTo[0] ?? null,
    eventType: 'TRANSFER',
    payload: body,
    processed
  });
  return processed;
}
Deno.serve(async (req)=>{
  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405
    });
  }
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== REVENUECAT_WEBHOOK_SECRET) {
    return new Response('Unauthorized', {
      status: 401
    });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  let body;
  try {
    body = await req.json();
  } catch  {
    return new Response('Invalid JSON', {
      status: 400
    });
  }
  const event = body.event;
  if (!event) {
    return new Response('Missing event', {
      status: 400
    });
  }
  const eventType = event.type;
  const appUserId = event.app_user_id;
  if (!eventType) {
    return new Response('Missing event type', {
      status: 400
    });
  }
  if (!HANDLED_EVENTS.has(eventType)) {
    console.log(`RevenueCat event ignored: ${eventType}`);
    await storeRevenueCatEvent(supabase, {
      appUserId: appUserId ?? null,
      eventType,
      payload: body,
      processed: true
    });
    return new Response('Event ignored', {
      status: 200
    });
  }
  if (eventType === 'TRANSFER') {
    const processed = await handleTransferEvent(supabase, event, body);
    return new Response(processed ? 'TRANSFER processed' : 'TRANSFER stored', {
      status: 200
    });
  }
  if (!appUserId) {
    await storeRevenueCatEvent(supabase, {
      appUserId: null,
      eventType,
      payload: body,
      processed: false
    });
    return new Response('Missing app_user_id', {
      status: 400
    });
  }
  const userId = await resolveUserId(supabase, appUserId);
  if (!userId) {
    /**
     * Do not silently lose the event.
     * We still return 200 so RevenueCat does not retry forever,
     * but we keep the payload in revenuecat_events.
     */ console.warn(`No Supabase user found for RC app_user_id: ${appUserId} event: ${eventType}. Event stored.`);
    await storeRevenueCatEvent(supabase, {
      appUserId,
      eventType,
      payload: body,
      processed: false
    });
    return new Response('User not found, event stored', {
      status: 200
    });
  }
  const entitlementIds = event.entitlement_ids;
  const entitlementId = event.entitlement_id ?? entitlementIds?.[0] ?? null;
  const productId = event.product_id ?? null;
  const expiresAt = event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null;
  const newPlan = getPlanFromEvent(event);
  const newStatus = getStatusFromEvent(eventType);
  const { error } = await supabase.from('user_subscriptions').upsert({
    user_id: userId,
    plan: newPlan,
    status: newStatus,
    entitlement_id: entitlementId,
    product_id: productId,
    revenuecat_app_user_id: appUserId,
    expires_at: expiresAt,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id'
  });
  if (error) {
    console.error(`Failed to update user_subscriptions for user ${userId}:`, error);
    await storeRevenueCatEvent(supabase, {
      appUserId,
      eventType,
      payload: body,
      processed: false
    });
    return new Response('Database error', {
      status: 500
    });
  }
  await storeRevenueCatEvent(supabase, {
    appUserId,
    eventType,
    payload: body,
    processed: true
  });
  console.log(`Updated user ${userId} RC ${appUserId} → plan: ${newPlan}, status: ${newStatus}, event: ${eventType}`);
  return new Response('OK', {
    status: 200
  });
});
