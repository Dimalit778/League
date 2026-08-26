-- join_code is normalized to uppercase before writes and already has the
-- unique leagues_join_code_key btree index. Queries compare the raw column to
-- upper(input), so the expression index on upper(join_code) is redundant.
drop index if exists public.idx_leagues_join_code;

-- These columns are retained for operational/audit data, but the application
-- does not filter by either column. Re-add a purpose-built index if a retry or
-- transaction lookup workflow is introduced later.
drop index if exists public.revenuecat_events_processed_idx;
drop index if exists public.user_subscriptions_transaction_id_idx;
