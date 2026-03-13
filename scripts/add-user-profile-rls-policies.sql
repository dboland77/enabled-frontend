-- Add Row Level Security policies for user_profile table
-- Run this script in your Supabase SQL Editor

-- Step 1: GRANT base table permissions to authenticated users
-- This is REQUIRED - RLS policies control WHICH rows, but GRANT controls WHETHER access is allowed
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profile TO anon;

-- Step 2: Enable RLS on the table (if not already enabled)
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profile;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profile;

-- Step 4: Create RLS policies

-- Policy: Allow users to SELECT their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profile
FOR SELECT
USING (auth.uid() = "userId");

-- Policy: Allow users to UPDATE their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profile
FOR UPDATE
USING (auth.uid() = "userId")
WITH CHECK (auth.uid() = "userId");

-- Policy: Allow users to INSERT their own profile (for new users)
CREATE POLICY "Users can insert their own profile"
ON public.user_profile
FOR INSERT
WITH CHECK (auth.uid() = "userId");
