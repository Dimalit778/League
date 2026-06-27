import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const REVENUECAT_WEBHOOK_SECRET = Deno.env.get('REVENUECAT_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const HANDLED_EVENTS = new Set([
  'INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION',
  'CANCELLATION', 'EXPIRATION', 'BILLING_ISSUE',
]);

const PRO_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

type SubscriptionStatus = 'active' | 'inactive' | 'expired' | 'cancelled' | 'billing_issue';

function getStatusFromEvent(eventType: string): SubscriptionStatus {
  switch (eventType) {
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

/**
 * Resolve the Supabase user_id from a RevenueCat app_user_id.
 *
 * The app calls Purchases.logIn(supabaseUserId) so normally app_user_id IS
 * the Supabase UUID. But edge cases exist (anonymous purchase, old RC account,
 * test purchases) where they differ. Strategy:
 *   1. Check users table directly — if app_user_id is a valid Supabase UUID, use it.
 *   2. Fall back to user_subscriptions.revenuecat_app_user_id — handles cases
 *      where we stored the RC id from a previous event on the correct row.
 */
async function resolveUserId(
  supabase: ReturnType<typeof createClient>,
  appUserId: string,
): Promise<string | null> {
  // 1. Direct match: app_user_id is the Supabase user UUID
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('id', appUserId)
    .maybeSingle();

  if (userRow) return userRow.id;

  // 2. Fallback: look up by stored revenuecat_app_user_id
  const { data: subRow } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('revenuecat_app_user_id', appUserId)
    .maybeSingle();

  return subRow?.user_id ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || authHeader !== REVENUECAT_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body.event as Record<string, unknown> | undefined;
  if (!event) {
    return new Response('Missing event', { status: 400 });
  }

  const eventType = event.type as string;
  const appUserId = event.app_user_id as string;
  const entitlementId = (event.entitlement_id ?? event.entitlement_ids?.[0]) as string | undefined;
  const productId = event.product_id as string | undefined;
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms as number).toISOString()
    : null;

  if (!appUserId) {
    return new Response('Missing app_user_id', { status: 400 });
  }

  if (!HANDLED_EVENTS.has(eventType)) {
    return new Response('Event ignored', { status: 200 });
  }

  const newPlan = PRO_EVENTS.has(eventType) ? 'pro' : 'free';
  const newStatus = getStatusFromEvent(eventType);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Resolve the actual Supabase user_id
  const userId = await resolveUserId(supabase, appUserId);

  if (!userId) {
    // No matching Supabase user — return 200 so RevenueCat doesn't keep retrying
    console.warn(`No Supabase user found for RC app_user_id: ${appUserId} (event: ${eventType}). Skipping.`);
    return new Response('User not found, skipped', { status: 200 });
  }

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: newPlan,
      status: newStatus,
      entitlement_id: entitlementId ?? null,
      product_id: productId ?? null,
      revenuecat_app_user_id: appUserId,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    console.error(`Failed to update user_subscriptions for user ${userId}:`, error);
    return new Response('Database error', { status: 500 });
  }

  console.log(`Updated user ${userId} (RC: ${appUserId}) → plan: ${newPlan}, status: ${newStatus} (event: ${eventType})`);
  return new Response('OK', { status: 200 });
});
