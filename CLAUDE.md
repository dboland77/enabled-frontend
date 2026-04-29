# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with Turbopack
npm run build     # Production build
npm run lint      # Run ESLint
npm start         # Start production server
```

No test runner is configured. Lint is the primary code-quality check.

## Architecture

**enableD** is a Next.js 16 App Router application for managing workplace reasonable adjustments (disability accommodations). Users submit adjustment requests; approvers review and manage them. An accessibility passport can be generated as a PDF.

**Stack:** Next.js 16 + React 19, MUI v7, SWR, React Hook Form + Yup, Supabase (auth + database), Framer Motion, Emotion.

**Path alias:** `@/*` → `src/`

### Directory roles

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/sections/` | Page-specific view components (one folder per domain) |
| `src/components/` | Reusable, domain-agnostic UI components |
| `src/hooks/` | SWR-based data hooks for every domain entity |
| `src/lib/supabase/` | Browser and server Supabase client factories |
| `src/types/` | Shared TypeScript interfaces and enums |
| `src/theme/` | MUI theme config, palette, typography, component overrides |
| `src/utils/` | Pure utility functions (formatting, transforms) |
| `src/layouts/` | Layout wrappers (dashboard shell with sidebar) |
| `scripts/` | SQL migration files for Supabase setup |

### Data fetching pattern

All data access goes through custom hooks in `src/hooks/`. Each hook wraps `useSWR` with a string cache key constant and calls Supabase directly from the browser client (`src/lib/supabase/client.ts`). Mutations call `mutate()` to revalidate the cache. Server-side Supabase access (middleware, API routes) uses `src/lib/supabase/server.ts`.

```ts
// Typical hook shape
const CACHE_KEY = 'user-documents';
export function useDocuments() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEY, fetchDocuments);
  return { documents: data, error, isLoading, mutate };
}
```

Most API routes in `src/app/api/` are thin wrappers for operations that require server-side secrets (e.g., sending passport emails).

### Auth

Supabase Auth with cookie-based sessions via `@supabase/ssr`. Google One-Tap is integrated (requires `Permissions-Policy: identity-credentials-get` header set in `next.config.ts`). Middleware reads session cookies to protect dashboard routes.

### Form pattern

Forms use React Hook Form with Yup resolvers. Form field components live in `src/components/hook-form/` and wrap MUI inputs with `Controller`. Validation schemas are colocated in the section component.

### Provider tree

`SettingsProvider` → `ThemeProvider` → `SnackbarProvider` → `AriaLiveAnnouncerProvider` → `KeyboardShortcutsProvider` → page content. The settings context manages theme mode, color preset, layout direction, and contrast.

### Domain sections

`adjustment` — adjustment catalog; `adjustmentRequest` — request creation/approval workflow; `approver` — approver management; `disability` — disability records; `documents` — document upload/sharing; `passport` — accessibility passport PDF; `wizard` — multi-step onboarding flow; `notifications` — notification inbox.

## Key conventions

- MUI v7 `Grid` uses `size` prop (not `xs`/`md`): `<Grid size={{ xs: 12, md: 6 }}>`
- Supabase client must not be instantiated at module level — always call the factory inside a hook or component to avoid SSR/CSR mismatches.
- ESLint extends Airbnb + TypeScript + Prettier; `no-console` and `no-alert` are disabled intentionally.
- Environment variables required locally: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_SITE_URL`, `NEXT_REDIRECT_URLS`.
