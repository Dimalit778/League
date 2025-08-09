# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native mobile application built with Expo Router for football/soccer league prediction games. Users can create leagues, join existing ones, and make predictions on match outcomes. The app uses Supabase for backend services and authentication.

## Tech Stack

- **Framework**: React Native with Expo (~53.0.20)
- **Navigation**: Expo Router v5 with file-based routing
- **UI**: NativeWind (TailwindCSS for React Native) with custom theming
- **State Management**: Zustand for global state, React Query for server state
- **Backend**: Supabase (authentication, database, RPC functions)
- **Authentication**: Supabase Auth with custom auth store
- **Forms**: React Hook Form with Yup validation
- **TypeScript**: Strict mode enabled

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or
npx expo start

# Run on specific platforms
npm run android
npm run ios
npm run web

# Linting
npm run lint

# Reset project (removes starter code)
npm run reset-project
```

## Architecture

### App Structure
- **File-based routing** using Expo Router v5
- **Protected routes** with authentication guards in `src/app/_layout.tsx`
- **Two main route groups**: `(auth)` for unauthenticated screens, `(app)` for authenticated screens

### State Management
- **Zustand stores** in `src/store/`:
  - `useAuthStore.ts`: Authentication state and session management
  - `useLeagueStore.ts`: League-related state
  - `AppStore.ts`: Application-wide state
- **React Query** for server state management with 60s stale time

### Database Schema
The app uses Supabase with the following main tables:
- `users`: User profiles
- `leagues`: Football prediction leagues
- `league_members`: User membership in leagues with points tracking
- `competitions`: Football competitions (Premier League, La Liga, etc.)
- `fixtures`: Match fixtures with scores
- `teams`: Team information
- `user_predictions`: User predictions for matches

### Services Layer
- **Services** in `src/services/`:
  - `leagueService.ts`: League CRUD operations, joining leagues
  - `usersService.ts`: User profile management
  - `matchService.ts`: Match and fixture operations
  - `supabseQuerys.ts`: Database query utilities

### Custom Hooks
- `useLeagues.ts`: League data fetching and management
- `useFixtures.ts`: Match fixture data
- `useRoundData.ts`: Football season round information
- `useColorSchema.ts`: Theme management

### Theme System
- **NativeWind** with CSS variables for theming
- **ThemeContext** and **ThemeToggle** components for dark/light mode
- Custom color palette defined in `src/context/color-themes.ts`

## Key Features

1. **Authentication**: Email/password with Supabase Auth
2. **League Management**: Create leagues with join codes, set primary leagues
3. **Predictions**: Make predictions on football matches
4. **Leaderboards**: Points-based ranking system
5. **Multi-league Support**: Users can join multiple leagues

## Important Notes

- The app uses **Stack.Protected** guards for route protection based on authentication state
- **RPC functions** in Supabase for complex operations (see `functions/` directory)
- **Path aliases** configured: `@/*` maps to `./src/*`
- **Strict TypeScript** mode enabled
- **Database types** auto-generated in `src/types/database.types.ts`

## Testing

The project doesn't appear to have a formal test setup configured. Check with the team for preferred testing approach before adding tests.