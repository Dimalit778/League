-- Idempotency support for the revenuecat-webhook edge function.
-- RevenueCat delivers events at least once and may re-deliver; storing the
-- stable event id lets the webhook skip duplicate deliveries so a stale event
-- can't regress a user's subscription state.
alter table public.revenuecat_events add column if not exists event_id text;

create unique index if not exists revenuecat_events_event_id_key
  on public.revenuecat_events (event_id) where event_id is not null;
