-- =============================================================================
-- RLS POLICIES FOR USER_DISABILITIES TABLE
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================================

-- First, ensure RLS is enabled on the table
ALTER TABLE user_disabilities ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- DROP EXISTING POLICIES (if any) to avoid conflicts
-- =============================================================================

DROP POLICY IF EXISTS "Users can view their own disabilities" ON user_disabilities;
DROP POLICY IF EXISTS "Users can insert their own disabilities" ON user_disabilities;
DROP POLICY IF EXISTS "Users can delete their own disabilities" ON user_disabilities;
DROP POLICY IF EXISTS "Users can update their own disabilities" ON user_disabilities;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- Users can SELECT their own disabilities
CREATE POLICY "Users can view their own disabilities"
  ON user_disabilities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can INSERT their own disabilities
CREATE POLICY "Users can insert their own disabilities"
  ON user_disabilities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can DELETE their own disabilities
CREATE POLICY "Users can delete their own disabilities"
  ON user_disabilities
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can UPDATE their own disabilities (optional, but good to have)
CREATE POLICY "Users can update their own disabilities"
  ON user_disabilities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- ALSO ADD POLICIES FOR USER_ADJUSTMENTS IF MISSING
-- =============================================================================

-- Ensure RLS is enabled
ALTER TABLE user_adjustments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own adjustments" ON user_adjustments;
DROP POLICY IF EXISTS "Users can insert their own adjustments" ON user_adjustments;
DROP POLICY IF EXISTS "Users can delete their own adjustments" ON user_adjustments;
DROP POLICY IF EXISTS "Users can update their own adjustments" ON user_adjustments;

-- Users can SELECT their own adjustments
CREATE POLICY "Users can view their own adjustments"
  ON user_adjustments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can INSERT their own adjustments
CREATE POLICY "Users can insert their own adjustments"
  ON user_adjustments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can DELETE their own adjustments
CREATE POLICY "Users can delete their own adjustments"
  ON user_adjustments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Users can UPDATE their own adjustments
CREATE POLICY "Users can update their own adjustments"
  ON user_adjustments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- VERIFICATION QUERIES (optional - run these to check policies are applied)
-- =============================================================================

-- Check policies on user_disabilities:
-- SELECT * FROM pg_policies WHERE tablename = 'user_disabilities';

-- Check policies on user_adjustments:
-- SELECT * FROM pg_policies WHERE tablename = 'user_adjustments';
