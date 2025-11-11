-- ============================================================================
-- ROW LEVEL SECURITY POLICIES FOR LEAGUE APP
-- ============================================================================
-- This file sets up RLS policies for all tables with admin bypass
-- Admin users (role='ADMIN') have full read/write/update/delete access to all tables
-- Regular users have restricted access based on league membership
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user is member of a specific league
CREATE OR REPLACE FUNCTION public.is_league_member(league_id_param uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.league_members
    WHERE user_id = auth.uid() AND league_id = league_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Check if user owns a league
CREATE OR REPLACE FUNCTION public.is_league_owner(league_id_param uuid)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leagues
    WHERE id = league_id_param AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Admins can do everything on users
CREATE POLICY "Admin: Full access to users"
  ON public.users FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read their own profile
CREATE POLICY "Users: Read own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users: Update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow users to insert their own record (for new signups)
CREATE POLICY "Users: Insert own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================================================
-- LEAGUES TABLE POLICIES
-- ============================================================================

-- Admins can do everything on leagues
CREATE POLICY "Admin: Full access to leagues"
  ON public.leagues FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- League members can read leagues they belong to
CREATE POLICY "Users: Read leagues they're members of"
  ON public.leagues FOR SELECT
  TO authenticated
  USING (
    public.is_league_member(id)
  );

-- Users can create new leagues
CREATE POLICY "Users: Create leagues"
  ON public.leagues FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- League owners can update their leagues
CREATE POLICY "Users: Update own leagues"
  ON public.leagues FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- League owners can delete their leagues
CREATE POLICY "Users: Delete own leagues"
  ON public.leagues FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================================
-- PREDICTIONS TABLE POLICIES
-- ============================================================================

-- Admins can do everything on predictions
CREATE POLICY "Admin: Full access to predictions"
  ON public.predictions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- League members can read predictions in their leagues
CREATE POLICY "Users: Read predictions in their leagues"
  ON public.predictions FOR SELECT
  TO authenticated
  USING (
    public.is_league_member(league_id)
  );

-- Users can create their own predictions
CREATE POLICY "Users: Create own predictions"
  ON public.predictions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own predictions (before match starts)
CREATE POLICY "Users: Update own predictions"
  ON public.predictions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own predictions
CREATE POLICY "Users: Delete own predictions"
  ON public.predictions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- LEAGUE_MEMBERS TABLE POLICIES
-- ============================================================================

-- Admins can do everything on league_members
CREATE POLICY "Admin: Full access to league_members"
  ON public.league_members FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read their own league memberships
CREATE POLICY "Users: Read own league memberships"
  ON public.league_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can update their own league memberships (e.g., set is_primary)
CREATE POLICY "Users: Update own league memberships"
  ON public.league_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- SUBSCRIPTION TABLE POLICIES
-- ============================================================================

-- Admins can do everything on subscriptions
CREATE POLICY "Admin: Full access to subscriptions"
  ON public.subscription FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read their own subscription
CREATE POLICY "Users: Read own subscription"
  ON public.subscription FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create their own subscription
CREATE POLICY "Users: Create own subscription"
  ON public.subscription FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own subscription
CREATE POLICY "Users: Update own subscription"
  ON public.subscription FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- COMPETITIONS TABLE POLICIES
-- ============================================================================

-- Admins can do everything on competitions
CREATE POLICY "Admin: Full access to competitions"
  ON public.competitions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- All authenticated users can read competitions
CREATE POLICY "Users: Read all competitions"
  ON public.competitions FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- MATCHES TABLE POLICIES
-- ============================================================================

-- Admins can do everything on matches
CREATE POLICY "Admin: Full access to matches"
  ON public.matches FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- All authenticated users can read matches
CREATE POLICY "Users: Read all matches"
  ON public.matches FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- TEAMS TABLE POLICIES
-- ============================================================================

-- Admins can do everything on teams
CREATE POLICY "Admin: Full access to teams"
  ON public.teams FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- All authenticated users can read teams
CREATE POLICY "Users: Read all teams"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on helper functions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_league_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_league_owner(uuid) TO authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION public.is_admin() IS 'Check if the current user has ADMIN role';
COMMENT ON FUNCTION public.is_league_member(uuid) IS 'Check if the current user is a member of the specified league';
COMMENT ON FUNCTION public.is_league_owner(uuid) IS 'Check if the current user owns the specified league';

