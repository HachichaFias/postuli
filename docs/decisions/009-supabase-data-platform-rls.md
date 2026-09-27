# ADR 009 — Supabase as the integrated data platform: Postgres through supabase-js with Row Level Security

- Status: accepted
- Date: 2026-09-27
- Scope: framing
- Supersedes: ADR 002 (Drizzle on Postgres), ADR 004 (CV storage)

## Context
The Product Owner set the stack on 27 Sept 2026: Next.js as frontend and backend, with Supabase as
the integrated backend platform. The release gate demands zero cross-account access, and many story
criteria are per-user isolation rules. The product needs relational data, hard-constraint SQL
filters, optional pgvector similarity, and a private CV store with signed URLs.

## Decision
- **Database:** Supabase Postgres (pgvector enabled), accessed from Next.js server code with
  `@supabase/supabase-js` / `@supabase/ssr`. Complex queries (hard-constraint retrieval, ranking
  inputs, metrics) live in SQL functions called with `rpc`.
- **Row Level Security on every table**, enabled in the migration that creates it. User-owned rows
  are readable and writable only by `auth.uid()`; admin-only tables check `profiles.role = 'admin'`.
- **Two server clients:** a user-scoped client (publishable key + the user's session cookies) used
  for everything a user does, so RLS applies; a secret-key client (bypasses RLS) used only by admin
  scripts, background jobs and event writes, in clearly named modules.
- **Schema:** SQL migrations in `supabase/migrations/` created with `supabase migration new`;
  TypeScript types generated from the database (`supabase gen types`) into
  `src/server/supabase/database.types.ts`.
- **Storage:** private bucket `cvs`, object path `<user id>/<cv id>.pdf`, storage RLS policies by
  folder, downloads only through short-lived signed URLs issued by the server.
- **Environments:** local development and tests on the Supabase local stack (`supabase start`, which
  runs in Docker); separate Supabase projects for staging and production.

## Considered options
- Drizzle ORM on Supabase Postgres (ADR 002) — rejected: authorization would live only in
  application code, and RLS would be either unused or duplicated by hand; supabase-js with RLS puts
  isolation in the database itself.
- Prisma — rejected for the same reason, plus a generated client and build step.
- Calling Supabase directly from the browser — rejected: the PRD API surface, validation, events and
  LLM calls live in Route Handlers; the browser talks to our API, not to the database.

## Consequences
- Easier: per-user isolation is enforced even if a route forgets a check; auth, data and files share
  one platform, one dashboard and one set of keys.
- Harder: every table needs correct RLS policies, and policy mistakes are silent — each story tests
  its cross-account criteria through the user-scoped client. Joins beyond the query builder go
  into SQL functions.
- Watch: the secret key is server-only and never exposed through `NEXT_PUBLIC_*`. Supabase regions
  are outside Tunisia: law 2004-63 / INPDP review before a wide launch (context §19.2).
