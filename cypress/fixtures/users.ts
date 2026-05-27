// Test user credentials — values are read from Cypress.env() at runtime so that
// real credentials live in cypress.env.json locally and GitHub Secrets in CI.
// Copy cypress.env.json.example → cypress.env.json and fill in real values.

export type UserRole = 'employee' | 'manager' | 'approver' | 'admin';

export interface TestUser {
  role: UserRole;
  email: string;
  password: string;
}

export function getTestUser(role: UserRole): TestUser {
  const emailKey = `${role.toUpperCase()}_EMAIL`;
  const passKey  = `${role.toUpperCase()}_PASSWORD`;
  return {
    role,
    email:    Cypress.env(emailKey)    as string,
    password: Cypress.env(passKey)     as string,
  };
}

// Convenience map — use where you need all users at once.
export function allTestUsers(): Record<UserRole, TestUser> {
  return {
    employee: getTestUser('employee'),
    manager:  getTestUser('manager'),
    approver: getTestUser('approver'),
    admin:    getTestUser('admin'),
  };
}
