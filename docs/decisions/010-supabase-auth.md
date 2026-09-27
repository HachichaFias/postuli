# ADR 010 — Supabase Auth for authentication, sessions and roles

- Status: accepted
- Date: 2026-09-27
- Scope: framing
- Supersedes: ADR 003 (Better Auth)

## Context
With Supabase as the integrated backend platform (ADR 009), RLS policies depend on `auth.uid()`,
which only Supabase Auth provides. s01 needs email/password sign-up and login, persistent sessions,
a password policy and rate limiting (HTTP 429); s02 needs an admin role that no screen can grant;
s16 needs full account deletion.

## Decision
- Supabase Auth, email/password only in P0, with cookie-based sessions through `@supabase/ssr`.
- `proxy.ts` refreshes the Supabase session cookies on each request (as `@supabase/ssr` requires),
  sets `x-request-id`, and does optimistic redirects only. Authorization is checked in server code
  by validating the session with Supabase Auth, then enforced again by RLS.
- Roles live in an app table `profiles` (`id` = `auth.users.id`, `role` = `candidate` | `admin`),
  created at sign-up; RLS forbids users from changing `role`; `admin:grant` sets it with the secret
  key.
- Password policy and auth rate limits are Supabase Auth settings: `supabase/config.toml` locally,
  the project dashboard in staging and production.
- Account deletion uses the Supabase admin API.

## Considered options
- Better Auth (ADR 003) — rejected: its users would not exist in `auth.users`, so RLS could not use
  `auth.uid()`, defeating ADR 009.
- Auth.js — rejected for the same reason, plus limited credentials support.

## Consequences
- Easier: RLS policies key off `auth.uid()`; no password hashing or session storage to own.
- Harder: auth settings live in two places (config.toml and the dashboard) and must be kept equal.
  This supersedes ADR 008's rule that `proxy.ts` does only redirects and request ids: it also
  refreshes sessions.
- Watch: decoding a JWT locally doesn't detect a revoked session; security-relevant checks validate
  the session with Supabase Auth.
