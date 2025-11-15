# App Structure Diagram

## Feature-Based Architecture

```
src/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Authentication routes
│   │   ├── signIn.tsx
│   │   ├── signUp.tsx
│   │   └── forgotPassword.tsx
│   ├── (app)/                    # Main app routes
│   │   ├── (admin)/              # Admin routes
│   │   │   ├── index.tsx
│   │   │   ├── users.tsx
│   │   │   ├── leagues.tsx
│   │   │   └── competitions.tsx
│   │   ├── (member)/             # Member routes
│   │   │   ├── (tabs)/
│   │   │   │   ├── League.tsx
│   │   │   │   ├── Matches.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   └── Stats.tsx
│   │   │   └── match/[id].tsx
│   │   └── (public)/             # Public routes
│   │       ├── myLeagues/
│   │       ├── settings/
│   │       └── subscription/
│   └── index.tsx                 # Root entry
│
├── features/                     # 🎯 FEATURE-BASED MODULES
│   │
│   ├── auth/                     # 🔐 Authentication Feature
│   │   ├── components/
│   │   │   └── GoogleAuth.tsx
│   │   ├── hooks/
│   │   │   ├── useCurrentSession.ts
│   │   │   └── useImagePickerPermissions.ts
│   │   └── queries/
│   │       └── useAuth.ts
│   │
│   ├── matches/                  # ⚽ Matches Feature
│   │   ├── components/
│   │   │   ├── match/
│   │   │   │   ├── FinishedMatch.tsx
│   │   │   │   ├── MatchContent.tsx
│   │   │   │   └── TeamDisplay.tsx
│   │   │   ├── matches/
│   │   │   │   ├── MatchCard.tsx
│   │   │   │   ├── MatchesList.tsx
│   │   │   │   ├── FixturesList.tsx
│   │   │   │   └── MatchHeader.tsx
│   │   │   ├── FixturesSkeleton.tsx
│   │   │   └── MatchesSkeleton.tsx
│   │   ├── hooks/
│   │   │   └── useMatches.ts
│   │   └── queries/
│   │       └── matchesService.ts
│   │
│   ├── leagues/                  # 🏆 Leagues Feature
│   │   ├── components/
│   │   │   ├── TopThree.tsx
│   │   │   └── LeagueSkeleton.tsx
│   │   ├── hooks/
│   │   │   └── useLeagues.ts
│   │   └── queries/
│   │       └── leagueService.ts
│   │
│   ├── members/                  # 👤 Members Feature
│   │   ├── components/
│   │   │   └── profile/
│   │   │       ├── AvatarSection.tsx
│   │   │       ├── NicknameSection.tsx
│   │   │       ├── LeagueDetailsSection.tsx
│   │   │       └── ProfileSkeleton.tsx
│   │   ├── hooks/
│   │   │   └── useMembers.ts
│   │   └── queries/
│   │       └── membersService.ts
│   │
│   ├── predictions/              # 🔮 Predictions Feature
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── usePredictions.ts
│   │   └── queries/
│   │       ├── predictionService.ts
│   │       └── autoPredictionService.ts
│   │
│   ├── stats/                    # 📊 Statistics Feature
│   │   ├── components/
│   │   │   └── stats/
│   │   │       ├── PredictionChart.tsx
│   │   │       ├── StatsCard.tsx
│   │   │       └── SkeletonStats.tsx
│   │   ├── hooks/
│   │   └── queries/
│   │
│   ├── admin/                    # 🛡️ Admin Feature
│   │   ├── components/
│   │   ├── hooks/
│   │   │   ├── useAdmin.ts
│   │   │   └── useUsers.ts
│   │   └── queries/
│   │       ├── adminService.ts
│   │       ├── usersService.ts
│   │       └── competitionService.ts
│   │
│   ├── subscription/             # 💳 Subscription Feature
│   │   ├── components/
│   │   │   └── subscription/
│   │   │       ├── SubscriptionCard.tsx
│   │   │       ├── SubscriptionFeatures.tsx
│   │   │       └── SubscriptionStatus.tsx
│   │   ├── hooks/
│   │   │   └── useSubscription.ts
│   │   └── queries/
│   │       └── subscriptionService.ts
│   │
│   └── settings/                 # ⚙️ Settings Feature
│       ├── components/
│       │   ├── ThemeToggle.tsx
│       │   ├── LanguageToggle.tsx
│       │   └── Settings/
│       │       └── SettingsContent.tsx
│       ├── hooks/
│       │   ├── useThemeTokens.ts
│       │   └── useTranslation.ts
│       └── queries/
│
├── components/                   # 🔧 SHARED COMPONENTS
│   ├── layout/                   # Layout components
│   │   ├── BottomTabs.tsx
│   │   ├── Error.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingOverlay.tsx
│   │   ├── NetworkStatusBanner.tsx
│   │   ├── Screen.tsx
│   │   ├── SplashScreen.tsx
│   │   ├── Stack.tsx
│   │   └── TabsHeader.tsx
│   └── ui/                       # UI primitives
│       ├── AvatarImage.tsx
│       ├── BackButton.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── InputField.tsx
│       └── MyImage.tsx
│
├── hooks/                        # 🔗 SHARED HOOKS
│   ├── useNetworkStatus.ts
│   └── useSupabaseImages.ts
│
├── lib/                          # 📚 SHARED LIBRARIES
│   ├── i18n/                     # Internationalization
│   ├── nativewind/               # Styling utilities
│   ├── tanstack/                 # Query keys
│   └── supabase.ts               # Supabase client
│
├── store/                        # 🗄️ STATE MANAGEMENT
│   ├── LanguageStore.ts
│   ├── MemberStore.ts
│   ├── ThemeStore.ts
│   └── store.ts
│
├── types/                        # 📝 TYPE DEFINITIONS
│   ├── database.types.ts
│   └── index.ts
│
└── utils/                        # 🛠️ UTILITY FUNCTIONS
    ├── formats.ts
    ├── matchHelper.ts
    ├── subscriptionPlans.ts
    └── downloadAndPrefetchAvatars.ts
```

## Architecture Principles

### 🎯 Feature-Based Organization

Each feature is self-contained with:

- **components/** - Feature-specific UI components
- **hooks/** - Feature-specific React hooks
- **queries/** - Feature-specific data fetching (services)

### 🔧 Shared Resources

- **components/layout** - App-wide layout components
- **components/ui** - Reusable UI primitives
- **hooks/** - Shared hooks used across features
- **lib/** - Shared libraries and configurations
- **store/** - Global state management
- **types/** - TypeScript type definitions
- **utils/** - Utility functions

### 📦 Benefits

1. **Scalability** - Easy to add new features
2. **Maintainability** - Related code is grouped together
3. **Clarity** - Clear separation of concerns
4. **Reusability** - Shared components remain accessible
5. **Team Collaboration** - Teams can work on features independently

## Import Patterns

### Feature Imports

```typescript
// From another feature
import { useMatches } from '@/features/matches/hooks/useMatches';
import { MatchCard } from '@/features/matches/components/matches/MatchCard';

// Within same feature (relative)
import { matchesService } from '../queries/matchesService';
```

### Shared Imports

```typescript
// Shared components
import { Button } from '@/components/ui';
import { LoadingOverlay } from '@/components/layout';

// Shared hooks
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// Shared utilities
import { formatDate } from '@/utils/formats';
```
