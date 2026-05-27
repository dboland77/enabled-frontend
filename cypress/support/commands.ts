// ─── Custom command type declarations ────────────────────────────────────────

import type { UserRole } from '../fixtures/users';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Log in as a test user by role.
       * Uses cy.session() so the auth state is cached and reused across tests in
       * the same spec.  A fresh UI login only happens when the session has expired.
       */
      loginAs(role: UserRole): Chainable<void>;

      /**
       * Create transient test data via the Supabase service-role key.
       * Returns an object with IDs of the created rows.
       */
      seedTestData(): Chainable<{
        employeeId: string;
        managerId: string | null;
        approverId: string;
        requestId: string;
        userDisabilityId: string | null;
      }>;

      /**
       * Remove all transient test data created by seedTestData().
       * Safe to call in afterEach / after hooks.
       */
      cleanupTestData(): Chainable<null>;

      /**
       * Obtain a Supabase access token for a role without touching the browser.
       * Useful for direct REST API calls in RLS-boundary tests.
       */
      getSupabaseToken(role: UserRole): Chainable<string>;
    }
  }
}

// ─── loginAs ─────────────────────────────────────────────────────────────────

Cypress.Commands.add('loginAs', (role: UserRole) => {
  const emailKey    = `${role.toUpperCase()}_EMAIL`;
  const passwordKey = `${role.toUpperCase()}_PASSWORD`;
  const email       = Cypress.env(emailKey)    as string;
  const password    = Cypress.env(passwordKey) as string;

  cy.session(
    `session-${role}`,
    () => {
      cy.visit('/auth/signin');

      // MUI TextField with React Hook Form renders a standard <input name="...">
      cy.get('input[name="email"]').should('be.visible').type(email);
      cy.get('input[name="password"]').type(password, { log: false });
      cy.contains('button', 'Sign In').click();

      cy.url({ timeout: 15_000 }).should('include', '/dashboard');
    },
    {
      cacheAcrossSpecs: true,
      validate() {
        // Validate the session cookie is still accepted by Supabase.
        cy.request({
          method: 'GET',
          url: `${Cypress.env('SUPABASE_URL')}/auth/v1/user`,
          headers: { apikey: Cypress.env('SUPABASE_ANON_KEY') },
          failOnStatusCode: false,
        })
          .its('status')
          .should('be.oneOf', [200, 401]); // 401 triggers re-login via cy.session
      },
    }
  );
});

// ─── seedTestData ─────────────────────────────────────────────────────────────

Cypress.Commands.add('seedTestData', () => {
  return cy.task('seedTestData') as Cypress.Chainable<{
    employeeId: string;
    managerId: string | null;
    approverId: string;
    requestId: string;
    userDisabilityId: string | null;
  }>;
});

// ─── cleanupTestData ──────────────────────────────────────────────────────────

Cypress.Commands.add('cleanupTestData', () => {
  return cy.task('cleanupTestData') as Cypress.Chainable<null>;
});

// ─── getSupabaseToken ─────────────────────────────────────────────────────────

Cypress.Commands.add('getSupabaseToken', (role: UserRole) => {
  const emailKey    = `${role.toUpperCase()}_EMAIL`;
  const passwordKey = `${role.toUpperCase()}_PASSWORD`;

  return cy
    .request<{ access_token: string }>({
      method: 'POST',
      url: `${Cypress.env('SUPABASE_URL')}/auth/v1/token?grant_type=password`,
      headers: {
        apikey: Cypress.env('SUPABASE_ANON_KEY'),
        'Content-Type': 'application/json',
      },
      body: {
        email:    Cypress.env(emailKey),
        password: Cypress.env(passwordKey),
      },
    })
    .its('body.access_token');
});
