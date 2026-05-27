#!/usr/bin/env npx tsx
/**
 * Remove all test users and their associated data created by seed-test-users.ts.
 *
 * Deletes from auth.users; cascade constraints remove user_profile,
 * user_disabilities, adjustment_requests, notifications, etc. automatically.
 *
 * Usage:
 *   npx tsx scripts/cleanup-test-users.ts
 *
 * Required env vars:
 *   NEXT_PUBLIC_SUPABASE_URL   or  SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!SUPABASE_URL) {
  console.error(
    '❌  SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL is not set.\n' +
    `   Loaded env from: ${path.join(projectRoot, '.env.local')}`
  );
  process.exit(1);
}

if (!SERVICE_KEY) {
  console.error(
    '❌  SUPABASE_SERVICE_ROLE_KEY is not set.\n' +
    '   Add it to .env.local (Supabase Dashboard → Project Settings → API → service_role).'
  );
  process.exit(1);
}

const TEST_EMAILS = [
  'test-employee@enabled.test',
  'test-manager@enabled.test',
  'test-approver@enabled.test',
  'test-admin@enabled.test',
];

async function main() {
  console.log('\n🧹  Cleaning up test users …\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });

  if (listErr) {
    throw new Error(`Failed to list users: ${listErr.message}`);
  }

  const toDelete = (listData?.users ?? []).filter((u) =>
    TEST_EMAILS.includes(u.email ?? '')
  );

  if (toDelete.length === 0) {
    console.log('  ℹ️  No test users found — nothing to clean up.');
    return;
  }

  // Delete transient test data explicitly (adjustment_requests may not cascade
  // if foreign-key enforcement was added later without ON DELETE CASCADE).
  for (const user of toDelete) {
    await supabase.from('adjustment_requests').delete().eq('user_id', user.id);
    await supabase.from('user_disabilities').delete().eq('user_id', user.id);
    await supabase.from('user_adjustments').delete().eq('user_id', user.id);
    await supabase.from('notifications').delete().eq('user_id', user.id);
    await supabase.from('documents').delete().eq('user_id', user.id);
    await supabase.from('user_profile').delete().eq('userId', user.id);
  }

  // Delete the auth users (cascade handles anything the above missed)
  for (const user of toDelete) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.warn(`  ⚠️  Could not delete ${user.email}: ${error.message}`);
    } else {
      console.log(`  ✔  Deleted ${user.email} (id: ${user.id})`);
    }
  }

  console.log('\n✅  Cleanup complete.\n');
}

main().catch((err) => {
  console.error('\n❌  Cleanup failed:', err.message);
  process.exit(1);
});
