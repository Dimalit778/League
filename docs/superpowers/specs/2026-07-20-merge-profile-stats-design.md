# Merge Profile + Stats into a single "Me" tab

**Date:** 2026-07-20
**Status:** Approved design, pending implementation plan

## Goal

Reduce the league bottom-tab bar from 5 tabs to 4 by merging the **Profile** and
**Stats** tabs into one member-scoped **"Me"** tab. As part of the merge, relocate
all league-management actions (currently living in Profile) into the existing
`EditLeagueScreen`, so the Me tab stays focused on *identity + performance* and
league administration lives in one place.

**Primary motivation:** fewer tabs / cleaner tab bar. Secondary wins: a coherent
"me" surface and removal of the existing duplication between the Profile screen
and `EditLeagueScreen`.

## Context (current state)

- Tabs (`src/app/(app)/(league)/(tabs)/_layout.tsx`): `Home · Stats · Matches · Profile · Leaderboard`.
- `ProfileScreen` (`src/features/profile/ProfileScreen.tsx`) renders: `ProfileHeroCard`,
  `ProfileNicknameEdit`, `ProfileLeagueDetails`, `ProfileActionsMenu`.
- `MemberStatsScreen` (`src/features/memberStats/MemberStatsScreen.tsx`) renders:
  `StatsHeroCard`, `StatsPredictionSection`, `Achievements`, `StatsRoundPerformance`,
  `StatsBestCategory`.
- `EditLeagueScreen` (`src/features/leagues/screens/EditLeagueScreen.tsx`, routed via
  `(app)/(league)/edit.tsx`) already holds: competition badge, editable league name
  (owner), member list with remove (owner), Save, Delete League (owner).
- There is already **duplication**: league name, delete league, and member listing
  appear in both `ProfileScreen` (via its league sections) and `EditLeagueScreen`.
- `TabsHeader` (`src/components/layout/TabsHeader.tsx`) is a **global** header shared by
  all tabs (set in `_layout.tsx` `screenOptions.header`), not per-tab.
- Settings (`src/features/settings`, routed under `(app)/(user)/`) is **User-scoped**
  (sign out, delete account, language, theme, subscription). League actions are
  **Member/League-scoped** and therefore must NOT move into user Settings.

## Approach

Chosen: **"lean merged screen" (Approach A).** A single Me screen composes the
identity elements on top and the existing `memberStats` components below. League
management moves into `EditLeagueScreen`, reachable via a gear affordance inside the
Me screen body (not the global header). Rejected: bolting an identity header onto the
Stats screen (B — doesn't give league management a home), and internal sub-tabs (C —
reintroduces "two screens" inside one tab, defeating the goal).

## Design

### 1. Tabs & Routing

- **Before:** `Home · Stats · Matches · Profile · Leaderboard` (5 tabs).
- **After:** `Home · Matches · Leaderboard · Me` (4 tabs).
- Changes in `(tabs)/_layout.tsx`:
  - Remove the `Stats` `Tabs.Screen`.
  - Rename the `Profile` tab to the Me tab: `title: t('Me')`, icon `ProfileIcon`.
  - Reorder so Me is last.
- Delete `(tabs)/Stats.tsx`.
- Icon note: `Stats` and `Leaderboard` both used `RankIcon` (a visual duplicate).
  After removing Stats, only Leaderboard uses `RankIcon`, so the duplication resolves
  itself.
- `EditLeagueScreen` stays at `(app)/(league)/edit.tsx` (outside the tabs), reached
  from within the Me tab.

### 2. The merged Me screen

`ProfileScreen.tsx` becomes the merged screen (kept under `src/features/profile/`,
name retained to minimize churn in the `Profile.tsx` route file). Composition,
top to bottom, inside a single `ScrollView`:

```
<ScrollView contentContainerStyle={{ paddingBottom: bottomInset }}>
  ProfileHeroCard        // identity: avatar + name + league (+ gear to Manage League — §4)
  ProfileNicknameEdit    // member-scoped nickname edit
  StatsHeroCard          // rank + total points
  StatsPredictionSection
  Achievements
  StatsRoundPerformance
  StatsBestCategory
</ScrollView>
```

- Data/hooks: the Me screen runs `useMemberStats(member.memberId)` (from
  `memberStats`) and reads identity from `usePrimaryMember()`. It no longer calls
  `useGetLeagueAndMembers` — that moves to `EditLeagueScreen`. The Me tab becomes
  lighter (stats + store identity only).
- Loading/Error: reuse `SkeletonStats` and the shared `Error` component. `ProfileSkeleton`
  is no longer needed on this tab.
- Bottom inset: keep `useFloatBottomTabsInset` (already used by the Stats screen).
- `MemberStatsScreen.tsx` is deleted once its composition is absorbed into the merged
  `ProfileScreen`.

### 3. EditLeagueScreen absorbs league management

`EditLeagueScreen` already has: competition badge, editable league name (owner),
member list with remove (owner), Save, Delete League (owner). What moves in from the
old Profile screen:

| From Profile | Destination in EditLeagueScreen | Visibility |
|---|---|---|
| Join code + Copy (`ProfileLeagueDetails`) | New row in the league-details card | All members |
| Invite friends / Share (`ProfileActionsMenu`) | New button/row | All members |
| Leave league (`ProfileActionsMenu`) | Bottom button | Non-owner only |
| Delete League | Already present | Owner only |
| League name, member count, "created by" | Already represented (editable name, member list) | — (not copied) |

**Permissions (owner vs non-owner):** today `edit.tsx` is effectively an owner
screen. After the change it is reachable by **any member**, so it must render
per-role:

- Non-owner sees: league details (read-only), join code, Invite, member list
  (no remove buttons), **Leave league**.
- Owner sees: editable name, member removal, Invite, **Delete League** (no Leave —
  an owner deletes rather than leaves).

Add/confirm `isOwner` guards around the name edit and member-remove controls (some
already exist). Rename the screen title from "Edit League" to **"Manage League"**
(he: "ניהול ליגה"), since it is no longer edit-only.

### 4. Entry point to Manage League

Because the header is global, the entry point lives **inside the Me screen body**:

- A **gear button** in the top-end corner of `ProfileHeroCard` (RTL-aware `top-end`)
  → `<Link href="/(app)/(league)/edit">`.
- Available to **all members** (owner and non-owner both need the Manage League screen).
- This replaces the previously owner-only `Link` to `/(app)/(league)/edit` that was
  hidden inside `ProfileLeagueDetails`; the entry point is now visible and uniform.

### 5. Files: created / changed / deleted

**Changed:**
- `(tabs)/_layout.tsx` — remove `Stats` screen, retitle `Profile`→"Me", reorder tabs.
- `profile/ProfileScreen.tsx` — becomes the merged screen (identity + nickname +
  `memberStats` components).
- `profile/components/ProfileHeroCard.tsx` — add a gear button linking to `/edit`.
- `leagues/screens/EditLeagueScreen.tsx` — absorb join code, Invite, Leave; add
  owner/non-owner guards; title "Manage League".
- `lib/i18n/translations.ts` — add `"Me"` and `"Manage League"` keys.

**Deleted:**
- `(tabs)/Stats.tsx`
- `profile/components/ProfileLeagueDetails.tsx` (content moves into EditLeagueScreen)
- `profile/components/ProfileActionsMenu.tsx` (Invite/Leave move; the "Notifications"→
  `/settings` row is dropped — it duplicates the global-header settings entry)
- `memberStats/MemberStatsScreen.tsx` (composition absorbed into `ProfileScreen`)

**Unchanged:** all `memberStats/components/*`, `ProfileNicknameEdit`, `ProfileHeroCard`
(apart from the added gear).

### 6. i18n & Testing

**i18n** (`src/lib/i18n/translations.ts`):
- New key `"Me"` (he: TBD at write time — "אזור אישי" / "שלי").
- New key `"Manage League"` (he: "ניהול ליגה").
- Invite / Leave / join-code keys already exist and only move components — no new keys.

**Testing:**
- Existing settings tests are unaffected.
- `profile` and `memberStats` have no existing tests today.
- Since this is mostly recomposition of existing components (not new logic):
  - A light render test for the merged `ProfileScreen` — renders identity + a stats
    section without crashing, using the global mocks in `jest.setup.ts`.
  - A test for `EditLeagueScreen` verifying the **permission split**: owner sees
    Delete and not Leave; non-owner sees Leave and not name-edit / delete. This is the
    newest logic and the most worth covering.
- No tests added for charts / hero cards (presentation only).

## Out of scope (YAGNI)

- Merging Stats and Leaderboard (both surface rank) — a separate, larger question; not
  part of this change.
- Fixing the global `TabsHeader` (its non-functional Settings gear, Trophy nav) — a
  separate concern.
- Any redesign of the stats charts or hero cards.
