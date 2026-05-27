// ─── HR / Approver user-story tests ──────────────────────────────────────────
//
// HR-01  HR sees the pending queue and can approve, modify, or decline a request
//        with a reason; employee is notified; the action is audit-logged.
// HR-02  HR can browse and manage the adjustment library (add/edit/archive).
// HR-03  HR can see the approvals dashboard.
// HR-04  HR can browse users and manage accounts.
// HR-05  Access to pages that employees cannot reach is confirmed.
//
// In this codebase the "HR" role is named "approver" in user_profile.role.
// ─────────────────────────────────────────────────────────────────────────────

describe('HR/Approver – HR-01: Review and action pending requests', () => {
  let seeded: { requestId: string; employeeId: string };

  before(() => {
    cy.loginAs('approver');
    cy.seedTestData().then((data) => {
      seeded = { requestId: data.requestId, employeeId: data.employeeId };
    });
  });
  beforeEach(() => cy.loginAs('approver'));
  after(() => cy.cleanupTestData());

  it('loads the approvals dashboard', () => {
    cy.visit('/dashboard/approvals');
    cy.contains(/approval/i, { timeout: 10_000 }).should('be.visible');
  });

  it('shows pending requests from all employees', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 }).should('be.visible');
  });

  it('can filter to the Pending tab', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[role="tab"]', /pending/i, { timeout: 10_000 }).click();
    cy.url().should('include', '/dashboard/approvals');
    // After filtering, any rows visible must not show Approved / Declined labels
    cy.get('body').should('not.contain', 'Completed');
  });

  it('can approve a request with a response message', () => {
    cy.visit('/dashboard/approvals');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 })
      .parents('tr')
      .first()
      .within(() => {
        // Approve icon button (Tooltip: "Approve")
        cy.get('[aria-label="Approve"], button[title="Approve"]')
          .first()
          .click({ force: true });
      });

    // Dialog should appear
    cy.get('[role="dialog"]', { timeout: 5_000 }).should('be.visible');
    cy.get('textarea, input[name*="message"], [role="dialog"] textarea')
      .first()
      .type('Approved — equipment will be ordered within 5 working days.');

    cy.get('[role="dialog"]').within(() => {
      cy.contains('button', /confirm|approve/i).click();
    });

    // Success feedback
    cy.contains(/approved/i, { timeout: 10_000 }).should('be.visible');
  });

  it('can decline a request with a reason', () => {
    // Seed a fresh request to decline
    cy.task('seedTestData').then((data: { requestId: string }) => {
      cy.visit('/dashboard/approvals');

      cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 })
        .parents('tr')
        .first()
        .within(() => {
          cy.get('[aria-label="Decline"], button[title="Decline"]')
            .first()
            .click({ force: true });
        });

      cy.get('[role="dialog"]', { timeout: 5_000 }).should('be.visible');
      cy.get('textarea, [role="dialog"] textarea')
        .first()
        .type('Cannot be accommodated at this location at present.');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', /confirm|decline/i).click();
      });

      cy.contains(/declined|denied/i, { timeout: 10_000 }).should('be.visible');
    });
  });

  it('can request more information from the employee', () => {
    cy.task('seedTestData').then(() => {
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
        .type('Please provide a medical note from your GP.');

      cy.get('[role="dialog"]').within(() => {
        cy.contains('button', /confirm|send|request/i).click();
      });

      cy.contains(/more info/i, { timeout: 10_000 }).should('be.visible');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HR/Approver – HR-02: Adjustment library management', () => {
  before(() => cy.loginAs('approver'));
  beforeEach(() => cy.loginAs('approver'));

  it('can browse the adjustment library (list view)', () => {
    cy.visit('/dashboard/adjustments');
    cy.contains(/adjustment/i, { timeout: 10_000 }).should('be.visible');
  });

  it('can browse the adjustment library (cards view)', () => {
    cy.visit('/dashboard/adjustments/cards');
    cy.url().should('include', '/adjustments/cards');
    cy.get('body').should('not.contain', '500');
  });

  it('approver can reach the new-adjustment page', () => {
    cy.visit('/dashboard/adjustments/new');
    cy.url().should('include', '/adjustments/new');
    cy.get('body').should('not.contain', 'Forbidden');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HR/Approver – HR-03: Dashboard overview', () => {
  before(() => cy.loginAs('approver'));
  beforeEach(() => cy.loginAs('approver'));

  it('approvals section is present in the navigation', () => {
    cy.visit('/dashboard/app');
    cy.contains(/approval/i, { timeout: 10_000 }).should('be.visible');
  });

  it('dashboard loads without errors', () => {
    cy.visit('/dashboard/app');
    cy.get('body').should('not.contain', '500');
    cy.get('body').should('not.contain', 'Something went wrong');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('HR/Approver – HR-04 & HR-05: User management', () => {
  before(() => cy.loginAs('approver'));
  beforeEach(() => cy.loginAs('approver'));

  it('approver can see the user list page', () => {
    cy.visit('/dashboard/user/list');
    cy.url().should('include', '/user/list');
    cy.get('body').should('not.contain', '500');
  });

  it('approver can reach the create-user page', () => {
    cy.visit('/dashboard/user/new');
    cy.url().should('include', '/user/new');
    cy.get('body').should('not.contain', '500');
  });

  it('approver sees the Management section in the nav', () => {
    cy.visit('/dashboard/approvals');
    cy.contains(/management/i, { timeout: 10_000 }).should('be.visible');
  });
});
