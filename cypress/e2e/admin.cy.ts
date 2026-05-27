// ─── Admin (System Administrator) user-story tests ───────────────────────────
//
// SYS-01  Admin has access to all areas of the app.
// SYS-02  Admin can manage the global adjustment library.
// SYS-03  Admin can manage users (create, list, deactivate, reassign).
//
// In this codebase the system-admin role is named "admin" in user_profile.role.
// Admins share the approvals dashboard and have additional routes for user
// management and adjustment library management.
// ─────────────────────────────────────────────────────────────────────────────

describe('Admin – SYS-01: Cross-app access', () => {
  before(() => cy.loginAs('admin'));
  beforeEach(() => cy.loginAs('admin'));

  it('admin can reach the main dashboard', () => {
    cy.visit('/dashboard/app');
    cy.url().should('include', '/dashboard');
    cy.get('body').should('not.contain', 'Forbidden');
    cy.get('body').should('not.contain', '500');
  });

  it('admin can reach the approvals page', () => {
    cy.visit('/dashboard/approvals');
    cy.contains(/approval/i, { timeout: 10_000 }).should('be.visible');
    cy.get('body').should('not.contain', 'Forbidden');
  });

  it('admin can reach the user list', () => {
    cy.visit('/dashboard/user/list');
    cy.url().should('include', '/user/list');
    cy.get('body').should('not.contain', 'Forbidden');
  });

  it('admin can reach the create-user page', () => {
    cy.visit('/dashboard/user/new');
    cy.url().should('include', '/user/new');
    cy.get('body').should('not.contain', 'Forbidden');
  });

  it('admin can reach the disability information page', () => {
    cy.visit('/dashboard/disability');
    cy.url().should('include', '/dashboard/disability');
    cy.get('body').should('not.contain', '500');
  });

  it('admin can reach the disability list', () => {
    cy.visit('/dashboard/disability/list');
    cy.url().should('include', '/disability/list');
    cy.get('body').should('not.contain', '500');
  });

  it('admin sees Management section in the navigation', () => {
    cy.visit('/dashboard/app');
    cy.contains(/management/i, { timeout: 10_000 }).should('be.visible');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Admin – SYS-02: Global adjustment library', () => {
  before(() => cy.loginAs('admin'));
  beforeEach(() => cy.loginAs('admin'));

  it('can view the adjustment library list', () => {
    cy.visit('/dashboard/adjustments');
    cy.contains(/adjustment/i, { timeout: 10_000 }).should('be.visible');
  });

  it('can reach the new-adjustment form', () => {
    cy.visit('/dashboard/adjustments/new');
    cy.url().should('include', '/adjustments/new');
    cy.get('body').should('not.contain', 'Forbidden');
  });

  it('can reach the adjustment cards view', () => {
    cy.visit('/dashboard/adjustments/cards');
    cy.url().should('include', '/adjustments/cards');
    cy.get('body').should('not.contain', '500');
  });

  it('can reach the adjustment wizard', () => {
    cy.visit('/dashboard/adjustments/wizard');
    cy.url().should('include', '/adjustments/wizard');
    cy.get('body').should('not.contain', '500');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Admin – SYS-03: User management', () => {
  before(() => cy.loginAs('admin'));
  beforeEach(() => cy.loginAs('admin'));

  it('user list page renders without error', () => {
    cy.visit('/dashboard/user/list');
    cy.url().should('include', '/user/list');
    cy.get('body').should('not.contain', '500');
  });

  it('user cards page renders', () => {
    cy.visit('/dashboard/user/cards');
    cy.url().should('include', '/user/cards');
    cy.get('body').should('not.contain', '500');
  });

  it('create-user form loads with all required fields', () => {
    cy.visit('/dashboard/user/new');
    cy.contains(/create/i, { timeout: 10_000 }).should('be.visible');
    // Core fields the form schema requires
    cy.get('input[name="name"]').should('exist');
    cy.get('input[name="email"]').should('exist');
  });

  it('profile page loads for admin', () => {
    cy.visit('/dashboard/user/profile');
    cy.url().should('include', '/user/profile');
    cy.get('body').should('not.contain', '500');
  });

  it('approvals dashboard shows all requests regardless of approver', () => {
    cy.loginAs('employee');
    // Create a fresh request as the employee so admin can see it
    cy.task('seedTestData');

    cy.loginAs('admin');
    cy.visit('/dashboard/approvals');
    cy.contains('[TEST] Ergonomic Standing Desk', { timeout: 15_000 }).should('be.visible');

    cy.cleanupTestData();
  });
});
