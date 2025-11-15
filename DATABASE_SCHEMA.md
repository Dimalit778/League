# Supabase Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐
│      users          │
├─────────────────────┤
│ PK id (uuid)        │◄─────┐
│    email            │      │
│    full_name        │      │
│    provider         │      │
│    role             │      │
│    created_at       │      │
│    updated_at       │      │
└─────────────────────┘      │
         │                    │
         │                    │
         │ 1:N                │ 1:N
         │                    │
         ▼                    │
┌─────────────────────┐       │
│  league_members     │       │
├─────────────────────┤       │
│ PK id (uuid)        │       │
│ FK user_id ─────────┼───────┘
│ FK league_id ───────┼──┐
│    nickname         │  │
│    avatar_url        │  │
│    is_primary       │  │
│    created_at        │  │
│    updated_at        │  │
└─────────────────────┘  │
         │                │
         │ N:1            │ N:1
         │                │
         │                ▼
         │         ┌─────────────────────┐
         │         │      leagues         │
         │         ├─────────────────────┤
         │         │ PK id (uuid)        │
         │         │ FK owner_id ────────┼──┐
         │         │ FK competition_id ───┼──┼──┐
         │         │    name              │  │  │
         │         │    join_code        │  │  │
         │         │    max_members      │  │  │
         │         │    created_at       │  │  │
         │         │    updated_at       │  │  │
         │         └─────────────────────┘  │  │
         │                │                 │  │
         │                │ N:1             │  │
         │                │                 │  │
         │                ▼                 │  │
         │         ┌─────────────────────┐  │  │
         │         │   competitions      │  │  │
         │         ├─────────────────────┤  │  │
         │         │ PK id (int)         │◄─┘  │
         │         │    name            │     │
         │         │    code            │     │
         │         │    logo            │     │
         │         │    flag            │     │
         │         │    area            │     │
         │         │    type            │     │
         │         │    current_fixture │     │
         │         │    total_fixtures  │     │
         │         │    season_start    │     │
         │         │    season_end      │     │
         │         │    created_at      │     │
         │         │    updated_at      │     │
         │         └─────────────────────┘     │
         │                │                    │
         │                │ 1:N               │
         │                │                    │
         │                ▼                    │
         │         ┌─────────────────────┐    │
         │         │      matches        │    │
         │         ├─────────────────────┤    │
         │         │ PK id (int)         │    │
         │         │ FK competition_id ──┼────┘
         │         │ FK home_team_id ────┼──┐
         │         │ FK away_team_id ────┼──┼──┐
         │         │    fixture          │  │  │
         │         │    kick_off         │  │  │
         │         │    status           │  │  │
         │         │    score (json)      │  │  │
         │         │    stage            │  │  │
         │         │    group            │  │  │
         │         │    referee          │  │  │
         │         │    created_at       │  │  │
         │         │    updated_at       │  │  │
         │         └─────────────────────┘  │  │
         │                │                 │  │
         │                │ 1:N             │  │
         │                │                 │  │
         │                ▼                 │  │
         │         ┌─────────────────────┐ │  │
         │         │   predictions       │ │  │
         │         ├─────────────────────┤ │  │
         │         │ PK id (uuid)        │ │  │
         │         │ FK match_id ────────┼─┘  │
         │         │ FK league_id ───────┼────┘
         │         │ FK league_member_id ┼────┐
         │         │ FK user_id ─────────┼────┼──┐
         │         │    home_score       │    │  │
         │         │    away_score        │    │  │
         │         │    points            │    │  │
         │         │    is_finished       │    │  │
         │         │    created_at        │    │  │
         │         │    updated_at        │    │  │
         │         └─────────────────────┘    │  │
         │                                    │  │
         │                                    │  │
         │                                    │  │
         │         ┌─────────────────────┐    │  │
         │         │      teams         │    │  │
         │         ├─────────────────────┤    │  │
         │         │ PK id (int)         │◄───┘  │
         │         │    name            │       │
         │         │    shortName        │       │
         │         │    tla              │       │
         │         │    logo             │       │
         │         │    venue            │       │
         │         │    created_at       │       │
         │         │    updated_at       │       │
         │         └─────────────────────┘       │
         │                                       │
         │                                       │
         │         ┌─────────────────────┐       │
         │         │   subscription      │       │
         │         ├─────────────────────┤       │
         │         │ PK id (uuid)        │       │
         │         │ FK user_id ─────────┼───────┘
         │         │    subscription_type│
         │         │    start_date       │
         │         │    end_date         │
         │         │    access_advanced_ │
         │         │      stats          │
         │         │    can_add_members  │
         │         │    created_at       │
         │         │    updated_at       │
         │         └─────────────────────┘
```

## Tables Overview

### 1. **users** (Core User Table)

- **Primary Key**: `id` (uuid)
- **Fields**: email, full_name, provider, role, timestamps
- **Relationships**:
  - One-to-Many → `league_members` (user_id)
  - One-to-Many → `leagues` (owner_id)
  - One-to-Many → `predictions` (user_id)
  - One-to-Many → `subscription` (user_id)

### 2. **competitions** (Football Competitions)

- **Primary Key**: `id` (integer)
- **Fields**: name, code, logo, flag, area, type, season info, fixture info
- **Relationships**:
  - One-to-Many → `leagues` (competition_id)
  - One-to-Many → `matches` (competition_id)

### 3. **leagues** (User-Created Leagues)

- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `owner_id` → users.id
  - `competition_id` → competitions.id
- **Fields**: name, join_code, max_members, timestamps
- **Relationships**:
  - Many-to-One → `users` (owner)
  - Many-to-One → `competitions`
  - One-to-Many → `league_members` (league_id)
  - One-to-Many → `predictions` (league_id)

### 4. **league_members** (Junction Table: Users ↔ Leagues)

- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `user_id` → users.id
  - `league_id` → leagues.id
- **Fields**: nickname, avatar_url, is_primary, timestamps
- **Relationships**:
  - Many-to-One → `users`
  - Many-to-One → `leagues`
  - One-to-Many → `predictions` (league_member_id)

### 5. **teams** (Football Teams)

- **Primary Key**: `id` (integer)
- **Fields**: name, shortName, tla, logo, venue, timestamps
- **Relationships**:
  - One-to-Many → `matches` (home_team_id, away_team_id)

### 6. **matches** (Football Matches/Fixtures)

- **Primary Key**: `id` (integer)
- **Foreign Keys**:
  - `competition_id` → competitions.id
  - `home_team_id` → teams.id
  - `away_team_id` → teams.id
- **Fields**: fixture, kick_off, status, score (json), stage, group, referee, timestamps
- **Relationships**:
  - Many-to-One → `competitions`
  - Many-to-One → `teams` (home team)
  - Many-to-One → `teams` (away team)
  - One-to-Many → `predictions` (match_id)

### 7. **predictions** (User Predictions for Matches)

- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `match_id` → matches.id
  - `league_id` → leagues.id
  - `league_member_id` → league_members.id
  - `user_id` → users.id
- **Fields**: home_score, away_score, points, is_finished, timestamps
- **Relationships**:
  - Many-to-One → `matches`
  - Many-to-One → `leagues`
  - Many-to-One → `league_members`
  - Many-to-One → `users`

### 8. **subscription** (User Subscriptions)

- **Primary Key**: `id` (uuid)
- **Foreign Keys**:
  - `user_id` → users.id
- **Fields**: subscription_type (enum: FREE/BASIC/PREMIUM), start_date, end_date, access flags, timestamps
- **Relationships**:
  - Many-to-One → `users`

## Views

### **league_leaderboard_view** (Materialized View)

- Aggregates prediction data for leaderboard display
- **Fields**: member_id, league_id, user_id, nickname, avatar_url, total_points, predictions_count
- **Relationships**: References `league_members` and `users`

## Key Relationships Summary

```
users
 ├── owns → leagues (1:N via owner_id)
 ├── member of → leagues (N:M via league_members)
 ├── makes → predictions (1:N via user_id)
 └── has → subscription (1:N via user_id)

leagues
 ├── belongs to → competitions (N:1 via competition_id)
 ├── has → league_members (1:N via league_id)
 └── contains → predictions (1:N via league_id)

matches
 ├── belongs to → competitions (N:1 via competition_id)
 ├── has → home_team (N:1 via home_team_id)
 ├── has → away_team (N:1 via away_team_id)
 └── has → predictions (1:N via match_id)

predictions
 ├── for → matches (N:1 via match_id)
 ├── in → leagues (N:1 via league_id)
 ├── by → league_members (N:1 via league_member_id)
 └── by → users (N:1 via user_id)
```

## Database Functions

1. **is_admin()** - Checks if current user has ADMIN role
2. **is_member_in_league(\_league, \_user)** - Checks league membership
3. **can_access_league(league_id)** - Checks league access permissions
4. **create_new_league()** - Creates league with owner as first member
5. **join_league()** - Adds user to league with nickname
6. **leave_league()** - Removes user from league
7. **rls_storage_is_league_member()** - RLS helper for storage
8. **rls_storage_is_member_owner()** - RLS helper for storage ownership

## Enums

- **subscription_type**: `FREE` | `BASIC` | `PREMIUM`

## Security (RLS)

All tables have Row Level Security (RLS) enabled:

- **Admin users** (`role='ADMIN'`) have full access to all tables
- **Regular users** have restricted access based on:
  - League membership
  - League ownership
  - User ownership (for own data)
