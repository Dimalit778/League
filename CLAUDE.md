# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
      (member)/         # Authenticated member screens
        (tabs)/         # Bottom tabs: Home, Matches, Stats, Profile
        match/          # Match detail screen
        member/         # Member profile screen
        profile/        # Own profile screen
      (admin)/          # Admin-only screens
      (public)/         # Public screens (join league, etc.)
    (auth)/             # Sign in / sign up screens
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

- `AuthStore` — `session`, `user`, `isAuthenticated`, `isAuthLoading`. Persisted via MMKV.
- `MemberStore` — `activeMember`, `memberId`, `leagueId`, `competitionId`. The active league membership drives most of the app. Call `initializeMember()` after login; it queries Supabase for the `is_primary` league_member row.
- `LanguageStore` — current language (`en` | `he`) + RTL flag.
- `ThemeStore`, `SidebarStore` — UI state.

### Competition/match display logic

Competitions have a `type` field and a `current_stage` field. The stage drives which UI view is shown:

- **Domestic league** (`REGULAR_SEASON`, `CLAUSURA`, etc.) → fixture-by-fixture list view ([LeagueMatchesView](src/features/matches/screens/LeagueMatchesView.tsx))
- **Cup with groups** (`GROUP_STAGE`, `PRELIMINARY_ROUND`, etc.) → groups + knockout shell ([GroupsKnockoutMatchesView](src/features/matches/screens/GroupsKnockoutMatchesView.tsx))
- **Pure knockout** (`FINAL`, `SEMI_FINALS`, etc.) → knockout bracket only ([LeagueKnockoutMatchesView](src/features/matches/screens/LeagueKnockoutMatchesView.tsx))

Stage classification helpers live in [src/features/matches/types/footballStages.ts](src/features/matches/types/footballStages.ts): `isDomesticLeagueStage`, `isGroupPhaseStage`, `isKnockoutOnlyStage`.

### i18n

Translations are in [src/lib/i18n/translations.ts](src/lib/i18n/translations.ts), organised by feature. The `t(key)` helper returns the key unchanged when no translation exists. Always use `useTranslation()` for user-facing strings.

### Testing

Jest with `jest-expo` preset. All heavy native modules (Supabase, react-query, MMKV, react-hook-form, Reanimated, etc.) are globally mocked in [jest.setup.ts](jest.setup.ts). Tests live in `__tests__/` directories colocated with the code they test.

The global `testFormValues` object is the bridge between `react-hook-form` mock's `setValue`/`getValues` and test assertions.

### Path aliases

`@/` maps to `src/` and `@assets/` maps to `src/assets/`. Defined in tsconfig and jest `moduleNameMapper`.
