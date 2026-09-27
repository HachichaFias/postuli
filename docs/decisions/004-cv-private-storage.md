# ADR 004 — CV files in a private Supabase Storage bucket with signed URLs

- Status: accepted
- Date: 2026-09-27
- Scope: framing

## Context
s04 stores uploaded CV PDFs. The PRD requires a private bucket with signed URLs (§13.7), no access
across accounts, and deletion with the account (s16). Candidate CVs are the most sensitive PII in
the product.

## Decision
CV files go to a private Supabase Storage bucket (`cvs`), under the object path
`<userId>/<cvId>.pdf`, written and read only from server code with the service-role key
(`src/server/storage/`). The browser never receives a permanent URL: the server issues short-lived
signed URLs after an ownership check. Local development uses a separate Supabase dev project's
bucket (no local emulator).

## Considered options
- Cloudflare R2 — rejected for P0 because it adds a second vendor; the PRD lists it as the option
  "if needed" later.
- Storing PDFs in Postgres (`bytea`) — rejected: bloats the database and backups, no signed URLs.
- Local disk on the app server — rejected: Railway disks are ephemeral and don't scale to replicas.

## Consequences
- Easier: same vendor as the database; signed URLs built in.
- Harder: tests that touch storage need the dev bucket or a mocked storage module; unit tests mock
  `src/server/storage/`.
- Watch: the service-role key is server-only; never expose it through `NEXT_PUBLIC_*`.
