# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server
npm start                         # Expo dev server
npm run ios                       # Run on iOS simulator
npm run android                   # Run on Android emulator

# Testing
npm test                          # Run all tests (watch mode)
npx jest path/to/file.test.ts     # Run single test file
npx jest --testNamePattern "name" # Run tests matching name

# Linting
npm run lint                      # Expo lint (ESLint)

# Database types
npm run sync-types                # Regenerate src/types/database.types.ts from Supabase schema

# Build
npm run prebuild                  # Removes console.logs then builds
```

## Architecture

This is an **Expo React Native** app using **expo-router** (file-based routing), **Supabase** as the backend, **TanStack Query** for server state, and **Zustand** for client state. Styling is **NativeWind** (Tailwind for React Native). The app supports English and Hebrew (RTL).

### Directory layout

```
src/
  app/                  # expo-router file-based routes
    (app)/
      (league)/         # Screens gated on an active primary league membership
        (tabs)/         # Bottom tabs: Home (index), Stats, Matches, Profile, Rank
        match/          # Match detail screen ([matchId])
        member/         # Member profile screen ([memberId])
        edit.tsx        # Edit league screen
      (admin)/          # Admin-only screens (guarded by useIsAdmin)
      (user)/           # User-level screens: my leagues (index), create/join league, settings
    (auth)/             # Sign in / sign up / verify email / password reset screens
  features/             # Feature slices (see below)
  providers/            # React context providers
  store/                # Zustand stores
  lib/                  # Supabase client, query keys, i18n, storage
  components/           # Shared UI and layout components
  hooks/                # Shared hooks
  types/                # database.types.ts (auto-generated) + shared types
```

### Feature slices

Each feature under `src/features/<name>/` follows the same internal structure:

- `api/` — Supabase calls (plain async functions)
- `hooks/` — TanStack Query wrappers (`useQuery`, `useMutation`)
- `screens/` — Screen-level components wired to hooks
- `components/` — Feature-local UI components
- `types/` — Feature-local TypeScript types

Features: `auth`, `leagues`, `matches`, `members`, `predictions`, `stats`, `subscription`, `settings`, `admin`.

### Query keys

All TanStack Query keys are defined in [src/lib/queryClient.ts](src/lib/queryClient.ts) under the `KEYS` object. Always use `KEYS.*` when calling `queryKey`, `invalidateQueries`, or `setQueryData`. Never write raw key arrays.

### Zustand stores

- `AuthStore` — `session`, `user`, `isAuthenticated`, `isAuthLoading`. `user`/`isAuthenticated` persisted via MMKV; the session itself lives only in Supabase's encrypted auth storage.
- `MemberStore` — `primaryMember` (member + league + competition of the primary league membership). Drives most of the app; `(app)/_layout.tsx` calls `initializeMember()` after login, which queries Supabase for the `is_primary` + `active` league_member row. Selectors like `selectMemberId`/`selectLeagueId` live in the store file.
- `LanguageStore` — current language (`en` | `he`) + RTL flag.
- `ThemeStore` — UI state.

### Competition/match display logic

The Matches tab loads the whole season once via `useSeasonMatches` and slices it client-side — every view/tab switch is zero extra network. [MatchesScreen](src/features/matches/screens/MatchesScreen.tsx) calls `resolveCompetitionShape(code)` ([model/competitionShape.ts](src/features/matches/model/competitionShape.ts)) to pick one stable composition view:

- **`REGULAR`** (`PL`, `BL1`, `PD`) → fixture-by-fixture list ([RegularLeagueView](src/features/matches/views/RegularLeagueView.tsx))
- **`LEAGUEPHASE_KO`** (`CL`) → league-phase fixtures + knockout tabs ([LeaguePhaseKnockoutView](src/features/matches/views/LeaguePhaseKnockoutView.tsx))
- **`GROUPS_KO`** (`WC`) → groups + knockout tabs ([GroupsKnockoutView](src/features/matches/views/GroupsKnockoutView.tsx))

The format is configured by competition code so partial or empty match syncs cannot change the selected view. Views compose three reusable engines ([engines/](src/features/matches/engines)): `FixtureListEngine`, `GroupsEngine`, `KnockoutEngine`. Data slicing lives in [model/selectors.ts](src/features/matches/model/selectors.ts); two-legged knockout ties are paired into aggregate cards by [model/knockout.ts](src/features/matches/model/knockout.ts) (`selectKnockoutTies` groups by `(stage, unordered team pair)`). Stage classification helpers live in [src/features/matches/types/footballStages.ts](src/features/matches/types/footballStages.ts): `isDomesticLeagueStage`, `isGroupPhaseStage`, `isKnockoutOnlyStage`.

### i18n

Translations are in [src/lib/i18n/translations.ts](src/lib/i18n/translations.ts), organised by feature. The `t(key)` helper returns the key unchanged when no translation exists. Always use `useTranslation()` for user-facing strings.

### Testing

Jest with `jest-expo` preset. All heavy native modules (Supabase, react-query, MMKV, react-hook-form, Reanimated, etc.) are globally mocked in [jest.setup.ts](jest.setup.ts). Tests live in `__tests__/` directories colocated with the code they test.

The global `testFormValues` object is the bridge between `react-hook-form` mock's `setValue`/`getValues` and test assertions.

### Path aliases

`@/` maps to `src/` and `@assets/` maps to `src/assets/`. Defined in tsconfig and jest `moduleNameMapper`.
