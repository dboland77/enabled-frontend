-- Add Row Level Security policies for user_profile table
-- Run this script in your Supabase SQL Editor

-- Enable RLS on the table (if not already enabled)
ALTER TABLE public.user_profile ENABLE ROW LEVEL SECURITY;

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

-- Optional: If you want to allow users to delete their own profile
-- CREATE POLICY "Users can delete their own profile"
-- ON public.user_profile
-- FOR DELETE
-- USING (auth.uid() = "userId");
