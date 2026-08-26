-- These read-only helpers do not need to bypass RLS:
--   * pro_seasons is readable by authenticated users through an explicit policy.
--   * user_blocks lets users read only rows where they are the blocker.
-- Keep the existing API surface and least-privilege EXECUTE grants while
-- reducing the number of privileged RPC entry points.

alter function public.get_current_season()
  security invoker;

revoke all on function public.get_current_season() from public, anon;
grant execute on function public.get_current_season() to authenticated, service_role;

alter function public.has_blocked_user(uuid)
  security invoker;

revoke all on function public.has_blocked_user(uuid) from public, anon, service_role;
grant execute on function public.has_blocked_user(uuid) to authenticated;
