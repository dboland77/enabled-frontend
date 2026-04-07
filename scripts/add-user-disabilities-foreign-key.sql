-- =============================================================================
-- Add Foreign Key Constraint: user_disabilities -> disabilities
-- =============================================================================
-- This script adds the missing foreign key relationship that allows Supabase
-- PostgREST to use join syntax like:
--   .select('id, disability_id, disabilities(disability_name)')
-- 
-- Without this FK, you must manually fetch and merge the data in two queries.
-- =============================================================================

-- First, clean up any orphaned records that would block the FK constraint
-- (disability_id values that don't exist in disabilities table)
DELETE FROM user_disabilities 
WHERE disability_id NOT IN (SELECT id FROM disabilities);

-- Drop existing FK constraint if it exists (makes script idempotent)
ALTER TABLE user_disabilities 
DROP CONSTRAINT IF EXISTS user_disabilities_disability_id_fkey;

-- Add the foreign key constraint to the disabilities table
ALTER TABLE user_disabilities
ADD CONSTRAINT user_disabilities_disability_id_fkey
FOREIGN KEY (disability_id) 
REFERENCES disabilities(id)
ON DELETE CASCADE;

-- Also add FK for user_id -> auth.users if missing
ALTER TABLE user_disabilities 
DROP CONSTRAINT IF EXISTS user_disabilities_user_id_fkey;

ALTER TABLE user_disabilities
ADD CONSTRAINT user_disabilities_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_disabilities_disability_id 
ON user_disabilities(disability_id);

CREATE INDEX IF NOT EXISTS idx_user_disabilities_user_id 
ON user_disabilities(user_id);

-- =============================================================================
-- Verify the constraints were added (optional - run to confirm)
-- =============================================================================
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'user_disabilities'
  AND tc.constraint_type = 'FOREIGN KEY';

-- =============================================================================
-- Success! After running this script, the join syntax will work:
--   supabase.from('user_disabilities').select(`
--     id,
--     disability_id,
--     disabilities (
--       disability_name,
--       disability_nhs_slug
--     )
--   `)
-- =============================================================================
