# Delete solo leagues on account deletion — design

## Problem

When a user deletes their account, `public.anonymize_user_account` transfers league
ownership to the oldest other active member, or — if there is none — sets `owner_id`
to `NULL` and anonymizes the membership to "Deleted Player". For a league where the
departing user was the **only participant**, this leaves an inaccessible ownerless
"ghost" league behind, along with its predictions and standings. Nothing ever cleans
it up.

The `leave_league` RPC already handles the equivalent case correctly: when the last
real member leaves, it `DELETE`s the league. Account deletion should match.

## Decisions

- **Ghosts do not count.** A league whose only remaining members are the departing
  user plus previously-anonymized "Deleted Player" rows (`user_id IS NULL`) is treated
  as having no other participants and is deleted. This matches how `leave_league`
  counts members (`user_id IS NOT NULL`).
- **Fix behavior only, no backfill.** Existing ownerless ghost leagues in production
  are left untouched by this change.
- **No UI change.** Deletion is silent, at the database level. The confirmation copy
  is unchanged.

## Change

A single migration redefines `public.anonymize_user_account`, adding one step at the
top of the body (after the advisory lock, before ownership transfer and membership
anonymization):

```sql
with solo_leagues as (
  select members.league_id
  from public.league_members members
  where members.user_id = p_user_id
    and not exists (
      select 1 from public.league_members others
      where others.league_id = members.league_id
        and others.user_id is not null
        and others.user_id <> p_user_id
    )
)
delete from public.leagues where id in (select league_id from solo_leagues);
get diagnostics v_deleted_solo_leagues = row_count;
```

The existing steps run unchanged afterward, now only touching multi-member leagues.
The returned JSON gains a `deleted_solo_leagues` count. The `delete-account` Edge
Function surfaces the RPC result as-is, so the new field flows through with no code
change there. `leave_league` is unchanged (already correct).

### Ordering rationale

Deleting solo leagues first guarantees the later `update leagues set owner_id = …`
(ownership transfer) and `update league_members set user_id = null …` (anonymization)
only run on leagues that retain other real members, so no ownerless league is ever
produced.

### Cascade (verified from FKs)

Deleting a `leagues` row removes:

- `league_members` (`ON DELETE CASCADE`) — the departing user's row and any ghost rows
- → `predictions` (`ON DELETE CASCADE` via `league_member_id`)
- → `league_member_standings` (`ON DELETE CASCADE`)
- `content_reports.league_id` / `.league_member_id` → `SET NULL` (moderation history preserved)

## Behavior matrix

| Situation | Result |
|---|---|
| User is sole real member (solo league) | League + predictions + standings deleted |
| User + only "Deleted Player" ghosts | Deleted |
| Multi-member league, user is owner | Ownership transfers; user's membership anonymized (unchanged) |
| Multi-member league, user is member | Membership anonymized (unchanged) |

## Verification

No pgTAP harness exists. `docs/qa/2026-08-29-solo-league-deletion.sql` runs three
self-asserting scenarios against a local Supabase stack (rolled back at the end):

1. Account deletion removes a solo league and its cascade.
2. Account deletion preserves a shared league, transfers ownership, anonymizes the
   departing member.
3. `leave_league` still deletes a league when its last member leaves.
