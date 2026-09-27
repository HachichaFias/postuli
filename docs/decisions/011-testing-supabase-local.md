# ADR 011 — Vitest and Playwright against the local Supabase stack

- Status: accepted
- Date: 2026-09-27
- Scope: framing
- Supersedes: ADR 006 (testing against a docker-compose Postgres)

## Context
ADR 006 chose Vitest and Playwright and ran database tests on a plain docker-compose Postgres. With
Supabase Auth and RLS (ADR 009, ADR 010), the rules under test (cross-account isolation, admin-only
writes, storage folders) only exist inside a Supabase stack; a plain Postgres has no `auth.uid()`,
no Auth API and no Storage.

## Decision
- Vitest runs unit and integration tests, colocated as `*.test.ts(x)`. Integration tests run
  against the local Supabase stack (`supabase start`), with `supabase db reset` applying all
  migrations and `supabase/seed.sql`. Cross-account tests sign in two real test users and use the
  user-scoped client, so RLS is exercised; the LLM gateway is mocked.
- Playwright runs end-to-end tests in `e2e/*.spec.ts` against `next dev` on the local stack, with
  `@axe-core/playwright` for the accessibility criteria.
- Scripts: `pnpm test`, `pnpm e2e`, `pnpm typecheck`, `pnpm lint`, `pnpm build`; database scripts
  `pnpm db:start`, `pnpm db:stop`, `pnpm db:reset`, `pnpm db:types`.

## Considered options
- Plain Postgres in docker-compose (ADR 006) — rejected: it can't run Auth, Storage or RLS
  policies keyed on `auth.uid()`.
- A shared cloud Supabase project for tests — rejected: tests from several story worktrees would
  collide, and every run would touch the network.

## Consequences
- Easier: tests exercise the same RLS policies as production.
- Harder: the local stack runs several containers and takes longer to start than one Postgres;
  Docker must be running for integration and end-to-end tests.
- Watch: the local stack's default ports (54321–54324) must stay free.
