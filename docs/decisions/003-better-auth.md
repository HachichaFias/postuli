# ADR 003 — Better Auth for authentication, sessions and roles

- Status: accepted
- Date: 2026-09-27
- Scope: framing

## Context
s01 needs email/password sign-up and login, persistent secure sessions, rate limiting (HTTP 429),
and a `role` on the account; s02 needs an `admin` role that no screen can grant; s16 needs full
account deletion. The PRD recommends managed auth (Supabase Auth).

## Decision
Better Auth, mounted as a Next.js Route Handler at `/api/auth/[...all]`, storing its users and
sessions in our own Postgres through its Drizzle adapter. Email/password only in P0. Roles use a
`role` field on the user (`candidate` default, `admin` granted only by the `admin:grant` script).
Session checks happen in the Data Access Layer (`src/server/auth/`), never only in `proxy.ts`.

## Considered options
- Supabase Auth (PRD recommendation) — rejected because users would live in Supabase's `auth`
  schema while all other data is accessed through Drizzle, splitting joins, deletion (s16) and
  role checks across two systems.
- Auth.js (NextAuth) — rejected because its credentials (email/password) flow is deliberately
  limited and rate limiting is left to us.
- Custom sessions — rejected: security-sensitive code the 2.5-week window can't afford to own.

## Consequences
- Easier: users, sessions and domain data in one database; built-in rate limiting and password
  hashing; account deletion is a transaction in our own tables.
- Harder: PRD API paths `/auth/register` and `/auth/login` become Better Auth's endpoints
  (`/api/auth/sign-up/email`, `/api/auth/sign-in/email`); stories test behaviour, not paths.
- Watch: configure the password policy and rate limit to the values pinned in docs/stories.md,
  and never log tokens or emails.
