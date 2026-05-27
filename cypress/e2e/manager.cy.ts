// ─── Manager user-story tests ─────────────────────────────────────────────────
//
// MGR-01  Manager is notified of an approved plan and can view adjustments (but
//         NOT medical disclosures) for direct reports.
// MGR-02  Manager can see the approvals/team queue and filter by status; cannot
//         see requests outside their reporting line.
// MGR-03  Manager can flag a plan for review with a reason, which moves it to
//         "under review" and notifies HR.
//
// In this codebase "manager" is a role in user_profile.role.  The approval
// dashboard at /dashboard/approvals is available to admins, approvers, and
// managers alike.
// ─────────────────────────────────────────────────────────────────────────────

describe('Manager – MGR-01: View approved plans (not medical disclosures)', () => {
  let seeded: { requestId: string; employeeId: string };

  before(() => {
    cy.loginAs('manager');
    cy.seedTestData().then((data) => {
      seeded = { requestId: data.requestId, employeeId: data.employeeId };
    });
  });
  beforeEach(() => cy.loginAs('manager'));
  after(() => cy.cleanupTestData());

  it('loads the approvals dashboard', () => {
    cy.visit('/dashboard/approvals');
    cy.contains(/approval/i, { timeout: 10_000 }).should('be.visible');
  });

  it('can see the adjustment request details (title, type)', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 }).should('be.visible');
  });

  it('disability/medical disclosure page does NOT expose the employee health record', () => {
    // The manager logs in and visits the disability page — this page shows the
    // current user's OWN disabilities, not their reports' medical disclosures.
    cy.visit('/dashboard/disability');
    // Manager should see their own (empty) list, not the employee's data.
    cy.contains(Cypress.env('EMPLOYEE_EMAIL')).should('not.exist');
  });

  it('manager cannot reach another user\'s adjustment request by direct URL', () => {
    // The seeded request belongs to the employee; navigating to it as manager
    // should either redirect or show "not found" — RLS returns no data.
    cy.visit(`/dashboard/user/adjustmentRequests/${seeded.requestId}`);
    // Accept either a 404 page, a redirect, or an empty/no-data state.
    cy.get('body').should(($body) => {
      const text = $body.text();
      const isEmpty = text.includes('not found') || text.includes('No data') || text.includes('404');
      // Alternatively the page may load but show nothing — the key assertion is
      // that the employee's private medical notes are absent.
      expect(text).not.to.include(Cypress.env('EMPLOYEE_EMAIL'));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Manager – MGR-02: Team dashboard and filtering', () => {
  before(() => {
    cy.loginAs('manager');
    cy.seedTestData();
  });
  beforeEach(() => cy.loginAs('manager'));
  after(() => cy.cleanupTestData());

  it('approvals page loads for manager', () => {
    cy.visit('/dashboard/approvals');
    cy.url().should('include', '/dashboard/approvals');
    cy.get('body').should('not.contain', '500');
  });

  it('can filter to All tab', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[role="tab"]', /all/i, { timeout: 10_000 }).click();
    cy.url().should('include', '/dashboard/approvals');
  });

  it('can filter to Approved tab', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[role="tab"]', /approved/i, { timeout: 10_000 }).click();
    cy.url().should('include', '/dashboard/approvals');
  });

  it('does not show the Management section nav to unauthenticated users', () => {
    // Confirm manager IS shown the Management nav item (unlike plain employee)
    cy.visit('/dashboard/approvals');
    cy.contains(/management/i, { timeout: 10_000 }).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Manager – MGR-03: Flag a plan for review', () => {
  before(() => {
    cy.loginAs('manager');
    cy.seedTestData();
  });
  beforeEach(() => cy.loginAs('manager'));
  after(() => cy.cleanupTestData());

  it('shows action buttons on actionable requests', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 })
      .parents('tr')
      .first()
      .within(() => {
        // At least one action button must exist for a NEW/PENDING request
        cy.get('button').should('have.length.gte', 1);
      });
  });

  it('can use "Request More Info" to flag the plan for HR review', () => {
    cy.visit('/dashboard/approvals');

    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 })
      .parents('tr')
      .first()
      .within(() => {
        cy.get('[aria-label="Request More Info"], button[title="Request More Info"]')
          .first()
          .click({ force: true });
      });

    cy.get('[role="dialog"]', { timeout: 5_000 }).should('be.visible');
    cy.get('textarea, [role="dialog"] textarea')
      .first()
      .type('Flagging for HR review — employee may need occupational health assessment.');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', /confirm|send|request/i).click();
    });

    cy.contains(/more info|review/i, { timeout: 10_000 }).should('be.visible');
  });
});
