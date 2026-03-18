-- Create adjustment_requests table for storing user adjustment requests
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)

CREATE TABLE IF NOT EXISTS adjustment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT,
  adjustment_type TEXT,
  work_function TEXT,
  location TEXT,
  required_date TIMESTAMPTZ,
  status TEXT DEFAULT 'NEW',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE adjustment_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own adjustment requests
CREATE POLICY "Users can view their own adjustment requests"
  ON adjustment_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own adjustment requests
CREATE POLICY "Users can insert their own adjustment requests"
  ON adjustment_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own adjustment requests
CREATE POLICY "Users can update their own adjustment requests"
  ON adjustment_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own adjustment requests
CREATE POLICY "Users can delete their own adjustment requests"
  ON adjustment_requests
  FOR DELETE
  USING (auth.uid() = user_id);
