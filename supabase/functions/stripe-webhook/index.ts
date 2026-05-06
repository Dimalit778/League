import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string,
);

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;

  if (!signature) {
    return new Response('Missing Stripe-Signature header', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    return new Response(message, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.supabase_user_id;

        if (!userId) {
          console.error('No supabase_user_id in customer metadata', customerId);
          break;
        }

        const priceId = subscription.items.data[0]?.price?.id ?? '';
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        await supabaseAdmin.from('subscription').upsert(
          {
            user_id: userId,
            subscription_type: 'BASIC',
            stripe_subscription_id: subscriptionId,
            stripe_status: subscription.status,
            stripe_price_id: priceId,
            start_date: new Date().toISOString(),
            end_date: periodEnd,
            access_advanced_stats: true,
            can_add_members: true,
          },
          { onConflict: 'stripe_subscription_id' }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        await supabaseAdmin
          .from('subscription')
          .update({
            stripe_status: subscription.status,
            end_date: periodEnd,
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabaseAdmin
          .from('subscription')
          .update({
            stripe_status: 'canceled',
            end_date: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error processing webhook';
    console.error('Webhook handler error:', message);
    return new Response(message, { status: 500 });
  }
});
