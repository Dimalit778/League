-- Reassert the restricted "Users: Read leagues" policy.
--
-- 20260706120100_restrict_league_read scoped league reads to admins, owners and
-- members, but the remote database drifted back to `using (true)` (an
-- out-of-band migration applied on 2026-08-17 reverted it). Under `using (true)`
-- any authenticated user can read every league row, including join_code, and
-- then join "private" leagues. Re-apply the intended restriction so the remote
-- matches the committed policy. Join-by-code still works through the
-- SECURITY DEFINER RPC find_league_by_code.

drop policy if exists "Users: Read leagues" on "public"."leagues";

create policy "Users: Read leagues"
  on "public"."leagues"
  as permissive
  for select
  to authenticated
using (
  public.is_admin()
  OR (owner_id = ( SELECT auth.uid() AS uid))
  OR public.is_league_member(id)
);
