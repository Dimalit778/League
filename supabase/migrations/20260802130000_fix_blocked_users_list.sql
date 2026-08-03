-- Return the current user's block list with the small amount of profile data
-- required by the settings screen. A SECURITY DEFINER RPC is used because the
-- users table intentionally only exposes a user's own row to regular clients.

create or replace function public.get_blocked_users()
returns table (
  id uuid,
  blocked_user_id uuid,
  created_at timestamptz,
  display_name text,
  avatar_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    ub.id,
    ub.blocked_user_id,
    ub.created_at,
    coalesce(nullif(shared_member.nickname, ''), nullif(u.full_name, ''), 'Deleted user') as display_name,
    shared_member.avatar_url
  from public.user_blocks ub
  left join public.users u
    on u.id = ub.blocked_user_id
  left join lateral (
    select target.nickname, target.avatar_url
    from public.league_members target
    where target.user_id = ub.blocked_user_id
      and exists (
        select 1
        from public.league_members mine
        where mine.user_id = auth.uid()
          and mine.league_id = target.league_id
      )
    order by target.active desc, target.updated_at desc
    limit 1
  ) shared_member on true
  where auth.uid() is not null
    and ub.blocker_user_id = auth.uid()
  order by ub.created_at desc;
$$;

revoke all on function public.get_blocked_users() from public, anon;
grant execute on function public.get_blocked_users() to authenticated, service_role;
