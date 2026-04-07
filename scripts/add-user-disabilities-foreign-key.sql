-- =============================================================================
-- Add Foreign Key Constraint: user_disabilities -> disability_index
-- =============================================================================
-- This script adds the missing foreign key relationship that allows Supabase
-- PostgREST to use join syntax like:
--   .select('id, disability_id, disability_index(disability_name)')
-- 
-- Without this FK, you must manually fetch and merge the data in two queries.
-- =============================================================================

-- First, check if the foreign key already exists and drop it if needed
-- (This makes the script idempotent - safe to run multiple times)
ALTER TABLE user_disabilities 
DROP CONSTRAINT IF EXISTS user_disabilities_disability_id_fkey;

-- Add the foreign key constraint
-- This assumes:
--   - user_disabilities.disability_id references disability_index.id
--   - Both columns are UUID type
ALTER TABLE user_disabilities
ADD CONSTRAINT user_disabilities_disability_id_fkey
FOREIGN KEY (disability_id) 
REFERENCES disability_index(id)
ON DELETE CASCADE;

-- Verify the constraint was added
-- You can run this query in Supabase SQL editor to confirm:
-- SELECT conname, conrelid::regclass, confrelid::regclass 
-- FROM pg_constraint 
-- WHERE conname = 'user_disabilities_disability_id_fkey';

-- =============================================================================
-- OPTIONAL: If you have orphaned records (disability_id values that don't 
-- exist in disability_index), the FK constraint will fail. 
-- Uncomment and run this FIRST to find/fix orphans:
-- =============================================================================

-- Find orphaned records:
-- SELECT ud.* FROM user_disabilities ud
-- LEFT JOIN disability_index di ON ud.disability_id = di.id
-- WHERE di.id IS NULL;

-- Delete orphaned records (if any):
-- DELETE FROM user_disabilities 
-- WHERE disability_id NOT IN (SELECT id FROM disability_index);

-- =============================================================================
-- Also add FK for user_id -> auth.users if missing
-- =============================================================================
ALTER TABLE user_disabilities 
DROP CONSTRAINT IF EXISTS user_disabilities_user_id_fkey;

ALTER TABLE user_disabilities
ADD CONSTRAINT user_disabilities_user_id_fkey
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- =============================================================================
-- Success! After running this script, the join syntax will work:
--   supabase.from('user_disabilities').select(`
--     id,
--     disability_id,
--     disability_index (
--       disability_name,
--       disability_nhs_slug
--     )
--   `)
-- =============================================================================
