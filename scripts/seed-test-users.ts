#!/usr/bin/env npx tsx
/**
 * Seed test users for the Cypress E2E suite.
 *
 * Creates one user per role, their user_profile rows, the manager → employee
 * reporting relationship, and a shared test organisation profile for the
 * approver and admin.
 *
 * Safe to run multiple times — uses upsert everywhere.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Required env vars (set in .env.local or export in CI):
 *   NEXT_PUBLIC_SUPABASE_URL   or  SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   CYPRESS_EMPLOYEE_PASSWORD  (defaults to TestPassword123!)
 *   CYPRESS_MANAGER_PASSWORD
 *   CYPRESS_APPROVER_PASSWORD
 *   CYPRESS_ADMIN_PASSWORD
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local when running locally
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // also load .env if present

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
  );
  process.exit(1);
}

const DEFAULT_PASSWORD = 'TestPassword123!';

const TEST_USERS = [
  {
    email:     'test-employee@enabled.test',
    password:  process.env.CYPRESS_EMPLOYEE_PASSWORD ?? DEFAULT_PASSWORD,
    firstname: 'Test',
    lastname:  'Employee',
    role:      'employee',
    job_title: 'Software Engineer',
    department: 'Engineering',
  },
  {
    email:     'test-manager@enabled.test',
    password:  process.env.CYPRESS_MANAGER_PASSWORD ?? DEFAULT_PASSWORD,
    firstname: 'Test',
    lastname:  'Manager',
    role:      'manager',
    job_title: 'Engineering Manager',
    department: 'Engineering',
  },
  {
    email:     'test-approver@enabled.test',
    password:  process.env.CYPRESS_APPROVER_PASSWORD ?? DEFAULT_PASSWORD,
    firstname: 'Test',
    lastname:  'Approver',
    role:      'approver',
    job_title: 'HR Business Partner',
    department: 'Human Resources',
  },
  {
    email:     'test-admin@enabled.test',
    password:  process.env.CYPRESS_ADMIN_PASSWORD ?? DEFAULT_PASSWORD,
    firstname: 'Test',
    lastname:  'Admin',
    role:      'admin',
    job_title: 'System Administrator',
    department: 'IT Services',
  },
] as const;

type TestUser = typeof TEST_USERS[number];

async function upsertAuthUser(
  supabase: ReturnType<typeof createClient>,
  user: TestUser
): Promise<string> {
  // Check if the user already exists
  const { data: existing } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const found = existing?.users?.find((u) => u.email === user.email);

  if (found) {
    // Update the password to keep it in sync
    await supabase.auth.admin.updateUserById(found.id, { password: user.password });
    console.log(`  ✔  ${user.email} already exists (id: ${found.id})`);
    return found.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email:             user.email,
    password:          user.password,
    email_confirm:     true, // skip confirmation email in test environments
  });

  if (error || !data?.user) {
    throw new Error(`Failed to create user ${user.email}: ${error?.message}`);
  }

  console.log(`  ✔  Created ${user.email} (id: ${data.user.id})`);
  return data.user.id;
}

async function upsertProfile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  user: TestUser,
  lineManagerId?: string
) {
  const { error } = await supabase.from('user_profile').upsert(
    {
      userId:          userId,
      firstname:       user.firstname,
      lastname:        user.lastname,
      job_title:       user.job_title,
      role:            user.role,
      department:      user.department,
      line_manager_id: lineManagerId ?? null,
      is_disabled:     false,
      is_first_login:  false,
    },
    { onConflict: 'userId' }
  );

  if (error) {
    throw new Error(`Failed to upsert profile for ${user.email}: ${error.message}`);
  }
  console.log(`  ✔  Upserted profile for ${user.email} (role: ${user.role})`);
}

async function main() {
  console.log('\n🌱  Seeding test users …\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create auth users first (need IDs before inserting profiles)
  const ids: Record<string, string> = {};
  for (const user of TEST_USERS) {
    ids[user.role] = await upsertAuthUser(supabase, user);
  }

  // Upsert profiles — employee has the manager as their line manager
  for (const user of TEST_USERS) {
    const lineManagerId = user.role === 'employee' ? ids['manager'] : undefined;
    await upsertProfile(supabase, ids[user.role], user, lineManagerId);
  }

  console.log('\n✅  Test users ready.\n');
  console.log('   employee  →', ids['employee']);
  console.log('   manager   →', ids['manager']);
  console.log('   approver  →', ids['approver']);
  console.log('   admin     →', ids['admin']);
  console.log(
    '\n   Add these to cypress.env.json if you want to hard-code IDs,\n' +
    '   or let the Cypress tasks look them up at runtime.\n'
  );
}

main().catch((err) => {
  console.error('\n❌  Seed failed:', err.message);
  process.exit(1);
});
