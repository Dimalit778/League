-- When a user deletes their account, a league in which they were the only real
-- participant used to survive as an inaccessible ownerless "ghost" league:
-- ownership was nulled and the membership was anonymized to "Deleted Player",
-- but the leagues row (and its predictions/standings) stayed forever.
--
-- This aligns account deletion with leave_league, which already deletes a league
-- when its last real member leaves. Anonymized rows (user_id is null) do not
-- count as remaining participants, so a league whose only members are the
-- departing user plus previously-deleted "Deleted Player" ghosts is removed too.
--
-- Deleting the leagues row cascades to league_members -> predictions and
-- league_member_standings (all ON DELETE CASCADE); content_reports references
-- are set null, preserving moderation history.

create or replace function public.anonymize_user_account(
  p_user_id uuid,
  p_revenuecat_app_user_id text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_anonymized_members integer := 0;
  v_transferred_leagues integer := 0;
  v_archived_leagues integer := 0;
  v_deleted_events integer := 0;
  v_deleted_solo_leagues integer := 0;
begin
  if p_user_id is null then
    raise exception 'User id is required' using errcode = '22004';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));

  -- Delete leagues in which the departing user is the only real participant.
  -- Runs before ownership transfer and membership anonymization so those steps
  -- only ever touch leagues that still have other real members afterwards.
  with solo_leagues as (
    select members.league_id
    from public.league_members members
    where members.user_id = p_user_id
      and not exists (
        select 1
        from public.league_members others
        where others.league_id = members.league_id
          and others.user_id is not null
          and others.user_id <> p_user_id
      )
  )
  delete from public.leagues
  where id in (select league_id from solo_leagues);

  get diagnostics v_deleted_solo_leagues = row_count;

  select
    count(*) filter (where candidate.next_owner_id is not null),
    count(*) filter (where candidate.next_owner_id is null)
  into v_transferred_leagues, v_archived_leagues
  from (
    select (
      select members.user_id
      from public.league_members members
      where members.league_id = leagues.id
        and members.user_id is not null
        and members.user_id <> p_user_id
        and members.active = true
      order by members.created_at asc, members.id asc
      limit 1
    ) as next_owner_id
    from public.leagues leagues
    where leagues.owner_id = p_user_id
  ) candidate;

  update public.leagues leagues
  set owner_id = (
        select members.user_id
        from public.league_members members
        where members.league_id = leagues.id
          and members.user_id is not null
          and members.user_id <> p_user_id
          and members.active = true
        order by members.created_at asc, members.id asc
        limit 1
      ),
      updated_at = now()
  where leagues.owner_id = p_user_id;

  update public.league_members
  set user_id = null,
      nickname = 'Deleted Player',
      avatar_url = null,
      active = false,
      is_primary = false,
      anonymized_at = coalesce(anonymized_at, now()),
      updated_at = now()
  where user_id = p_user_id;

  get diagnostics v_anonymized_members = row_count;

  delete from public.admin_users where user_id = p_user_id;
  delete from public.subscription_sync_attempts where user_id = p_user_id;
  delete from public.user_subscriptions where user_id = p_user_id;

  delete from public.revenuecat_events events
  where events.app_user_id = p_user_id::text
     or (p_revenuecat_app_user_id is not null and events.app_user_id = p_revenuecat_app_user_id)
     or events.payload #>> '{event,app_user_id}' = p_user_id::text
     or events.payload #>> '{event,original_app_user_id}' = p_user_id::text
     or (
       p_revenuecat_app_user_id is not null
       and (
         events.payload #>> '{event,app_user_id}' = p_revenuecat_app_user_id
         or events.payload #>> '{event,original_app_user_id}' = p_revenuecat_app_user_id
       )
     )
     or exists (
       select 1
       from jsonb_array_elements_text(
         case
           when jsonb_typeof(events.payload #> '{event,aliases}') = 'array'
             then events.payload #> '{event,aliases}'
           else '[]'::jsonb
         end
       ) aliases(value)
       where aliases.value = p_user_id::text
          or (
            p_revenuecat_app_user_id is not null
            and aliases.value = p_revenuecat_app_user_id
          )
     );

  get diagnostics v_deleted_events = row_count;

  delete from public.users where id = p_user_id;

  return jsonb_build_object(
    'anonymized_members', v_anonymized_members,
    'transferred_leagues', v_transferred_leagues,
    'ownerless_historical_leagues', v_archived_leagues,
    'deleted_revenuecat_events', v_deleted_events,
    'deleted_solo_leagues', v_deleted_solo_leagues
  );
end;
$$;

revoke all on function public.anonymize_user_account(uuid, text)
  from public, anon, authenticated;
grant execute on function public.anonymize_user_account(uuid, text)
  to service_role;
