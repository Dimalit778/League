-- User-generated content safety: reporting, blocking, owner removal and a
-- minimal admin moderation workflow. All mutations are routed through
-- SECURITY DEFINER RPCs so identity and league access are derived server-side.

create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_user_id uuid not null references public.users(id) on delete cascade,
  blocked_user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint user_blocks_not_self check (blocker_user_id <> blocked_user_id),
  constraint user_blocks_unique_pair unique (blocker_user_id, blocked_user_id)
);

create index if not exists user_blocks_blocked_user_idx
  on public.user_blocks (blocked_user_id);

alter table public.user_blocks enable row level security;
revoke all on table public.user_blocks from anon, authenticated;
grant select on table public.user_blocks to authenticated;

create policy "Users read their blocks"
  on public.user_blocks
  for select
  to authenticated
  using (blocker_user_id = auth.uid() or public.is_admin());

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid references public.users(id) on delete set null,
  target_user_id uuid references public.users(id) on delete set null,
  league_id uuid references public.leagues(id) on delete set null,
  league_member_id uuid references public.league_members(id) on delete set null,
  content_type text not null,
  reason text not null,
  details text,
  content_snapshot text not null,
  status text not null default 'pending',
  resolution_action text,
  resolution_notes text,
  moderator_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint content_reports_content_type_check
    check (content_type in ('nickname', 'avatar', 'league_name')),
  constraint content_reports_reason_check
    check (reason in ('harassment', 'hate', 'sexual', 'violence', 'spam', 'impersonation', 'privacy', 'other')),
  constraint content_reports_status_check
    check (status in ('pending', 'resolved', 'dismissed')),
  constraint content_reports_resolution_action_check
    check (resolution_action is null or resolution_action in ('content_removed', 'member_removed', 'no_action')),
  constraint content_reports_details_length check (details is null or char_length(details) <= 500),
  constraint content_reports_resolution_notes_length
    check (resolution_notes is null or char_length(resolution_notes) <= 500)
);

create index if not exists content_reports_queue_idx
  on public.content_reports (status, created_at desc);
create index if not exists content_reports_target_user_idx
  on public.content_reports (target_user_id, created_at desc);
create index if not exists content_reports_league_idx
  on public.content_reports (league_id, created_at desc);

alter table public.content_reports enable row level security;
revoke all on table public.content_reports from anon, authenticated;
grant select on table public.content_reports to authenticated;

create policy "Reporters and admins read reports"
  on public.content_reports
  for select
  to authenticated
  using (reporter_user_id = auth.uid() or public.is_admin());

create or replace function public.has_blocked_user(p_target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and p_target_user_id is not null
    and exists (
      select 1
      from public.user_blocks ub
      where ub.blocker_user_id = auth.uid()
        and ub.blocked_user_id = p_target_user_id
    );
$$;

revoke all on function public.has_blocked_user(uuid) from public, anon;
grant execute on function public.has_blocked_user(uuid) to authenticated, service_role;

create or replace function public.block_user(p_target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_block_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  if p_target_user_id is null or p_target_user_id = v_user_id then
    raise exception 'Invalid user to block';
  end if;

  if not exists (select 1 from public.users u where u.id = p_target_user_id) then
    raise exception 'User not found';
  end if;

  if not exists (
    select 1
    from public.league_members mine
    join public.league_members target
      on target.league_id = mine.league_id
    where mine.user_id = v_user_id
      and mine.active = true
      and target.user_id = p_target_user_id
  ) then
    raise exception 'You can only block a user who shares an active league';
  end if;

  insert into public.user_blocks (blocker_user_id, blocked_user_id)
  values (v_user_id, p_target_user_id)
  on conflict (blocker_user_id, blocked_user_id) do update
    set blocker_user_id = excluded.blocker_user_id
  returning id into v_block_id;

  return jsonb_build_object('success', true, 'block_id', v_block_id);
end;
$$;

revoke all on function public.block_user(uuid) from public, anon;
grant execute on function public.block_user(uuid) to authenticated, service_role;

create or replace function public.unblock_user(p_target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted_count integer;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  delete from public.user_blocks
  where blocker_user_id = v_user_id
    and blocked_user_id = p_target_user_id;

  get diagnostics v_deleted_count = row_count;
  return jsonb_build_object('success', true, 'removed', v_deleted_count > 0);
end;
$$;

revoke all on function public.unblock_user(uuid) from public, anon;
grant execute on function public.unblock_user(uuid) to authenticated, service_role;

create or replace function public.submit_content_report(
  p_content_type text,
  p_reason text,
  p_league_member_id uuid default null,
  p_league_id uuid default null,
  p_details text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_target_user_id uuid;
  v_league_id uuid;
  v_member_id uuid;
  v_snapshot text;
  v_details text := nullif(btrim(coalesce(p_details, '')), '');
  v_report_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  if p_content_type not in ('nickname', 'avatar', 'league_name') then
    raise exception 'Invalid content type';
  end if;

  if p_reason not in ('harassment', 'hate', 'sexual', 'violence', 'spam', 'impersonation', 'privacy', 'other') then
    raise exception 'Invalid report reason';
  end if;

  if v_details is not null and char_length(v_details) > 500 then
    raise exception 'Report details are too long';
  end if;

  if (
    select count(*)
    from public.content_reports cr
    where cr.reporter_user_id = v_user_id
      and cr.created_at > now() - interval '24 hours'
  ) >= 20 then
    raise exception 'Daily report limit reached';
  end if;

  if p_content_type in ('nickname', 'avatar') then
    select
      lm.user_id,
      lm.league_id,
      lm.id,
      case when p_content_type = 'nickname' then lm.nickname else lm.avatar_url end
    into v_target_user_id, v_league_id, v_member_id, v_snapshot
    from public.league_members lm
    where lm.id = p_league_member_id
      and lm.user_id is not null
      and exists (
        select 1
        from public.league_members reporter_membership
        where reporter_membership.league_id = lm.league_id
          and reporter_membership.user_id = v_user_id
          and reporter_membership.active = true
      );

    if v_member_id is null then
      raise exception 'Reportable member content not found';
    end if;

    if p_content_type = 'avatar' and v_snapshot is null then
      raise exception 'This member has no avatar to report';
    end if;
  else
    select l.owner_id, l.id, l.name
    into v_target_user_id, v_league_id, v_snapshot
    from public.leagues l
    where l.id = p_league_id
      and exists (
        select 1
        from public.league_members reporter_membership
        where reporter_membership.league_id = l.id
          and reporter_membership.user_id = v_user_id
          and reporter_membership.active = true
      );

    if v_league_id is null then
      raise exception 'Reportable league content not found';
    end if;
  end if;

  if v_target_user_id = v_user_id then
    raise exception 'You cannot report your own content';
  end if;

  if exists (
    select 1
    from public.content_reports cr
    where cr.reporter_user_id = v_user_id
      and cr.content_type = p_content_type
      and cr.status = 'pending'
      and cr.league_member_id is not distinct from v_member_id
      and cr.league_id is not distinct from v_league_id
  ) then
    raise exception 'You already reported this content';
  end if;

  insert into public.content_reports (
    reporter_user_id,
    target_user_id,
    league_id,
    league_member_id,
    content_type,
    reason,
    details,
    content_snapshot
  ) values (
    v_user_id,
    v_target_user_id,
    v_league_id,
    v_member_id,
    p_content_type,
    p_reason,
    v_details,
    coalesce(v_snapshot, '[unavailable]')
  )
  returning id into v_report_id;

  return jsonb_build_object('success', true, 'report_id', v_report_id);
end;
$$;

revoke all on function public.submit_content_report(text, text, uuid, uuid, text)
  from public, anon;
grant execute on function public.submit_content_report(text, text, uuid, uuid, text)
  to authenticated, service_role;

create or replace function public.remove_league_member(p_member_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_member public.league_members;
  v_owner_id uuid;
  v_next_primary_member_id uuid;
begin
  if v_user_id is null then
    raise exception 'User not authenticated';
  end if;

  select lm.*
  into v_member
  from public.league_members lm
  where lm.id = p_member_id
  for update;

  if v_member.id is null then
    raise exception 'Member not found';
  end if;

  select l.owner_id
  into v_owner_id
  from public.leagues l
  where l.id = v_member.league_id
  for update;

  if not public.is_admin() and v_owner_id <> v_user_id then
    raise exception 'Only the league owner can remove a member';
  end if;

  if v_member.user_id = v_owner_id then
    raise exception 'The league owner cannot be removed';
  end if;

  if v_member.user_id is not null then
    perform pg_advisory_xact_lock(hashtextextended(v_member.user_id::text, 0));
  end if;

  delete from public.league_members where id = v_member.id;

  if v_member.is_primary and v_member.user_id is not null then
    select lm.id
    into v_next_primary_member_id
    from public.league_members lm
    where lm.user_id = v_member.user_id
      and lm.active = true
    order by lm.created_at asc, lm.id asc
    limit 1;

    update public.league_members
    set is_primary = false
    where user_id = v_member.user_id
      and is_primary = true;

    if v_next_primary_member_id is not null then
      update public.league_members
      set is_primary = true
      where id = v_next_primary_member_id;
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'league_id', v_member.league_id,
    'removed_member_id', v_member.id,
    'removed_user_id', v_member.user_id
  );
end;
$$;

revoke all on function public.remove_league_member(uuid) from public, anon;
grant execute on function public.remove_league_member(uuid) to authenticated, service_role;

-- Direct deletes bypass primary reassignment and owner validation. Leaving and
-- owner removal already use SECURITY DEFINER RPCs.
revoke delete on table public.league_members from anon, authenticated;

create or replace function public.moderate_content_report(
  p_report_id uuid,
  p_decision text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_user_id uuid := auth.uid();
  v_report public.content_reports;
  v_notes text := nullif(btrim(coalesce(p_notes, '')), '');
  v_action text;
  v_status text;
begin
  if v_admin_user_id is null or not public.is_admin() then
    raise exception 'Admin access required';
  end if;

  if p_decision not in ('dismiss', 'remove_content', 'remove_member') then
    raise exception 'Invalid moderation decision';
  end if;

  if v_notes is not null and char_length(v_notes) > 500 then
    raise exception 'Moderation notes are too long';
  end if;

  select cr.*
  into v_report
  from public.content_reports cr
  where cr.id = p_report_id
  for update;

  if v_report.id is null then
    raise exception 'Report not found';
  end if;

  if v_report.status <> 'pending' then
    raise exception 'Report has already been reviewed';
  end if;

  if p_decision = 'dismiss' then
    v_status := 'dismissed';
    v_action := 'no_action';
  elsif p_decision = 'remove_member' then
    if v_report.league_member_id is null then
      raise exception 'This report is not linked to a league member';
    end if;

    perform public.remove_league_member(v_report.league_member_id);
    v_status := 'resolved';
    v_action := 'member_removed';
  else
    if v_report.content_type = 'nickname' then
      update public.league_members
      set nickname = 'Player-' || left(replace(id::text, '-', ''), 6)
      where id = v_report.league_member_id;
    elsif v_report.content_type = 'avatar' then
      update public.league_members
      set avatar_url = null
      where id = v_report.league_member_id;
    elsif v_report.content_type = 'league_name' then
      update public.leagues
      set name = 'League-' || left(replace(id::text, '-', ''), 6)
      where id = v_report.league_id;
    end if;

    v_status := 'resolved';
    v_action := 'content_removed';
  end if;

  update public.content_reports
  set status = v_status,
      resolution_action = v_action,
      resolution_notes = v_notes,
      moderator_user_id = v_admin_user_id,
      reviewed_at = now()
  where id = v_report.id;

  return jsonb_build_object(
    'success', true,
    'report_id', v_report.id,
    'status', v_status,
    'action', v_action
  );
end;
$$;

revoke all on function public.moderate_content_report(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.moderate_content_report(uuid, text, text)
  to authenticated, service_role;

-- Hide blocked users' membership UGC from the blocker while keeping deleted,
-- anonymized history visible as "Deleted Player".
drop policy if exists " Read - Admin , all league_memberss" on public.league_members;
create policy "Members read visible league members"
  on public.league_members
  for select
  to authenticated
  using (
    public.is_admin()
    or (
      (public.is_league_member(league_id) or user_id = auth.uid())
      and (
        user_id is null
        or user_id = auth.uid()
        or not public.has_blocked_user(user_id)
      )
    )
  );

drop policy if exists "Users: Read predictions" on public.predictions;
create policy "Users read visible league predictions"
  on public.predictions
  for select
  to authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.league_members lm_self
      join public.league_members lm_pred
        on lm_self.league_id = lm_pred.league_id
      where lm_self.user_id = auth.uid()
        and lm_pred.id = predictions.league_member_id
        and (
          lm_pred.user_id is null
          or lm_pred.user_id = auth.uid()
          or not public.has_blocked_user(lm_pred.user_id)
        )
    )
  );

create or replace view public.league_leaderboard_view as
select
  lm.id as member_id,
  lm.league_id,
  lm.user_id,
  lm.nickname,
  lm.avatar_url,
  coalesce(sum(p.points), 0::bigint)::integer as total_points
from public.league_members lm
left join public.predictions p on p.league_member_id = lm.id
where public.is_admin()
  or (
    public.is_league_member(lm.league_id)
    and (
      lm.user_id is null
      or lm.user_id = auth.uid()
      or not public.has_blocked_user(lm.user_id)
    )
  )
group by lm.id, lm.league_id, lm.user_id, lm.nickname, lm.avatar_url
order by coalesce(sum(p.points), 0::bigint)::integer desc;

grant select on public.league_leaderboard_view to authenticated, service_role;
