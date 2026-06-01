import { createClient } from 'jsr:@supabase/supabase-js@2';
import { applyDowngradeRules, applyUpgradeRules } from '../_shared/leagueLock.ts';
import { isAuthorizedWebhookRequest, mapRevenueCatEventToAction, type RevenueCatWebhookEvent } from './handler.ts';

type RevenueCatWebhookBody = {
  event?: RevenueCatWebhookEvent;
};

const ACTIVE_EVENTS = new Set<string>(['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION']);

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const webhookSecret = Deno.env.get('RC_WEBHOOK_SECRET');
  if (!isAuthorizedWebhookRequest(req.headers.get('Authorization'), webhookSecret)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body: RevenueCatWebhookBody;
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const event = body.event;
  if (!event?.type || !event.app_user_id) {
    return new Response('Missing event payload', { status: 400 });
  }

  const action = mapRevenueCatEventToAction(event);
  if (action.action === 'noop') {
    return new Response(JSON.stringify({ ok: true, action: action.action }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return new Response('Server misconfigured', { status: 500 });

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  if (action.action === 'upsert') {
    const { error } = await supabase.from('subscription').upsert(action.payload, {
      onConflict: 'user_id',
    });
    if (error) {
      console.error('RevenueCat webhook upsert failed', error);
      return new Response(error.message, { status: 500 });
    }
    // Unlock leagues when subscription activates
    if (ACTIVE_EVENTS.has(event.type)) {
      try {
        await applyUpgradeRules(supabase, event.app_user_id);
      } catch (upgradeErr) {
        console.error('applyUpgradeRules failed (non-fatal):', upgradeErr);
        // Don't fail the webhook — subscription was already saved
      }
    }
  }

  if (action.action === 'expire') {
    const { error } = await supabase
      .from('subscription')
      .update({ end_date: action.endDate, type: 'FREE' })
      .eq('user_id', action.userId);
    if (error) {
      console.error('RevenueCat webhook expire failed', error);
      return new Response(error.message, { status: 500 });
    }
    // Lock excess leagues when subscription expires/cancels
    try {
      await applyDowngradeRules(supabase, action.userId);
    } catch (downgradeErr) {
      console.error('applyDowngradeRules failed (non-fatal):', downgradeErr);
      // Don't fail the webhook — subscription status was already saved
    }
  }

  return new Response(JSON.stringify({ ok: true, action: action.action }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
