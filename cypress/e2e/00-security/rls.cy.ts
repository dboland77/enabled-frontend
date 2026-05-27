// ─── RLS pre-flight check ────────────────────────────────────────────────────
//
// This spec intentionally lives in 00-security/ so Cypress executes it first
// (paths sort before any letter in ASCII order).
//
// It queries pg_catalog.pg_tables directly via a pg task (PostgREST cannot
// reach pg_catalog, which is why a direct DB connection is needed).
//
// If ANY public-schema table has rowsecurity = false, the test fails and lists
// the offending tables along with the SQL needed to fix them.  All other specs
// in the suite depend on RLS being correctly configured, so a failure here
// signals that the environment is unsafe and the rest of the run should not
// proceed.
// ─────────────────────────────────────────────────────────────────────────────

describe('Pre-flight security: Row-Level Security', () => {
  it('every table in the public schema has RLS enabled', () => {
    cy.task<string[]>('checkRlsStatus').then((unprotected) => {
      if (unprotected.length === 0) {
        // All tables are protected — nothing more to do.
        expect(unprotected).to.be.empty;
        return;
      }

      const bulletList = unprotected.map((t) => `  • ${t}`).join('\n');
      const fixStatements = unprotected
        .map((t) => `  ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`)
        .join('\n');

      throw new Error(
        [
          `RLS is DISABLED on ${unprotected.length} table(s) in the public schema:`,
          '',
          bulletList,
          '',
          'Any authenticated user can read or modify these rows without restriction.',
          'Run the following SQL in Supabase Dashboard → SQL Editor:',
          '',
          fixStatements,
        ].join('\n')
      );
    });
  });
});
