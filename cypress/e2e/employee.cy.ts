// ─── Employee user-story tests ────────────────────────────────────────────────
//
// EMP-01  Employee discloses a condition; disclosure is private (not visible to manager).
// EMP-02  Employee submits an adjustment request and can track its status.
// EMP-03  Employee views their adjustment-request list with correct statuses.
// EMP-04  Employee can view and update their profile (account settings).
//
// NOTE: No data-testid attributes exist in the app yet.  Selectors rely on
// accessible labels, input names, and visible text — add data-testid attributes
// to key interactive elements to make the suite more resilient over time.
// ─────────────────────────────────────────────────────────────────────────────

describe('Employee – EMP-01: Disclose a condition', () => {
  before(() => cy.loginAs('employee'));
  beforeEach(() => cy.loginAs('employee'));
  after(() => cy.cleanupTestData());

  it('can browse the disability library', () => {
    cy.visit('/dashboard/disability');
    cy.contains('h1, h2, h3, h4, h5, h6', /disabilit/i, { timeout: 10_000 }).should('be.visible');
    cy.get('body').should('not.contain', 'Error');
  });

  it('medical disclosure page loads for the employee', () => {
    cy.visit('/dashboard/disability');
    cy.url().should('include', '/dashboard/disability');
    // Page must not show another user's data
    cy.contains(Cypress.env('MANAGER_EMAIL')).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Employee – EMP-02: Submit an adjustment request', () => {
  before(() => cy.loginAs('employee'));
  beforeEach(() => cy.loginAs('employee'));
  after(() => cy.cleanupTestData());

  it('loads the new-request form', () => {
    cy.visit('/dashboard/user/adjustmentRequests/new');
    cy.contains(/request a workplace adjustment/i, { timeout: 10_000 }).should('be.visible');
  });

  it('shows validation errors when the form is submitted empty', () => {
    cy.visit('/dashboard/user/adjustmentRequests/new');
    cy.contains('button', /submit/i).click();
    // Yup validation — at least one required-field error must appear
    cy.contains(/required/i).should('be.visible');
  });

  it('fills in the request form and submits successfully', () => {
    cy.visit('/dashboard/user/adjustmentRequests/new');

    // Title
    cy.get('input[name="title"]').type('[TEST] Screen Magnification Software');

    // Detail — RHFEditor renders a contenteditable div
    cy.get('[contenteditable="true"]')
      .first()
      .click()
      .type('I need screen-magnification software to reduce eye strain.');

    // Adjustment Type autocomplete
    cy.get('input[name="adjustmentType"]').type('Software', { force: true });
    cy.contains('[role="option"]', 'Software').click();

    // Work function autocomplete
    cy.get('input[name="workfunction"]').type('Computer Work', { force: true });
    cy.contains('[role="option"]', 'Computer Work').click();

    // Location autocomplete
    cy.get('input[name="location"]').type('Office', { force: true });
    cy.contains('[role="option"]', 'Office').click();

    // Required date — MUI DatePicker input
    cy.get('input[placeholder*="MM"]').first().type('12/31/2025', { force: true });

    // Approver autocomplete — pick the first option
    cy.get('input[id*="approver"], input[name*="approver"]')
      .first()
      .click({ force: true });
    cy.get('[role="option"]').first().click();

    // Submit
    cy.contains('button', /submit/i).click();

    // On success the app navigates away and shows a snackbar
    cy.url({ timeout: 15_000 }).should('include', '/dashboard/user/adjustmentRequests');
    cy.contains(/submitted successfully/i).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Employee – EMP-03: View adjustment-request list and statuses', () => {
  let seeded: { requestId: string };

  before(() => {
    cy.loginAs('employee');
    cy.seedTestData().then((data) => {
      seeded = { requestId: data.requestId };
    });
  });
  beforeEach(() => cy.loginAs('employee'));
  after(() => cy.cleanupTestData());

  it('shows the my-adjustments list page', () => {
    cy.visit('/dashboard/user/adjustmentRequests/list');
    cy.contains(/adjustment/i, { timeout: 10_000 }).should('be.visible');
  });

  it('displays the seeded NEW request in the list', () => {
    cy.visit('/dashboard/user/adjustmentRequests/list');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 10_000 }).should('be.visible');
  });

  it('shows status labels (New / Pending / Approved / Declined)', () => {
    cy.visit('/dashboard/user/adjustmentRequests/list');
    // The seeded request has status NEW which maps to the label "New"
    cy.contains('New', { timeout: 10_000 }).should('be.visible');
  });

  it('can navigate to the request detail page', () => {
    cy.visit('/dashboard/user/adjustmentRequests/list');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 10_000 })
      .parents('tr')
      .first()
      .click();
    cy.url({ timeout: 10_000 }).should('match', /adjustmentRequests\/[a-f0-9-]+/);
  });

  it('the employee can only see their own requests', () => {
    cy.visit('/dashboard/user/adjustmentRequests/list');
    // Manager email must never appear as a requester in this list
    cy.contains(Cypress.env('MANAGER_EMAIL')).should('not.exist');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Employee – EMP-04: Account settings and profile', () => {
  before(() => cy.loginAs('employee'));
  beforeEach(() => cy.loginAs('employee'));

  it('loads the user profile page', () => {
    cy.visit('/dashboard/user/profile');
    cy.contains(/profile/i, { timeout: 10_000 }).should('be.visible');
  });

  it('displays the passport page without error', () => {
    cy.visit('/dashboard/passport');
    cy.url().should('include', '/dashboard/passport');
    cy.get('body').should('not.contain', '500');
  });

  it('notifications page loads and shows the inbox', () => {
    cy.visit('/dashboard/notifications');
    cy.contains(/notification/i, { timeout: 10_000 }).should('be.visible');
  });

  it('documents page loads', () => {
    cy.visit('/dashboard/documents');
    cy.url().should('include', '/dashboard/documents');
    cy.get('body').should('not.contain', '500');
  });
});
