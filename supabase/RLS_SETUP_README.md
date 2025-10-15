# Row Level Security (RLS) Setup Guide

## Overview

This guide explains how to set up Row Level Security policies for your Supabase database, with special admin bypass functionality.

## What This Fixes

- **Admin users** (users with `role='ADMIN'`) get full read/write/update/delete access to ALL tables
- **Regular users** get appropriate access based on league membership and ownership
- Fixes the issue where data cannot be queried due to missing RLS policies

## Current Issue

The error logs show `adminData----> undefined` because:

1. RLS is enabled on tables (or will be)
2. No policies exist to grant access
3. Even with the anon key, without policies, no data is returned

## How to Apply the Policies

### Option 1: Using Supabase Dashboard (Recommended for Production)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/rls_policies.sql`
4. Paste into the SQL Editor
5. Click **Run**

### Option 2: Using Supabase CLI (For Local Development)

```bash
# Make sure you're in the project root
cd /Users/dimalitvinov/Projects/league

# Apply the migration
supabase db reset  # This will reset and apply all migrations

# OR apply directly
supabase db execute --file supabase/rls_policies.sql
```

### Option 3: Manual Copy to Migrations Folder

If you're using Supabase migrations:

```bash
# Copy the policies file to migrations
cp supabase/rls_policies.sql supabase/migrations/$(date +%Y%m%d%H%M%S)_setup_rls_policies.sql

# Push to production
supabase db push
```

## How It Works

### Admin Access

- All policies check `public.is_admin()` function first
- If user has `role='ADMIN'` in the `users` table, they bypass all restrictions
- Admins can SELECT, INSERT, UPDATE, DELETE on ALL tables

### Regular User Access

#### Users Table

- Read their own profile
- Update their own profile
- Cannot see other users (unless admin)

#### Leagues Table

- Read leagues they're members of
- Create new leagues (as owner)
- Update/delete leagues they own

#### League Members Table

- Read members in their leagues
- Create their own membership (join league)
- Update their own membership
- Delete their own membership (leave league)
- League owners can remove members

#### Predictions Table

- Read predictions in leagues they're members of
- Create/update/delete their own predictions

#### Subscriptions Table

- Read/update their own subscription only

#### Competitions/Matches/Teams Tables

- All users can read (public data)
- Only admins can write

## Testing the Setup

### 1. Verify Your Admin User

Check that your user has the ADMIN role:

```sql
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'dimalit778@gmail.com';
```

Expected result:

```
role: 'ADMIN'
```

### 2. Test Admin Access

After applying the policies, test with your admin account:

```typescript
// This should now work in your adminService
const { data, error } = await supabase.from('users').select('*');

console.log('Users:', data); // Should show all users
console.log('Error:', error); // Should be null
```

### 3. Test Regular User Access

Create a test user without admin role and verify they can only see their own data:

```sql
-- Create test user
INSERT INTO public.users (id, email, full_name, role)
VALUES ('test-user-id', 'test@example.com', 'Test User', 'USER');
```

Then sign in as that user and try:

```typescript
const { data } = await supabase.from('users').select('*');
// Should only return the test user's own record
```

## Troubleshooting

### Issue: "adminData----> undefined" or empty arrays

**Cause:** RLS policies not applied yet, or policies not granting access

**Solution:**

1. Apply the `rls_policies.sql` file
2. Verify your user has `role='ADMIN'`
3. Check the `is_admin()` function is created

### Issue: "Error: supabaseKey is required"

**Cause:** Missing environment variables

**Solution:**
Check your environment variables are set:

```bash
# Create .env file if it doesn't exist
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
EOF
```

Make sure to replace with your actual Supabase credentials from the dashboard.

### Issue: Regular users can't read competitions/matches

**Cause:** Policies might be too restrictive

**Solution:**
The current policies allow all authenticated users to read competitions, matches, and teams. If this doesn't work:

1. Check the user is authenticated
2. Verify the session is valid
3. Check the JWT token is being sent with requests

## Security Considerations

### ✅ Good Practices (Implemented)

- Admin checks are done via database function (secure)
- Using `SECURITY DEFINER` for helper functions
- Separate policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- League membership is verified before data access

### ⚠️ Important Notes

1. **Admin privileges are permanent**: Once a user has `role='ADMIN'`, they have full access to everything
2. **Protect admin role assignment**: Make sure only you can set `role='ADMIN'` (not exposed in your app)
3. **Use service role key carefully**: If you need to bypass RLS entirely, use the service role key server-side only

## Alternative Approach: Admin-Only Client

For very sensitive admin operations, you can create a separate Supabase client with the service role key:

```typescript
// lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Add this to .env

// ⚠️ NEVER expose this client to the frontend
// Only use in secure backend contexts
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
```

**Important:** The service role key bypasses ALL RLS policies. Only use it:

- In backend/server code
- Never expose to the mobile app
- For bulk operations or admin-only actions

## Next Steps

1. ✅ Apply the RLS policies
2. ✅ Verify admin user role
3. ✅ Test admin access
4. ⬜ Remove console.log statements (see PRODUCTION_CHECKLIST.md)
5. ⬜ Add error handling for permission denied scenarios
6. ⬜ Consider implementing admin action logging

## Helper SQL Queries

### Make a user an admin

```sql
UPDATE public.users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

### Remove admin access

```sql
UPDATE public.users
SET role = 'USER'
WHERE email = 'email@example.com';
```

### Check all admins

```sql
SELECT id, email, full_name, role, created_at
FROM public.users
WHERE role = 'ADMIN';
```

### View all policies on a table

```sql
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
```

### Drop all policies (if you need to start over)

```sql
DROP POLICY IF EXISTS "Admin: Full access to users" ON public.users;
DROP POLICY IF EXISTS "Users: Read own profile" ON public.users;
-- ... etc for each policy
```

## Support

If you encounter issues:

1. Check Supabase logs in the dashboard
2. Verify your JWT token is valid
3. Test with SQL editor in dashboard
4. Check the helper functions exist and are accessible
