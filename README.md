# League Champion

A mobile-first Expo app for managing private football leagues. Members can make predictions, track live fixtures, and compete on a shared leaderboard backed by Supabase authentication and data.

## Features
- **League leaderboard** – see top members with points and quick access to their profiles.  
- **Match center** – browse fixtures by round and open detailed match pages.  
- **Personal stats** – accuracy, points-per-pick, and bingo/regular hit breakdowns with charts.  
- **Auth & profiles** – email/password or Google sign-in, editable profiles, and secure Supabase storage.

## Tech stack
- [Expo Router](https://expo.dev/router) on React Native 0.81
- Supabase auth + typed queries (`src/lib/supabase.ts`, `src/types/database.types.ts`)
- Zustand for client state, TanStack Query for data fetching, NativeWind for styling
- React Hook Form + Yup for validation; Testing Library + Jest for unit tests

## Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo` recommended)
- Supabase project with:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Google OAuth client IDs for native and web sign-in if you enable GoogleAuth
  - `EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS`
  - `EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB`

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file with the variables above. (See `src/lib/supabase.ts` and `src/components/GoogleAuth.tsx` for references.)
3. Sync Supabase types if your schema changed:
   ```bash
   npm run sync-types
   ```

## Running the app
Start the Expo dev server (choose a platform when prompted):
```bash
npm run start
```
- For Android emulator: `npm run android`
- For iOS simulator (macOS): `npm run ios`
- For web: `npm run web`

## Testing & linting
```bash
npm test      # Jest + Testing Library
npm run lint  # ESLint via Expo config
```

## Key directories
- `src/app`: Expo Router routes for auth, league tabs, match detail, and profile flows
- `src/components`: Reusable UI, layout primitives, and feature widgets (leaderboards, charts, match lists)
- `src/store`: Zustand stores for member + league context
- `src/services`: Auth helpers and Supabase-facing logic
- `supabase`: SQL/RLS setup notes and admin guides
