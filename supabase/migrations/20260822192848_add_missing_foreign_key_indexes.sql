-- PostgreSQL does not automatically index referencing foreign-key columns.
-- These indexes support joins and avoid full-table scans when referenced rows
-- are updated or deleted.
create index if not exists content_reports_league_member_id_idx
  on public.content_reports (league_member_id);

create index if not exists content_reports_moderator_user_id_idx
  on public.content_reports (moderator_user_id);

create index if not exists content_reports_reporter_user_id_idx
  on public.content_reports (reporter_user_id);

create index if not exists user_subscriptions_plan_idx
  on public.user_subscriptions (plan);
