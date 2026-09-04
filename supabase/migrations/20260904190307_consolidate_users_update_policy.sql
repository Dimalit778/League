-- Keep a single UPDATE policy for both administrators and users updating
-- their own row. Wrapping auth.uid() in a scalar subquery lets Postgres
-- evaluate it once per statement instead of once per row.
drop policy if exists "Users update own notification token" on public.users;
drop policy if exists "Users: Update users" on public.users;

create policy "Users: Update users"
  on public.users
  for update
  to authenticated
  using (
    public.is_admin()
    or id = (select auth.uid())
  )
  with check (
    public.is_admin()
    or id = (select auth.uid())
  );
