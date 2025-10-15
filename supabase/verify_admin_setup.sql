-- ============================================================================
-- ADMIN SETUP VERIFICATION SCRIPT
-- ============================================================================
-- Run this script in Supabase SQL Editor to verify your admin setup
-- ============================================================================

-- 1. Check if RLS is enabled on tables
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'leagues', 'league_members', 'predictions', 
    'subscription', 'competitions', 'matches', 'teams'
  )
ORDER BY tablename;

-- 2. Check if helper functions exist
SELECT 
  routine_name as function_name,
  routine_type,
  '✅ Exists' as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('is_admin', 'is_league_member', 'is_league_owner')
ORDER BY routine_name;

-- 3. List all admin users
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  CASE 
    WHEN role = 'ADMIN' THEN '✅ Admin'
    ELSE '👤 Regular User'
  END as user_type
FROM public.users
ORDER BY 
  CASE WHEN role = 'ADMIN' THEN 0 ELSE 1 END,
  created_at;

-- 4. Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Has Policies'
    ELSE '❌ No Policies'
  END as policy_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'leagues', 'league_members', 'predictions', 
    'subscription', 'competitions', 'matches', 'teams'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 5. List all policies (detailed)
SELECT 
  tablename,
  policyname as policy_name,
  cmd as operation,
  roles,
  CASE 
    WHEN policyname LIKE '%Admin%' THEN '🔑 Admin Policy'
    WHEN policyname LIKE '%Users%' THEN '👤 User Policy'
    ELSE '📜 Other Policy'
  END as policy_type
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'leagues', 'league_members', 'predictions', 
    'subscription', 'competitions', 'matches', 'teams'
  )
ORDER BY 
  tablename,
  CASE 
    WHEN policyname LIKE '%Admin%' THEN 0
    ELSE 1
  END,
  cmd;

-- 6. Test is_admin() function (run this while logged in as different users)
SELECT 
  auth.uid() as your_user_id,
  public.is_admin() as are_you_admin,
  CASE 
    WHEN public.is_admin() THEN '✅ You have admin access'
    ELSE '👤 You are a regular user'
  END as status;

-- 7. Check data counts (should be accessible if admin or policies are correct)
SELECT 
  'users' as table_name, 
  COUNT(*) as record_count,
  CASE WHEN COUNT(*) > 0 THEN '✅' ELSE '⚠️' END as status
FROM public.users
UNION ALL
SELECT 
  'leagues', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.leagues
UNION ALL
SELECT 
  'league_members', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.league_members
UNION ALL
SELECT 
  'predictions', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.predictions
UNION ALL
SELECT 
  'subscriptions', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.subscription
UNION ALL
SELECT 
  'competitions', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.competitions
UNION ALL
SELECT 
  'matches', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.matches
UNION ALL
SELECT 
  'teams', 
  COUNT(*),
  CASE WHEN COUNT(*) >= 0 THEN '✅' ELSE '⚠️' END
FROM public.teams;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- 
-- 1. RLS Status: All tables should show "✅ Enabled"
-- 2. Helper Functions: All 3 functions should exist
-- 3. Admin Users: At least one user with role='ADMIN'
-- 4. Policy Count: Each table should have multiple policies
-- 5. Policies List: Should see both Admin and User policies
-- 6. is_admin() Test: Should return true if you're an admin
-- 7. Data Counts: Should show counts without errors
-- 
-- ============================================================================

-- QUICK FIX: Make current user an admin (if needed)
-- Uncomment and update the email below:
-- UPDATE public.users 
-- SET role = 'ADMIN' 
-- WHERE email = 'your-email@example.com';

