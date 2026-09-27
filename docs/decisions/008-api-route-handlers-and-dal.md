# ADR 008 — Route Handlers for the HTTP API, a server-only Data Access Layer for every read and write

- Status: accepted
- Date: 2026-09-27
- Scope: framing

## Context
The stories specify HTTP behaviour (`PATCH /me/profile`, `POST /chat/query`, `DELETE
/opportunities/{id}/save`, 403/404 across accounts, 429 limits) and the release gate demands zero
cross-account access. Next.js 16 offers both Server Actions and Route Handlers for mutations, and
its security guide recommends a Data Access Layer that performs authorization and returns minimal
DTOs.

## Decision
- The HTTP API is implemented as Route Handlers under `src/app/api/`, mirroring the PRD §13.3
  surface (`/api/me/profile`, `/api/chat/query`, `/api/opportunities/[id]/save`, …). Client
  Components call them; Server Actions are not used for mutations.
- All data access goes through `src/server/dal/<domain>.ts` (`import "server-only"`). Each function
  receives the verified session, enforces ownership or role, and returns a DTO. Route handlers and
  Server Components never query the database directly.
- Another user's resource answers 404 (no existence leak); a wrong role answers 403.
- `proxy.ts` only does optimistic redirects (unauthenticated → `/connexion`) and sets the
  `x-request-id` header; it is never the authorization check.

## Considered options
- Server Actions for mutations — rejected: they are harder to call from tests with an explicit HTTP
  status contract, and splitting mutations between actions and handlers doubles the authorization
  surface.
- Authorization in `proxy.ts` or layouts — rejected: the Next.js docs warn that layouts don't
  re-run on navigation and Proxy is not an authorization solution.

## Consequences
- Easier: one place to audit ownership rules; every criterion about status codes is an HTTP test.
- Harder: a little more boilerplate than Server Actions for simple forms.
- Watch: a Client Component can never import from `src/server/`; the `server-only` import makes
  that a build error.
