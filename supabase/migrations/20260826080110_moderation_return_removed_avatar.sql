-- Return the storage path of any avatar removed by a moderation decision, so
-- the admin client can delete the actual file from the profile_images bucket.
-- Previously remove_content/remove_member only detached avatar_url in the
-- database, leaving the offending image publicly readable in storage.

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
  v_removed_avatar_path text;
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

    -- Capture the member's avatar (if any) before the row is removed so the
    -- stored file can be deleted from the bucket afterwards.
    select lm.avatar_url
    into v_removed_avatar_path
    from public.league_members lm
    where lm.id = v_report.league_member_id;

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

      -- content_snapshot recorded the avatar_url storage path at report time.
      v_removed_avatar_path := v_report.content_snapshot;
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

  -- Only surface real storage paths (not external provider avatar URLs).
  if v_removed_avatar_path is not null and position('://' in v_removed_avatar_path) > 0 then
    v_removed_avatar_path := null;
  end if;

  return jsonb_build_object(
    'success', true,
    'report_id', v_report.id,
    'status', v_status,
    'action', v_action,
    'removed_avatar_path', v_removed_avatar_path
  );
end;
$$;

revoke all on function public.moderate_content_report(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.moderate_content_report(uuid, text, text)
  to authenticated, service_role;
