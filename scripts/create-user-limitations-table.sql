-- Create user_limitations table for "I struggle with" passport section
-- This stores user-reported limitations that will appear in their accessibility passport

CREATE TABLE IF NOT EXISTS user_limitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_user_limitations_user_id ON user_limitations(user_id);

-- Enable RLS
ALTER TABLE user_limitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own limitations
CREATE POLICY "Users can view own limitations" ON user_limitations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own limitations
CREATE POLICY "Users can insert own limitations" ON user_limitations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own limitations
CREATE POLICY "Users can update own limitations" ON user_limitations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own limitations
CREATE POLICY "Users can delete own limitations" ON user_limitations
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_limitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_limitations_updated_at
  BEFORE UPDATE ON user_limitations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_limitations_updated_at();
