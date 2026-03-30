-- ============================================================================
-- RESET TEST DATA SCRIPT
-- ============================================================================
-- This script clears all test data created by the 6 test accounts while
-- preserving the accounts themselves and reference data (disabilities, 
-- adjustments, roles, etc.)
--
-- Run this in Supabase SQL Editor after testing to reset for another round.
-- ============================================================================

-- Define test user emails
DO $$
DECLARE
  test_emails TEXT[] := ARRAY[
    'admin@test.com',
    'approver@test.com', 
    'approver2@test.com',
    'manager@test.com',
    'employee@test.com',
    'employee2@test.com'
  ];
  test_user_ids UUID[];
BEGIN
  -- Get all test user IDs
  SELECT ARRAY_AGG(id) INTO test_user_ids
  FROM auth.users
  WHERE email = ANY(test_emails);

  IF test_user_ids IS NULL OR array_length(test_user_ids, 1) IS NULL THEN
    RAISE NOTICE 'No test users found. Nothing to reset.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found % test user(s) to reset', array_length(test_user_ids, 1);

  -- 1. Delete adjustment request history (must be deleted before adjustment_requests due to FK)
  DELETE FROM adjustment_request_history
  WHERE request_id IN (
    SELECT id FROM adjustment_requests WHERE user_id = ANY(test_user_ids)
  );
  RAISE NOTICE 'Cleared adjustment request history';

  -- 2. Delete notifications for test users
  DELETE FROM notifications WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared notifications';

  -- 3. Delete adjustment requests by test users
  DELETE FROM adjustment_requests WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared adjustment requests';

  -- 4. Delete wizard sessions for test users
  DELETE FROM wizard_sessions WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared wizard sessions';

  -- 5. Delete user limitations for test users
  DELETE FROM user_limitations WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared user limitations';

  -- 6. Delete user disabilities for test users
  DELETE FROM user_disabilities WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared user disabilities';

  -- 7. Delete user adjustments for test users
  DELETE FROM user_adjustments WHERE user_id = ANY(test_user_ids);
  RAISE NOTICE 'Cleared user adjustments';

  -- 8. Reset user profile to initial state (keep profiles but reset first_login flag)
  UPDATE user_profile 
  SET 
    is_first_login = CASE 
      WHEN email = 'employee2@test.com' THEN true  -- Keep employee2 as new user
      ELSE false 
    END,
    photo_url = NULL
  WHERE "userId" = ANY(test_user_ids);
  RAISE NOTICE 'Reset user profiles';

  RAISE NOTICE '============================================';
  RAISE NOTICE 'TEST DATA RESET COMPLETE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Cleared: notifications, adjustment requests,';
  RAISE NOTICE 'wizard sessions, user limitations,';
  RAISE NOTICE 'user disabilities, user adjustments';
  RAISE NOTICE '';
  RAISE NOTICE 'Preserved: user accounts, profiles, roles,';
  RAISE NOTICE 'reference data (disabilities, adjustments)';
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- VERIFICATION: Show remaining test account status
-- ============================================================================
SELECT 
  au.email,
  up.firstname || ' ' || up.lastname AS full_name,
  up.role,
  up.is_first_login,
  (SELECT COUNT(*) FROM notifications n WHERE n.user_id = au.id) AS notifications,
  (SELECT COUNT(*) FROM adjustment_requests ar WHERE ar.user_id = au.id) AS requests,
  (SELECT COUNT(*) FROM wizard_sessions ws WHERE ws.user_id = au.id) AS wizard_sessions
FROM auth.users au
LEFT JOIN user_profile up ON au.id = up."userId"
WHERE au.email LIKE '%@test.com'
ORDER BY au.email;

-- ============================================================================
-- WHAT THIS SCRIPT CLEARS:
-- ============================================================================
-- - Notifications (all types including system notifications)
-- - Adjustment requests and their history
-- - Wizard sessions (progress data)
-- - User limitations ("I struggle with" entries)
-- - User disabilities (saved disability selections)
-- - User adjustments (saved adjustment selections)
-- - Profile photos (reset to null)
--
-- WHAT THIS SCRIPT PRESERVES:
-- - User accounts (auth.users)
-- - User profiles (user_profile table)
-- - Roles
-- - Reference data (disabilities, adjustments, limitation_categories, etc.)
-- ============================================================================
