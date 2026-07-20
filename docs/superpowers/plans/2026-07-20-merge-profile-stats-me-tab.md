# Merge Profile + Stats into a "Me" tab — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the league tab bar from 5 tabs to 4 by merging Profile + Stats into one member-scoped "Me" tab, relocating league-management actions into `EditLeagueScreen`.

**Architecture:** The `Me` tab is the existing `ProfileScreen` rewritten to compose identity (hero + nickname) on top and the existing `memberStats` components below. All league administration (join code, invite, leave, delete, name edit, member removal) consolidates into `EditLeagueScreen`, reached via a gear button inside the Me screen. `EditLeagueScreen` renders per-role (owner vs non-owner).

**Tech Stack:** Expo React Native, expo-router (file-based tabs), TanStack Query, Zustand (MemberStore), NativeWind, jest-expo (global native mocks in `jest.setup.ts`).

## Global Constraints

- All user-facing strings go through `useTranslation()` / `t(key)`; keys defined in `src/lib/i18n/translations.ts`, organised by feature. `t(key)` returns the key unchanged if missing.
- App is bilingual EN/HE with RTL — use logical layout (`top-end`, `ms-*`/`me-*` or `gap`) not left/right where a new element is added.
- Query keys only via `KEYS.*` from `src/lib/queryClient.ts` — never raw arrays.
- Member/league data is member-scoped; user Settings (`(app)/(user)/`) is user-scoped — do not move league actions into Settings.
- Path aliases: `@/` → `src/`, `@assets/` → `src/assets/`.
- Tests colocate in `__tests__/`; heavy native modules are globally mocked in `jest.setup.ts`. Run a single file with `npx jest <path>`.
- Lint with `npm run lint` before each commit.

---

### Task 1: EditLeagueScreen absorbs league management (join code, invite, leave) + owner/non-owner split

**Files:**
- Modify: `src/features/leagues/screens/EditLeagueScreen.tsx`
- Modify: `src/lib/i18n/translations.ts` (add `"Manage League"` key; verify existing keys)
- Test: `src/features/leagues/screens/__tests__/EditLeagueScreen.test.tsx` (create)

**Interfaces:**
- Consumes: `useGetLeagueAndMembers(leagueId)` → league with `owner_id`, `name`, `join_code`, `league_members[]`; `useLeaveLeague()`, `useDeleteLeague()`, `useRemoveMember()`, `useUpdateLeague()` from `@/features/leagues/hooks/useLeagues`; `selectMemberUserId`, `selectLeagueId` from `@/store/MemberStore`.
- Produces: a `EditLeagueScreen` (default export) reachable at route `/(app)/(league)/edit` that renders join code + Invite for all members, Leave for non-owners, Delete for owners, and guards name-edit / member-removal behind `isOwner`.

- [ ] **Step 1: Add i18n key**

In `src/lib/i18n/translations.ts`, add to the leagues section (both `en` and `he`):
```ts
'Manage League': 'Manage League', // en
'Manage League': 'ניהול ליגה',     // he
```
Verify these keys already exist (they are reused, not created): `'Invite friends'`, `'Leave league'`, `'Delete League'`, `'Invite code'` / `'Join code copied to clipboard.'`, `'Copied!'`. If `'Invite code'` is missing, add `en: 'Invite code'`, `he: 'קוד הצטרפות'`.

- [ ] **Step 2: Write the failing test (permission split)**

Create `src/features/leagues/screens/__tests__/EditLeagueScreen.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import EditLeagueScreen from '@/features/leagues/screens/EditLeagueScreen';

const OWNER_USER_ID = 'owner-user-1';
const league = {
  id: 'league-1',
  name: 'My League',
  owner_id: OWNER_USER_ID,
  join_code: 'ABC123',
  competition: { name: 'Premier League', area: 'England', logo: '' },
  league_members: [
    { id: 'm1', user_id: OWNER_USER_ID, nickname: 'Owner', avatar_url: null },
    { id: 'm2', user_id: 'other-user-2', nickname: 'Member', avatar_url: null },
  ],
};

jest.mock('@/features/leagues/hooks/useLeagues', () => ({
  useGetLeagueAndMembers: () => ({ data: league, isLoading: false, error: null }),
  useLeaveLeague: () => ({ mutate: jest.fn(), isPending: false }),
  useDeleteLeague: () => ({ mutate: jest.fn(), isPending: false }),
  useRemoveMember: () => ({ mutate: jest.fn(), isPending: false }),
  useUpdateLeague: () => ({ mutate: jest.fn(), isPending: false }),
}));

const mockMemberStore = { userId: OWNER_USER_ID, leagueId: 'league-1' };
jest.mock('@/store/MemberStore', () => ({
  useMemberStore: (selector: any) => selector({ primaryMember: { memberId: mockMemberStore.userId, leagueId: mockMemberStore.leagueId } }),
  selectMemberUserId: (s: any) => s.primaryMember.memberId,
  selectLeagueId: (s: any) => s.primaryMember.leagueId,
}));

describe('EditLeagueScreen permissions', () => {
  it('owner sees Delete League and join code, not Leave', () => {
    mockMemberStore.userId = OWNER_USER_ID;
    const { queryByText } = render(<EditLeagueScreen />);
    expect(queryByText('Delete League')).toBeTruthy();
    expect(queryByText('ABC123')).toBeTruthy();
    expect(queryByText('Leave league')).toBeNull();
  });

  it('non-owner sees Leave league and join code, not Delete', () => {
    mockMemberStore.userId = 'other-user-2';
    const { queryByText } = render(<EditLeagueScreen />);
    expect(queryByText('Leave league')).toBeTruthy();
    expect(queryByText('ABC123')).toBeTruthy();
    expect(queryByText('Delete League')).toBeNull();
  });
});
```
Note: `selectMemberUserId` currently maps to `memberId` in the store; confirm the real selector shape when wiring the mock and adjust the mock to match the actual store selectors.

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest src/features/leagues/screens/__tests__/EditLeagueScreen.test.tsx`
Expected: FAIL — non-owner branch renders no `Leave league`, join code not shown (current screen lacks these).

- [ ] **Step 4: Implement — add join code + Invite + Leave, guard owner-only controls**

In `src/features/leagues/screens/EditLeagueScreen.tsx`:

Add imports:
```tsx
import * as Clipboard from 'expo-clipboard';
import { Share } from 'react-native';
import { useLeaveLeague } from '@/features/leagues/hooks/useLeagues';
import { Copy, LogOut, UserPlus } from 'lucide-react-native';
```

Add hooks inside the component (next to existing `deleteLeague`):
```tsx
const leaveLeague = useLeaveLeague();
```

Add handlers:
```tsx
const handleCopyJoinCode = async () => {
  if (typeof league?.join_code === 'string') {
    await Clipboard.setStringAsync(league.join_code);
    Alert.alert(t('Copied!'), t('Join code copied to clipboard.'));
  }
};

const handleInviteFriends = async () => {
  if (!league) return;
  try {
    await Share.share({
      message: t('Join my {{area}} league "{{name}}"!\n\nUse code: {{join_code}}\n\nDownload the app to join!', {
        area: league.competition?.area || 'Football',
        name: league.name,
        join_code: league.join_code,
      }),
      title: t('Join {{name}} League', { name: league.name }),
    });
  } catch {
    showAlert({ title: t('Error'), message: t('Failed to share invite code'), type: 'error', buttons: [{ text: 'OK' }] });
  }
};

const confirmLeaveLeague = () => {
  if (!leagueId) return;
  showAlert({
    title: t('Leave League'),
    message: t('Are you sure you want to leave this league?'),
    type: 'warning',
    buttons: [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Leave'), style: 'destructive', onPress: () => leaveLeague.mutate(leagueId) },
    ],
  });
};
```

Change the header title to Manage League:
```tsx
<BackButton title={t('Manage League')} />
```

In the league-details card, make the name field editable only for owner and show a read-only name for non-owner; add a join-code row + Invite button visible to all. Replace the current `<TextInput>` block with:
```tsx
{isOwner ? (
  <TextInput
    value={editedLeagueName}
    onChangeText={setEditedLeagueName}
    placeholder={t('Enter league name')}
    className="text-text px-3 py-3 bg-background border border-border rounded-lg"
    autoCapitalize="words"
    autoCorrect={false}
    autoComplete="off"
  />
) : (
  <Text variant="body" bold className="px-3 py-3">{league?.name}</Text>
)}

<Pressable onPress={handleCopyJoinCode} className="flex-row items-center justify-between mt-3 active:opacity-70">
  <Text className="text-muted">{t('Invite code')}</Text>
  <View className="flex-row items-center gap-2">
    <Text semibold className="tracking-widest text-primary">{league?.join_code}</Text>
    <Copy size={14} color={/* colors.primary */ undefined} />
  </View>
</Pressable>

<Pressable onPress={handleInviteFriends} className="flex-row items-center gap-2 mt-3 active:opacity-70">
  <UserPlus size={18} />
  <Text semibold className="text-primary">{t('Invite friends')}</Text>
</Pressable>
```
(Use `useThemeTokens()` `colors` for icon colors, matching the file's existing style — add `const { colors } = useThemeTokens();` and pass `color={colors.primary}`.)

Guard the Save button so it only renders for `isOwner` (wrap the existing Save `<Button>` block in `{isOwner && ( ... )}`). The member-remove button is already guarded (`{!isOwner && ...}` per member and `handleRemoveMember` early-returns for non-owners) — confirm the whole `sortedMembers.map` remove control is gated so non-owners see the list read-only: wrap the trash `Pressable` in `isOwner &&`.

Add the Leave button for non-owners, next to the existing owner-only Delete block:
```tsx
{!isOwner && (
  <View className="px-4 mt-4 mb-6">
    <Pressable
      onPress={confirmLeaveLeague}
      disabled={leaveLeague.isPending}
      accessibilityRole="button"
      accessibilityLabel={t('Leave league')}
      className="flex-row items-center justify-center gap-2.5 rounded-xl border border-error px-5 py-3 active:opacity-80 disabled:opacity-50"
    >
      <LogOut size={18} color={colors.error} strokeWidth={2.5} />
      <Text semibold className="text-error">{t('Leave league')}</Text>
    </Pressable>
  </View>
)}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest src/features/leagues/screens/__tests__/EditLeagueScreen.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no new errors in `EditLeagueScreen.tsx`.

- [ ] **Step 7: Commit**

```bash
git add src/features/leagues/screens/EditLeagueScreen.tsx src/lib/i18n/translations.ts src/features/leagues/screens/__tests__/EditLeagueScreen.test.tsx
git commit -m "feat(leagues): consolidate league management into Manage League screen

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Rewrite ProfileScreen as the merged "Me" screen + gear entry to Manage League

**Files:**
- Modify: `src/features/profile/ProfileScreen.tsx`
- Modify: `src/features/profile/components/ProfileHeroCard.tsx` (add gear → `/edit`)
- Delete: `src/features/profile/components/ProfileLeagueDetails.tsx`
- Delete: `src/features/profile/components/ProfileActionsMenu.tsx`
- Test: `src/features/profile/__tests__/ProfileScreen.test.tsx` (create)

**Interfaces:**
- Consumes: `usePrimaryMember()` (`memberId`, `nickname`, `avatarUrl`, `leagueName`, `leagueId`); `useMemberStats(memberId)` from `@/features/memberStats/hooks/useMemberStats`; `memberStats` components exported from `@/features/memberStats/components`; `ProfileHeroCard`, `ProfileNicknameEdit` from profile; `useFloatBottomTabsInset`, `Error` from `@/components/layout`.
- Produces: `ProfileScreen` (default export) — the merged Me screen, still imported by the tab route `Profile.tsx`.

- [ ] **Step 1: Write the failing render test**

Create `src/features/profile/__tests__/ProfileScreen.test.tsx`:
```tsx
import { render } from '@testing-library/react-native';
import ProfileScreen from '@/features/profile/ProfileScreen';

jest.mock('@/store/MemberStore', () => ({
  usePrimaryMember: () => ({
    memberId: 'm1', nickname: 'tester', avatarUrl: null, leagueName: 'My League', leagueId: 'l1',
  }),
}));

jest.mock('@/features/memberStats/hooks/useMemberStats', () => ({
  useMemberStats: () => ({
    data: {
      totalPoints: 42, position: 3, roundPerformance: [], bestCategory: null,
      // include any other fields StatsPredictionSection/Achievements read; use minimal safe defaults
    },
    isLoading: false, error: null, refetch: jest.fn(),
  }),
}));

describe('ProfileScreen (merged Me tab)', () => {
  it('renders identity and a stats value without crashing', () => {
    const { queryByText } = render(<ProfileScreen />);
    expect(queryByText('42')).toBeTruthy();       // StatsHeroCard points
  });
});
```
Note: inspect `memberStats/types` and each stats component to supply every field they dereference (avoid runtime crashes on `undefined`). Fill the `data` mock with those exact fields before running.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/features/profile/__tests__/ProfileScreen.test.tsx`
Expected: FAIL — current `ProfileScreen` renders league sections (not stats), and calls `useGetLeagueAndMembers` (unmocked) so `42` is absent / it errors.

- [ ] **Step 3: Rewrite `ProfileScreen.tsx`**

Replace the file contents with:
```tsx
import { Error, useFloatBottomTabsInset } from '@/components/layout';
import {
  SkeletonStats,
  StatsBestCategory,
  StatsHeroCard,
  StatsPredictionSection,
  StatsRoundPerformance,
} from '@/features/memberStats/components';
import { Achievements } from '@/features/memberStats/components/Achievement';
import { useMemberStats } from '@/features/memberStats/hooks/useMemberStats';
import { ProfileHeroCard } from '@/features/profile/components/ProfileHeroCard';
import { ProfileNicknameEdit } from '@/features/profile/components/ProfileNicknameEdit';
import { usePrimaryMember } from '@/store/MemberStore';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

const ProfileScreen = () => {
  const member = usePrimaryMember();
  const bottomInset = useFloatBottomTabsInset();
  const { data: stats, isLoading, error } = useMemberStats(member.memberId);

  if (error) return <Error error={error} />;
  if (isLoading || !stats) return <SkeletonStats />;

  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: bottomInset }}>
      <ProfileHeroCard />
      <ProfileNicknameEdit initialNickname={member.nickname ?? ''} />

      <View className="mt-2">
        <StatsHeroCard points={stats.totalPoints} rank={stats.position ?? 0} />
      </View>
      <StatsPredictionSection stats={stats} />
      <Achievements stats={stats} />
      <StatsRoundPerformance rounds={stats.roundPerformance ?? []} />
      <StatsBestCategory bestCategory={stats.bestCategory} />

      <View className="h-4" />
    </ScrollView>
  );
};

export default ProfileScreen;
```
(If `Achievements` is re-exported from `@/features/memberStats/components`, import it from there instead of the direct path — match whatever `components/index.ts` exports.)

- [ ] **Step 4: Add the gear button to `ProfileHeroCard.tsx`**

In `src/features/profile/components/ProfileHeroCard.tsx`, add imports:
```tsx
import { Link } from 'expo-router';
import { Settings } from 'lucide-react-native';
```
Wrap the returned `<HeaderSection>` content so the gear sits top-end. Inside the outer `<View className="p-4">`, add as the first child a positioned link:
```tsx
<Link href="/(app)/(league)/edit" asChild>
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityLabel={t('Manage League')}
    className="absolute top-2 end-2 z-10 h-9 w-9 items-center justify-center rounded-full bg-surfaceSecondary"
    hitSlop={6}
  >
    <Settings size={18} color={colors.primary} strokeWidth={2} />
  </TouchableOpacity>
</Link>
```
(`TouchableOpacity` and `colors`/`t` are already imported/available in this file.)

- [ ] **Step 5: Delete the now-unused components**

```bash
git rm src/features/profile/components/ProfileLeagueDetails.tsx src/features/profile/components/ProfileActionsMenu.tsx
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx jest src/features/profile/__tests__/ProfileScreen.test.tsx`
Expected: PASS.

- [ ] **Step 7: Verify no dangling imports + lint**

Run: `grep -rn "ProfileLeagueDetails\|ProfileActionsMenu" src` → expect no matches.
Run: `npm run lint`
Expected: no new errors.

- [ ] **Step 8: Commit**

```bash
git add src/features/profile
git commit -m "feat(profile): merge stats into Me screen, add Manage League entry

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Update tabs to 4 (remove Stats, rename Profile→Me, reorder) and delete dead screens

**Files:**
- Modify: `src/app/(app)/(league)/(tabs)/_layout.tsx`
- Modify: `src/lib/i18n/translations.ts` (add `"Me"` key)
- Delete: `src/app/(app)/(league)/(tabs)/Stats.tsx`
- Delete: `src/features/memberStats/MemberStatsScreen.tsx`

**Interfaces:**
- Consumes: `ProfileIcon`, `FieldIcon`, `MatchesIcon`, `RankIcon` from `@assets/icons`.
- Produces: a 4-tab bar `Home · Matches · Leaderboard · Me`.

- [ ] **Step 1: Add i18n key**

In `src/lib/i18n/translations.ts` add (both langs):
```ts
'Me': 'Me',     // en
'Me': 'שלי',    // he
```

- [ ] **Step 2: Edit `_layout.tsx`**

- Remove the entire `<Tabs.Screen name="Stats" ... />` block.
- Change the `Profile` screen options to `title: t('Me')` (keep `name="Profile"`, keep `ProfileIcon`).
- Reorder the `Tabs.Screen` children to: `index` (Home), `Matches`, `Leaderboard`, `Profile` (Me).

Resulting children order:
```tsx
<Tabs.Screen name="index" options={{ title: t('Home'), tabBarIcon: ({ color, size }) => <FieldIcon size={size} color={color} /> }} />
<Tabs.Screen name="Matches" options={{ title: t('Matches'), tabBarIcon: ({ color, size }) => <MatchesIcon size={size} color={color} /> }} />
<Tabs.Screen name="Leaderboard" options={{ title: t('Leaderboard'), tabBarIcon: ({ color, size }) => <RankIcon size={size} color={color} /> }} />
<Tabs.Screen name="Profile" options={{ title: t('Me'), tabBarIcon: ({ color, size }) => <ProfileIcon size={size} color={color} /> }} />
```

- [ ] **Step 3: Delete dead files**

```bash
git rm "src/app/(app)/(league)/(tabs)/Stats.tsx" src/features/memberStats/MemberStatsScreen.tsx
```

- [ ] **Step 4: Verify no dangling references + lint + full test run**

Run: `grep -rn "MemberStatsScreen\|(tabs)/Stats" src` → expect no matches (the `Stats.tsx` route and the screen are both gone).
Run: `npm run lint` → no new errors.
Run: `npx jest src/features/profile src/features/leagues` → PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/(league)/(tabs)/_layout.tsx" src/lib/i18n/translations.ts
git commit -m "feat(tabs): collapse to 4 tabs, rename Profile to Me

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Manual verification in the running app

**Files:** none (verification only).

- [ ] **Step 1: Start the app**

Run: `npm start` (or `npm run ios`). Load a league where the current user is **owner**.

- [ ] **Step 2: Verify the Me tab**

Expected: 4 tabs `Home · Matches · Leaderboard · Me`. Me tab shows avatar/name/league hero with a gear (top-end), nickname row, then rank/points and the stats sections. No "Stats" tab.

- [ ] **Step 3: Verify Manage League (owner)**

Tap the gear → Manage League screen. Owner sees: editable name, member list with remove, join code (copy works), Invite friends (share sheet opens), Delete League. No "Leave league".

- [ ] **Step 4: Verify Manage League (non-owner)**

Switch to a league where the user is a regular member. Gear → Manage League shows: read-only name, member list without remove, join code, Invite, **Leave league**. No name edit / Delete.

- [ ] **Step 5: Verify RTL (Hebrew)**

Switch language to Hebrew. Confirm the gear stays in the top-end corner and tab labels read `שלי` etc. correctly.

---

## Self-Review

- **Spec coverage:** §1 tabs → Task 3; §2 merged screen → Task 2; §3 EditLeagueScreen absorption + owner/non-owner → Task 1; §4 gear entry point → Task 2 Step 4; §5 files (deletes) → Tasks 2 & 3; §6 i18n → Tasks 1 & 3, tests → Tasks 1 & 2, plus manual verification Task 4. All covered.
- **Placeholder scan:** Test data mocks intentionally say "fill exact fields from `memberStats/types`" — this is a real instruction to read the types, not a code placeholder; the surrounding test code is complete. No TBD/TODO in implementation code.
- **Type consistency:** `StatsHeroCard` used as `points`/`rank`; `StatsRoundPerformance` as `rounds`; `StatsBestCategory` as `bestCategory`; `StatsPredictionSection`/`Achievements` as `stats` — matches the current `MemberStatsScreen` usage. Route `/(app)/(league)/edit` consistent across gear link and manual steps.
