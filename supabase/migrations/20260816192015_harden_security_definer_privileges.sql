-- SECURITY DEFINER functions are privileged entry points.  Supabase's default
-- grants made older functions executable by PUBLIC/anon/authenticated, so
-- reset the ACLs and explicitly expose only the RPCs used by the application.

-- Auth-trigger only.  Every referenced relation is schema-qualified and the
-- pg_catalog-first path prevents name shadowing inside this privileged body.
alter function public.handle_new_user()
  set search_path = pg_catalog, public;

-- New application functions created by migrations must opt in to API
-- execution.  supabase_admin is platform-managed and its defaults cannot be
-- changed by the migration login.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;

-- Remove inherited and direct API grants from every existing privileged
-- function before rebuilding the allow-list below.
do $do$
declare
  function_record record;
begin
  for function_record in
    select p.oid::regprocedure as function_signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prosecdef
  loop
    execute format(
      'revoke execute on function %s from public, anon, authenticated, service_role',
      function_record.function_signature
    );
  end loop;
end
$do$;

-- Signed-in application RPCs.  Each function derives the caller from
-- auth.uid() and/or performs its own ownership, membership, plan, or admin
-- check before accessing data with definer privileges.
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.create_new_league(text, integer, integer, text, text) to authenticated;
grant execute on function public.delete_owned_league(uuid) to authenticated;
grant execute on function public.find_league_by_code(text) to authenticated;
grant execute on function public.get_blocked_users() to authenticated;
grant execute on function public.get_competition_leaderboard(integer) to authenticated;
grant execute on function public.get_match_ai_summary(integer) to authenticated;
grant execute on function public.has_blocked_user(uuid) to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_league_member(uuid) to authenticated;
grant execute on function public.is_league_owner(uuid) to authenticated;
grant execute on function public.join_league(text, text, text) to authenticated;
grant execute on function public.leave_league(uuid) to authenticated;
grant execute on function public.moderate_content_report(uuid, text, text) to authenticated;
grant execute on function public.remove_league_member(uuid) to authenticated;
grant execute on function public.set_primary_league(uuid) to authenticated;
grant execute on function public.submit_content_report(text, text, uuid, uuid, text) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
grant execute on function public.update_my_league_activation(uuid[]) to authenticated;
grant execute on function public.upsert_own_prediction(uuid, integer, integer, integer) to authenticated;

-- Server-only account deletion RPC used by the delete-account Edge Function.
grant execute on function public.anonymize_user_account(uuid, text) to service_role;

-- Deliberately no API-role grants for trigger/internal-only functions:
--   handle_new_user, sync_user_full_name, user_exists, is_member_in_league,
--   assert_allowed_public_ugc, filter_league_public_ugc,
--   enforce_*_plan_access, fill_available_league_slots_if_unambiguous, and
--   tg_calc_prediction_points_on_match_finish.
