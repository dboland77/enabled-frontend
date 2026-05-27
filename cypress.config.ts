import { defineConfig } from 'cypress';
import { createClient } from '@supabase/supabase-js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',

    setupNodeEvents(on, config) {
      const supabaseUrl: string = config.env.SUPABASE_URL;
      const serviceKey: string = config.env.SUPABASE_SERVICE_ROLE_KEY;

      function adminClient() {
        return createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });
      }

      on('task', {
        // Seed transient test data (not users — those are seeded by scripts/seed-test-users.ts).
        // Returns IDs so specs can target specific rows.
        async seedTestData() {
          const supabase = adminClient();

          const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 200 });
          const users = listData?.users ?? [];

          const employeeUser = users.find((u) => u.email === config.env.EMPLOYEE_EMAIL);
          const approverUser = users.find((u) => u.email === config.env.APPROVER_EMAIL);
          const managerUser  = users.find((u) => u.email === config.env.MANAGER_EMAIL);

          if (!employeeUser || !approverUser) {
            throw new Error(
              'Test users not found. Run `npx tsx scripts/seed-test-users.ts` first.'
            );
          }

          // Create a predictable NEW adjustment request for the employee
          const { data: request, error: reqErr } = await supabase
            .from('adjustment_requests')
            .insert({
              user_id: employeeUser.id,
              title: '[TEST] Ergonomic Standing Desk',
              detail: 'Need a height-adjustable desk due to a musculoskeletal condition.',
              adjustment_type: 'Equipment',
              work_function: 'Computer Work',
              location: 'Office',
              status: 'NEW',
              requester_name: 'Test Employee',
              requester_email: config.env.EMPLOYEE_EMAIL,
              approver_id: approverUser.id,
              approver_name: 'Test Approver',
            })
            .select('id')
            .single();

          if (reqErr) throw new Error(`seedTestData: request insert failed – ${reqErr.message}`);

          // Attach a disability to the employee (use whatever is first in the table)
          const { data: firstDisability } = await supabase
            .from('disabilities')
            .select('id')
            .limit(1)
            .single();

          let userDisabilityId: string | null = null;
          if (firstDisability) {
            const { data: ud } = await supabase
              .from('user_disabilities')
              .insert({ user_id: employeeUser.id, disability_id: firstDisability.id })
              .select('id')
              .maybeSingle();
            userDisabilityId = ud?.id ?? null;
          }

          return {
            employeeId: employeeUser.id,
            managerId: managerUser?.id ?? null,
            approverId: approverUser.id,
            requestId: request.id,
            userDisabilityId,
          };
        },

        async cleanupTestData() {
          const supabase = adminClient();

          // Remove rows created by the test suite
          await supabase.from('adjustment_requests').delete().like('title', '[TEST]%');

          const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 200 });
          const users = listData?.users ?? [];

          const testEmails: string[] = [
            config.env.EMPLOYEE_EMAIL,
            config.env.MANAGER_EMAIL,
            config.env.APPROVER_EMAIL,
            config.env.ADMIN_EMAIL,
          ].filter(Boolean);

          const testUsers = users.filter((u) => testEmails.includes(u.email ?? ''));
          for (const u of testUsers) {
            await supabase.from('user_disabilities').delete().eq('user_id', u.id);
          }

          return null;
        },
      });

      return config;
    },
  },
});
