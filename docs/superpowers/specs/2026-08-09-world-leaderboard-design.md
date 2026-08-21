# World Leaderboard (Friends / World toggle)

Add a "World" ranking to the Leaderboard tab, alongside the existing (renamed) "Friends" ranking. Friends shows the active league's table (unchanged). World shows one row per app user who plays the active league's competition, across all leagues for that competition, ranked by points.

## Goal

Let a member see how they rank against everyone playing the same competition (e.g. Premier League), not just their own league's members.

## Scope

In scope:
- New Supabase RPC `get_competition_leaderboard(p_competition_id integer)` — cross-league, per-user ranking for a competition
- `Friends` / `World` toggle in the Leaderboard screen's sticky header (replaces the current sole occupant of that row)
- Existing `Round` / `Season` toggle moves into the scrollable body, shown only for `Friends` (World is season-only for now)
- World reuses `Podium` and the ranking list, in a non-clickable presentation
- "Invite friends" card stays Friends-only

Out of scope:
- Round-scoped World ranking (needs a per-round data source that doesn't exist yet — same gap as the existing Friends round view)
- Pagination / result capping for World (full list, per product decision — expected low volume at this stage)
- Any change to how Friends computes or displays its leaderboard
- Blocking/moderation UI (reuses the existing `has_blocked_user` mechanism as-is)

## Data layer (Supabase)

New migration adds `public.get_competition_leaderboard(p_competition_id integer)`:

```sql
create or replace function public.get_competition_leaderboard(p_competition_id integer)
returns table (
  member_id uuid,
  league_id uuid,
  user_id uuid,
  nickname text,
  avatar_url text,
  total_points integer
)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (ranked.user_id)
    ranked.member_id,
    ranked.league_id,
    ranked.user_id,
    ranked.nickname,
    ranked.avatar_url,
    ranked.total_points
  from (
    select
      lm.id as member_id,
      lm.league_id,
      lm.user_id,
      lm.nickname,
      lm.avatar_url,
      coalesce(sum(p.points), 0::bigint)::integer as total_points
    from public.league_members lm
    join public.leagues l on l.id = lm.league_id
    left join public.predictions p on p.league_member_id = lm.id
    where l.competition_id = p_competition_id
      and lm.user_id is not null
      and not public.has_blocked_user(lm.user_id)
    group by lm.id, lm.league_id, lm.user_id, lm.nickname, lm.avatar_url
  ) ranked
  order by ranked.user_id, ranked.total_points desc;
$$;

grant execute on function public.get_competition_leaderboard(integer) to authenticated;
```

Notes:
- Mirrors `league_leaderboard_view`'s point calculation (`sum(predictions.points)` per `league_member`), but joins through `leagues` to filter by `competition_id` instead of `is_league_member` (that function intentionally restricts to the caller's own league; World needs to cross leagues on purpose).
- `lm.user_id is not null` excludes anonymized/deleted members (anonymization nulls `user_id`), same effect as how the app already treats deleted accounts.
- `not public.has_blocked_user(lm.user_id)` keeps existing block-list behavior: a user you've blocked won't show up for you.
- `distinct on (ranked.user_id) ... order by ranked.user_id, ranked.total_points desc` picks each user's highest-scoring league membership when they're in more than one league for the same competition, per product decision.
- Final result is not globally ordered by the function (Postgres doesn't guarantee `distinct on` output order beyond its own `order by`); the client sorts by `total_points desc` same as it already does for the Friends query.
- Migration file only — applied by the user via CLI/dashboard, not auto-applied.

## API + Hooks

`leagueApi.ts` — new function:

```ts
async getCompetitionLeaderboard(competitionId: number) {
  const { data, error } = await supabase.rpc('get_competition_leaderboard', {
    p_competition_id: competitionId,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as LeaderboardMember[]).sort((a, b) => (b.total_points ?? 0) - (a.total_points ?? 0));
}
```

`useLeagues.ts` — new hook:

```ts
export const useGetCompetitionLeaderboard = (competitionId?: number) => {
  return useQuery({
    queryKey: competitionId
      ? KEYS.competitions.leaderboard(competitionId)
      : (['competitions', 'leaderboard', 'disabled'] as const),
    queryFn: competitionId ? () => leagueApi.getCompetitionLeaderboard(competitionId) : skipToken,
    staleTime: 1000 * 60 * 5,
  });
};
```

`queryClient.ts` — new key under the existing `competitions` namespace:

```ts
leaderboard: (competitionId: number) => ['competitions', competitionId.toString(), 'leaderboard'] as const,
```

`competitionId` comes from the existing `useCompetitionId()` (`src/store/PrimaryLeagueStore.ts`) — the active/primary league's competition.

Reuses the existing `LeaderboardMember` type (`Tables<'league_leaderboard_view'>`: `member_id, league_id, user_id, nickname, avatar_url, total_points`) — the RPC returns the same shape.

`database.types.ts` is auto-generated (`npm run sync-types`) from the live schema, so it won't know about the new RPC until the migration is applied and types are re-synced. Implementation adds a matching `get_competition_leaderboard` entry to the `Functions` section by hand (args + returns, matching the SQL above) so `supabase.rpc(...)` type-checks in the meantime; running `sync-types` later should produce the same shape and is a no-op diff.

## UI

**Screen state:** `LeaderboardScreen` gains `audience: 'friends' | 'world'` (alongside the existing `scope: 'round' | 'season'`, which now only applies when `audience === 'friends'`).

**Header layout change:**
- Sticky/collapsed header (currently holds only the Round/Season toggle + trophy button) now holds a new `LeaderboardAudienceToggle` (Friends/World, same visual style as `LeaderboardScopeToggle`) + the trophy button.
- The existing `LeaderboardScopeToggle` (Round/Season) moves into the scrollable body, directly above the `Podium`, and renders only when `audience === 'friends'`.

**Content branching:**
- `audience === 'friends'`: unchanged — `useGetLeaderboard`/`useGetRoundLeaderboard` by `leagueId`, `Podium`, `LeaderboardList`, "Full ranking" divider, `InviteFriendsCard`.
- `audience === 'world'`: `useGetCompetitionLeaderboard(competitionId)`, `Podium`, ranking list — no Round/Season toggle, no invite card.
- First-time loading of the World data (query not yet fetched) shows a body-only skeleton — export `PodiumSkeleton` and a new `LeaderboardBodySkeleton` (podium + row skeletons, no `Screen` wrapper) from `LeaderboardSkeleton.tsx` for reuse inside the scroll content, since the full-screen `LeaderboardSkeleton` isn't appropriate mid-scroll.

**Shared component changes:**
- `Podium` / `PodiumMember` (`Pudiom.tsx`) and `LeaderboardRow` (`LeaderboardList.tsx`) gain a `clickable?: boolean` prop, default `true`. When `false` (World), avatars/rows render as plain `View` instead of `Link` + `TouchableOpacity` — tapping a stranger's row does nothing, per product decision.
- "Current user" highlighting switches from comparing `member_id` to comparing `user_id === currentUserId` (via `useAuthStore`), since World's winning row for the current user may belong to a different league membership than their primary one, but always carries their own `user_id`. This same comparison works for Friends too (each league has exactly one row per member, so it's equivalent there).

## Testing

- Manual: switch Friends ↔ World on a competition with more than one league sharing it; confirm World shows members across leagues, ranked correctly, own row highlighted, taps do nothing.
- Manual: a user who is in two leagues for the same competition appears once in World, with their higher score.
- Manual: block a user (existing moderation flow) → confirm they disappear from World too.
- Manual: Friends tab behavior (Round/Season toggle, invite card, tap-to-profile) is unchanged.
- Unit: `leagueApi.getCompetitionLeaderboard` — mocked Supabase client, asserts the RPC is called with the right param and result is sorted by `total_points desc` (mirrors the existing `leagueApi.test.ts` pattern for `getLeaderboardView`).
