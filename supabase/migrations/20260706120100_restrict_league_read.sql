-- "Users: Read leagues" was `using (true)`, letting any authenticated user
-- read every league row including join_code (and then join "private"
-- leagues). Scope reads to admins, owners, and members. Join-by-code lookups
-- go through the SECURITY DEFINER RPC find_league_by_code, and joining goes
-- through the join_league RPC, so those flows are unaffected.

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
