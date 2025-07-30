# Supabase Database Schemas

This directory contains SQL schema definitions for the League application database. These schemas define the structure of the database tables, relationships, and security policies.

## Tables

1. **profiles** - User profiles linked to Supabase Auth
   - Contains user information like name, avatar, email
   - Linked to auth.users via foreign key

2. **leagues** - User-created leagues
   - Contains league information like name, owner, join code
   - Linked to auth.users for ownership

3. **league_members** - Junction table for users and leagues
   - Tracks which users belong to which leagues
   - Contains league_id, user_id, and joined_at timestamp

4. **competitions** - Football competitions data
   - Contains information about football leagues/competitions
   - Includes name, code, logo, dates, etc.

5. **teams** - Football teams data
   - Contains team information like name, short name, crest URL
   - Used in match relationships

6. **matches** - Football match data
   - Contains match details like teams, scores, dates
   - Linked to competitions and teams

## Schema Files

- **profile.sql** - Defines profiles table and RLS policies
- **leagues.sql** - Defines leagues table and RLS policies
- **league_members.sql** - Defines league_members junction table and RLS policies
- **competitions.sql** - Defines competitions table and RLS policies
- **teams.sql** - Defines teams table and RLS policies
- **matches.sql** - Defines matches table and RLS policies
- **functions.sql** - Defines database functions and triggers
- **indexes.sql** - Defines database indexes for better query performance
- **schema.sql** - Main schema file that includes all other schema files

## Row Level Security (RLS)

All tables have Row Level Security enabled with appropriate policies:

- Public read access for competitions, teams, and matches
- Authenticated user access for profiles, leagues, and league_members
- Owner-based write permissions for leagues
- Self-based write permissions for profiles and league memberships

## Functions

The database includes these helper functions:

1. **generate_league_join_code()** - Generates a unique 6-digit join code for leagues
2. **handle_new_user()** - Creates a profile entry when a new user signs up

## Usage

These schema files can be used to:

1. Initialize a new Supabase database
2. Understand the data model
3. Reference when making schema changes

To apply these schemas to your Supabase project, you can use the Supabase CLI or the Supabase dashboard SQL editor.
