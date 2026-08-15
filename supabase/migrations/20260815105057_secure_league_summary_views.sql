-- Both views are exposed through the Data API. By default PostgreSQL views
-- execute with their owner's privileges, which bypasses the RLS policies on
-- league_members and predictions. Run them as the caller so those policies
-- remain the source of truth for row visibility.
alter view public.league_leaderboard_view
  set (security_invoker = true);

alter view public.member_league_summary_view
  set (security_invoker = true);

-- Old dashboard-generated grants gave client roles every table privilege on
-- these views. They are read models: anonymous clients need no access, while
-- signed-in clients and backend jobs only need SELECT.
revoke all privileges on public.league_leaderboard_view
  from public, anon, authenticated;
revoke all privileges on public.member_league_summary_view
  from public, anon, authenticated;

grant select on public.league_leaderboard_view
  to authenticated, service_role;
grant select on public.member_league_summary_view
  to authenticated, service_role;
