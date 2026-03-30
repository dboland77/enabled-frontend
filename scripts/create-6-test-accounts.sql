-- ============================================================================
-- CREATE 6 TEST ACCOUNTS FOR USER TESTING
-- ============================================================================
--
-- STEP 1: Create users via Supabase Dashboard (Authentication > Users > Add user)
-- 
-- | # | Email                | Password           | Role     |
-- |---|----------------------|--------------------|----------|
-- | 1 | admin@test.com       | TestAdmin123!      | Admin    |
-- | 2 | approver1@test.com   | TestApprover123!   | Approver |
-- | 3 | approver2@test.com   | TestApprover123!   | Approver |
-- | 4 | manager@test.com     | TestManager123!    | Manager  |
-- | 5 | employee1@test.com   | TestEmployee123!   | Employee |
-- | 6 | employee2@test.com   | TestEmployee123!   | Employee |
--
-- STEP 2: After creating users in Supabase Auth, run this SQL script
-- ============================================================================

-- Ensure roles exist
INSERT INTO roles (id, role_name, role_description)
VALUES 
  (gen_random_uuid(), 'admin', 'Full system administrator with all permissions'),
  (gen_random_uuid(), 'approver', 'Can approve or decline adjustment requests'),
  (gen_random_uuid(), 'manager', 'Can manage team and view approvals'),
  (gen_random_uuid(), 'employee', 'Standard employee access')
ON CONFLICT (role_name) DO NOTHING;

-- Create user profiles for all 6 test accounts
DO $$
DECLARE
  admin_id UUID;
  approver1_id UUID;
  approver2_id UUID;
  manager_id UUID;
  employee1_id UUID;
  employee2_id UUID;
BEGIN
  -- Get user IDs by email
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@test.com';
  SELECT id INTO approver1_id FROM auth.users WHERE email = 'approver1@test.com';
  SELECT id INTO approver2_id FROM auth.users WHERE email = 'approver2@test.com';
  SELECT id INTO manager_id FROM auth.users WHERE email = 'manager@test.com';
  SELECT id INTO employee1_id FROM auth.users WHERE email = 'employee1@test.com';
  SELECT id INTO employee2_id FROM auth.users WHERE email = 'employee2@test.com';

  -- 1. ADMIN USER
  IF admin_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location, is_first_login)
    VALUES (admin_id, 'Alex', 'Admin', 'admin', 'admin@test.com', 'System Administrator', 'IT Services', 'Head Office', false)
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'admin', firstname = 'Alex', lastname = 'Admin', job_title = 'System Administrator', department = 'IT Services';
    RAISE NOTICE 'Created: admin@test.com (Admin)';
  ELSE
    RAISE NOTICE 'NOT FOUND: admin@test.com - Create this user in Supabase Auth first';
  END IF;

  -- 2. APPROVER 1 (HR)
  IF approver1_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location, is_first_login)
    VALUES (approver1_id, 'Sarah', 'HR', 'approver', 'approver1@test.com', 'HR Business Partner', 'Human Resources', 'Head Office', false)
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'approver', firstname = 'Sarah', lastname = 'HR', job_title = 'HR Business Partner', department = 'Human Resources';
    RAISE NOTICE 'Created: approver1@test.com (Approver - HR)';
  ELSE
    RAISE NOTICE 'NOT FOUND: approver1@test.com - Create this user in Supabase Auth first';
  END IF;

  -- 3. APPROVER 2 (Facilities)
  IF approver2_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location, is_first_login)
    VALUES (approver2_id, 'David', 'Facilities', 'approver', 'approver2@test.com', 'Facilities Manager', 'Facilities', 'Head Office', false)
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'approver', firstname = 'David', lastname = 'Facilities', job_title = 'Facilities Manager', department = 'Facilities';
    RAISE NOTICE 'Created: approver2@test.com (Approver - Facilities)';
  ELSE
    RAISE NOTICE 'NOT FOUND: approver2@test.com - Create this user in Supabase Auth first';
  END IF;

  -- 4. MANAGER
  IF manager_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location, is_first_login)
    VALUES (manager_id, 'Mike', 'Manager', 'manager', 'manager@test.com', 'Team Lead', 'Engineering', 'Branch Office', false)
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'manager', firstname = 'Mike', lastname = 'Manager', job_title = 'Team Lead', department = 'Engineering';
    RAISE NOTICE 'Created: manager@test.com (Manager)';
  ELSE
    RAISE NOTICE 'NOT FOUND: manager@test.com - Create this user in Supabase Auth first';
  END IF;

  -- 5. EMPLOYEE 1 (Experienced user with disabilities)
  IF employee1_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location, is_first_login)
    VALUES (employee1_id, 'Emma', 'Wilson', 'employee', 'employee1@test.com', 'Software Developer', 'Engineering', 'Remote', false)
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'employee', firstname = 'Emma', lastname = 'Wilson', job_title = 'Software Developer', department = 'Engineering';
    RAISE NOTICE 'Created: employee1@test.com (Employee - Experienced)';
  ELSE
    RAISE NOTICE 'NOT FOUND: employee1@test.com - Create this user in Supabase Auth first';
  END IF;

  -- 6. EMPLOYEE 2 (New user - first time flow)
  IF employee2_id IS NOT NULL THEN
    INSERT INTO user_profile ("userId", firstname, lastname, role, email, job_title, department, location, is_first_login)
    VALUES (employee2_id, 'James', 'New', 'employee', 'employee2@test.com', 'Customer Service Rep', 'Support', 'Head Office', true)
    ON CONFLICT ("userId") DO UPDATE SET
      role = 'employee', firstname = 'James', lastname = 'New', job_title = 'Customer Service Rep', department = 'Support', is_first_login = true;
    RAISE NOTICE 'Created: employee2@test.com (Employee - New User)';
  ELSE
    RAISE NOTICE 'NOT FOUND: employee2@test.com - Create this user in Supabase Auth first';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION: View all test accounts
-- ============================================================================
SELECT 
  au.email,
  up.firstname || ' ' || up.lastname AS full_name,
  up.role,
  up.job_title,
  up.department,
  up.is_first_login,
  au.created_at
FROM auth.users au
LEFT JOIN user_profile up ON au.id = up."userId"
WHERE au.email LIKE '%@test.com'
ORDER BY 
  CASE up.role 
    WHEN 'admin' THEN 1 
    WHEN 'approver' THEN 2 
    WHEN 'manager' THEN 3 
    WHEN 'employee' THEN 4 
  END,
  au.email;

-- ============================================================================
-- TEST ACCOUNT SUMMARY
-- ============================================================================
-- 
-- | Email                | Password           | Role     | Testing Purpose                    |
-- |----------------------|--------------------|----------|------------------------------------|
-- | admin@test.com       | TestAdmin123!      | Admin    | User management, system settings   |
-- | approver1@test.com   | TestApprover123!   | Approver | Approve requests (HR perspective)  |
-- | approver2@test.com   | TestApprover123!   | Approver | Approve requests (Facilities)      |
-- | manager@test.com     | TestManager123!    | Manager  | Team view, approval workflow       |
-- | employee1@test.com   | TestEmployee123!   | Employee | Submit requests, use wizard        |
-- | employee2@test.com   | TestEmployee123!   | Employee | First-time user onboarding flow    |
--
-- ============================================================================

-- ============================================================================
-- STEP 3: UPDATE APPROVERS LIST IN CODE (IMPORTANT!)
-- ============================================================================
--
-- After running this script, you MUST update the MOCK_APPROVERS in the code
-- with the actual Supabase user UUIDs for requests to route correctly.
--
-- 1. Run this query to get the UUIDs:
--
SELECT id, email FROM auth.users WHERE email IN ('admin@test.com', 'approver1@test.com', 'approver2@test.com', 'manager@test.com');
--
-- 2. Copy the UUIDs and update src/types/user.ts:
--    Replace 'REPLACE_WITH_ADMIN_UUID' with the actual UUID for admin@test.com
--    Replace 'REPLACE_WITH_APPROVER1_UUID' with the actual UUID for approver1@test.com
--    Replace 'REPLACE_WITH_APPROVER2_UUID' with the actual UUID for approver2@test.com
--    Replace 'REPLACE_WITH_MANAGER_UUID' with the actual UUID for manager@test.com
--
-- Without this step, employee requests will NOT be routed to test approvers!
-- ============================================================================
