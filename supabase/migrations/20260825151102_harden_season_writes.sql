-- Follow-up hardening for projects that already applied the seasons contract.

create index if not exists idx_matches_season_id
  on public.matches (season_id);

grant insert, update on table public.seasons to authenticated;

drop policy if exists seasons_insert_admin on public.seasons;
create policy seasons_insert_admin
  on public.seasons
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists seasons_update_admin on public.seasons;
create policy seasons_update_admin
  on public.seasons
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

alter function public.admin_create_competition(
  integer, text, text, text, text, text, text, integer, text
) security invoker;
