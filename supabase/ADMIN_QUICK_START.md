# Admin Access Quick Start Guide

## Problem Summary

You're seeing `adminData----> undefined` and empty arrays because:

1. ✅ Your user has `role='ADMIN'` in the database
2. ❌ No Row Level Security (RLS) policies are configured
3. ❌ Without RLS policies, even admins can't access data

## Quick Fix (3 Steps)

### Step 1: Apply RLS Policies

Go to your Supabase Dashboard → SQL Editor and run:

```sql
-- Copy and paste the entire contents of:
-- supabase/rls_policies.sql
```

Or from terminal:

```bash
supabase db execute --file supabase/rls_policies.sql
```

### Step 2: Verify Your Admin Status

In Supabase SQL Editor, run:

```sql
SELECT id, email, full_name, role
FROM public.users
WHERE email = 'dimalit778@gmail.com';
```

Should show `role: 'ADMIN'` ✅ (Already confirmed from your logs)

### Step 3: Test Admin Access

Restart your app and the admin dashboard should now load with data:

```
users 1
leagues 0
leagueMembers 0
predictions 0
subscriptions 0
```

## What Changed?

### Before (Current State)

```typescript
// Query fails silently - RLS blocks access
const { data, error } = await supabase.from('users').select('*');
console.log(data); // undefined or []
```

### After (With RLS Policies)

```typescript
// Admin user - full access granted
const { data, error } = await supabase.from('users').select('*');
console.log(data); // [{ id: "...", email: "...", role: "ADMIN" }]
```

## How Admin Access Works

The RLS policies include this check for ALL tables:

```sql
CREATE POLICY "Admin: Full access to [table]"
  ON public.[table] FOR ALL
  TO authenticated
  USING (public.is_admin())  -- ← Checks if user.role = 'ADMIN'
  WITH CHECK (public.is_admin());
```

The `is_admin()` function:

```sql
CREATE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
```

## Admin Privileges

Once the policies are applied, admin users can:

✅ **READ** all data from all tables  
✅ **INSERT** new records in any table  
✅ **UPDATE** any record in any table  
✅ **DELETE** any record from any table

Regular users get restricted access based on league membership.

## Verify Everything Works

Run this in Supabase SQL Editor:

```sql
-- Copy and paste the contents of:
-- supabase/verify_admin_setup.sql
```

This will show you:

- ✅ RLS status for all tables
- ✅ Helper functions existence
- ✅ All admin users
- ✅ Policy counts per table
- ✅ Your current admin status

## Troubleshooting

### Still seeing empty data?

1. **Clear app cache and restart**

   ```bash
   # If using Expo
   expo start --clear
   ```

2. **Check your Supabase session**

   ```typescript
   const {
     data: { session },
   } = await supabase.auth.getSession();
   console.log('Session:', session?.user?.id);
   // Should match your user ID
   ```

3. **Verify policies applied**
   - Go to Supabase Dashboard
   - Navigate to Authentication → Policies
   - You should see policies listed for each table

4. **Check for errors**
   ```typescript
   const { data, error } = await supabase.from('users').select('*');
   console.log('Error:', error);
   // Should be null for admins
   ```

### Error: "supabaseKey is required"

This appears in your logs at line 1011. This means environment variables might be missing:

1. **Check your .env file exists**

   ```bash
   ls -la .env
   ```

2. **If missing, create it from template**

   ```bash
   cp .env.example .env
   # Then edit .env with your actual Supabase credentials
   ```

3. **Verify environment variables are loaded**

   ```typescript
   console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
   console.log(
     'Key:',
     process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? '✅' : '❌'
   );
   ```

4. **Get your keys from Supabase**
   - Dashboard → Settings → API
   - Copy `URL` and `anon/public` key
   - Paste into `.env` file

## Next Actions

After applying RLS policies:

1. ✅ Test admin dashboard - should show data
2. ✅ Test regular user access - should be restricted
3. ⬜ Remove debug console.log statements
4. ⬜ Add error handling for permission denied
5. ⬜ Consider admin action logging

## Files Created

- `supabase/rls_policies.sql` - The RLS policies to apply
- `supabase/RLS_SETUP_README.md` - Comprehensive documentation
- `supabase/verify_admin_setup.sql` - Verification script
- `supabase/ADMIN_QUICK_START.md` - This file
- `.env.example` - Environment variables template

## Getting Help

If you still have issues after following this guide:

1. Run `supabase/verify_admin_setup.sql` and share the output
2. Check Supabase logs: Dashboard → Logs → API
3. Share any error messages from the app
4. Verify your user ID matches in both auth and users table
