-- ============================================================================
-- CREATE TEST APPROVER USERS FOR DEVELOPMENT
-- ============================================================================
-- 
-- IMPORTANT: Supabase Auth handles password hashing securely. You cannot insert
-- directly into auth.users with plain passwords. Instead, follow these steps:
--
-- OPTION 1: Create users via Supabase Dashboard (Recommended)
-- ------------------------------------------------------------
-- 1. Go to your Supabase Dashboard > Authentication > Users
-- 2. Click "Add user" > "Create new user"
-- 3. Create these test users:
--
--    Email: admin@test.com       Password: TestAdmin123!
--    Email: approver@test.com    Password: TestApprover123!
--    Email: manager@test.com     Password: TestManager123!
--    Email: employee@test.com    Password: TestEmployee123!
--
-- 4. After creating the users, run the SQL below to set up their profiles and roles
--
-- OPTION 2: Use Supabase Auth API (for programmatic creation)
-- ------------------------------------------------------------
-- Use the Supabase client with service_role key:
--
-- const { data, error } = await supabase.auth.admin.createUser({
--   email: 'admin@test.com',
--   password: 'TestAdmin123!',
--   email_confirm: true
-- });
--
-- ============================================================================

-- ============================================================================
-- STEP 1: Ensure the roles table has all required roles
-- ============================================================================

INSERT INTO roles (id, role_name, role_description)
VALUES 
  (gen_random_uuid(), 'admin', 'Full system administrator with all permissions'),
  (gen_random_uuid(), 'approver', 'Can approve or decline adjustment requests'),
  (gen_random_uuid(), 'manager', 'Can manage team and view approvals'),
  (gen_random_uuid(), 'employee', 'Standard employee access')
ON CONFLICT (role_name) DO NOTHING;

-- ============================================================================
-- STEP 2: After creating users in Supabase Auth, run this to set up profiles
-- ============================================================================
-- Replace the UUIDs below with the actual user IDs from auth.users after creation

-- First, check what users exist:
-- SELECT id, email FROM auth.users;

-- Then update this script with actual UUIDs and run:

DO $$
DECLARE
  admin_user_id UUID;
  approver_user_id UUID;
  manager_user_id UUID;
  employee_user_id UUID;
BEGIN
  -- Get user IDs by email (after you create them in Supabase Auth)
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@test.com';
  SELECT id INTO approver_user_id FROM auth.users WHERE email = 'approver@test.com';
  SELECT id INTO manager_user_id FROM auth.users WHERE email = 'manager@test.com';
  SELECT id INTO employee_user_id FROM auth.users WHERE email = 'employee@test.com';

  -- Create/Update admin profile
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location)
    VALUES (
      admin_user_id,
      'Admin',
      'User',
      'admin',
      'admin@test.com',
      'System Administrator',
      'IT',
      'Head Office'
    )
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'admin',
      firstname = COALESCE(EXCLUDED.firstname, user_profile.firstname),
      lastname = COALESCE(EXCLUDED.lastname, user_profile.lastname);
    
    RAISE NOTICE 'Admin profile created/updated for user %', admin_user_id;
  ELSE
    RAISE NOTICE 'Admin user (admin@test.com) not found in auth.users. Create it first.';
  END IF;

  -- Create/Update approver profile
  IF approver_user_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location)
    VALUES (
      approver_user_id,
      'Sarah',
      'Approver',
      'approver',
      'approver@test.com',
      'HR Manager',
      'Human Resources',
      'Head Office'
    )
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'approver',
      firstname = COALESCE(EXCLUDED.firstname, user_profile.firstname),
      lastname = COALESCE(EXCLUDED.lastname, user_profile.lastname);
    
    RAISE NOTICE 'Approver profile created/updated for user %', approver_user_id;
  ELSE
    RAISE NOTICE 'Approver user (approver@test.com) not found in auth.users. Create it first.';
  END IF;

  -- Create/Update manager profile
  IF manager_user_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location)
    VALUES (
      manager_user_id,
      'Mike',
      'Manager',
      'manager',
      'manager@test.com',
      'Department Manager',
      'Operations',
      'Branch Office'
    )
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'manager',
      firstname = COALESCE(EXCLUDED.firstname, user_profile.firstname),
      lastname = COALESCE(EXCLUDED.lastname, user_profile.lastname);
    
    RAISE NOTICE 'Manager profile created/updated for user %', manager_user_id;
  ELSE
    RAISE NOTICE 'Manager user (manager@test.com) not found in auth.users. Create it first.';
  END IF;

  -- Create/Update employee profile
  IF employee_user_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location)
    VALUES (
      employee_user_id,
      'John',
      'Employee',
      'employee',
      'employee@test.com',
      'Software Developer',
      'Engineering',
      'Remote'
    )
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'employee',
      firstname = COALESCE(EXCLUDED.firstname, user_profile.firstname),
      lastname = COALESCE(EXCLUDED.lastname, user_profile.lastname);
    
    RAISE NOTICE 'Employee profile created/updated for user %', employee_user_id;
  ELSE
    RAISE NOTICE 'Employee user (employee@test.com) not found in auth.users. Create it first.';
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Verify the setup
-- ============================================================================

-- View all users with their roles:
SELECT 
  au.id,
  au.email,
  au.created_at,
  up.firstname,
  up.lastname,
  up.role,
  up.job_title,
  up.department
FROM auth.users au
LEFT JOIN user_profile up ON au.id = up."userId"
ORDER BY up.role, au.email;

-- ============================================================================
-- STEP 4: Create sample adjustment requests for testing (optional)
-- ============================================================================
-- This creates test requests assigned to the approver for testing the workflow

DO $$
DECLARE
  employee_user_id UUID;
  approver_user_id UUID;
BEGIN
  SELECT id INTO employee_user_id FROM auth.users WHERE email = 'employee@test.com';
  SELECT id INTO approver_user_id FROM auth.users WHERE email = 'approver@test.com';

  IF employee_user_id IS NOT NULL AND approver_user_id IS NOT NULL THEN
    -- Sample NEW request
    INSERT INTO adjustment_requests (
      user_id, title, detail, adjustment_type, work_function, location, 
      required_date, status, approver_id, approver_name
    ) VALUES (
      employee_user_id,
      'Standing Desk Request',
      'I require a standing desk due to lower back issues. My physiotherapist has recommended alternating between sitting and standing throughout the day.',
      'Equipment',
      'Software Development',
      'Remote Office',
      NOW() + INTERVAL '14 days',
      'NEW',
      approver_user_id::text,
      'Sarah Approver'
    );

    -- Sample PENDING request
    INSERT INTO adjustment_requests (
      user_id, title, detail, adjustment_type, work_function, location, 
      required_date, status, approver_id, approver_name
    ) VALUES (
      employee_user_id,
      'Flexible Hours Adjustment',
      'Requesting flexible working hours (10am-6pm instead of 9am-5pm) to accommodate medical appointments in the morning.',
      'Schedule',
      'Software Development',
      'Remote Office',
      NOW() + INTERVAL '7 days',
      'PENDING',
      approver_user_id::text,
      'Sarah Approver'
    );

    -- Sample MORE_INFO request
    INSERT INTO adjustment_requests (
      user_id, title, detail, adjustment_type, work_function, location, 
      required_date, status, approver_id, approver_name, response_message
    ) VALUES (
      employee_user_id,
      'Screen Reader Software',
      'Need screen reader software for accessibility.',
      'Software',
      'Software Development',
      'Remote Office',
      NOW() + INTERVAL '21 days',
      'MORE_INFO',
      approver_user_id::text,
      'Sarah Approver',
      'Please provide more details about which screen reader software you need and any specific features required.'
    );

    RAISE NOTICE 'Sample adjustment requests created successfully';
  ELSE
    RAISE NOTICE 'Employee or Approver users not found. Create them first.';
  END IF;
END $$;

-- View all adjustment requests:
SELECT 
  ar.id,
  ar.title,
  ar.status,
  ar.adjustment_type,
  up.firstname || ' ' || up.lastname AS requester,
  ar.approver_name,
  ar.created_at
FROM adjustment_requests ar
LEFT JOIN user_profile up ON ar.user_id = up."userId"
ORDER BY ar.created_at DESC;
