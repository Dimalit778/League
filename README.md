# ⭐ League Champion

The ultimate mobile experience for private football leagues — compete, predict, and stay connected to the game.

League Champion transforms the way friends, families, and communities engage with football. Create private leagues, make match predictions, track live fixtures, and climb dynamic leaderboards — all within a seamless, bilingual mobile experience.

## 🚀 What Makes League Champion Special?

### ⚡ Live Football Experience

- Stay updated with real-time scores, match events, and live statuses — automatically synced every few minutes from a professional football data API.

### 🏆 Private Leagues

- Create leagues, invite friends, and compete over prediction accuracy. Leaderboards update instantly as matches progress.

### 📊 Smart Stats & Insights

- Analyze your performance:

- Prediction accuracy

- Points per pick

- Bingo hits & regular hits

- Trend charts and analytics

### 🌍 Two Languages, One Experience

- The entire app supports English and Hebrew, including full RTL layout for native Hebrew users.

### 🌓 Beautiful Dark & Light Modes

- Adaptive theming provides an elegant, accessible UI — no matter the environment.

### 🔒 Secure & Scalable

- Powered by Supabase for authentication, storage, typed queries, and Row Level Security.

### 🧠 Automated Football Intelligence (Supabase Edge Functions)

- To keep everything fresh and reliable, automated cloud functions run continuously:

- ⏱ Every 5 Minutes

- ✔ Updates all live matches: scores, events, statuses

- 🌙 Every Night

- ✔ Syncs all completed matches to finalize stats and points

- 🌄 Daily Competition Refresh

- ✔ Updates competition metadata, including season, fixtures, and the active matchday

- All match, league, and competition data is stored and managed securely in Supabase.

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
- TanStack

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
