# ADR 006 — Vitest for unit/integration tests, Playwright for end-to-end

- Status: superseded by ADR 011
- Date: 2026-09-27
- Scope: framing

## Context
Every story's acceptance criteria must become tests, within a budget of 25 per story. Many
criteria are authorization and data rules (403/404, idempotent save, no invented field) that need
a real database; others are UI flows (responsive widths, keyboard access, axe scan).

## Decision
- Vitest runs unit and integration tests, colocated as `*.test.ts(x)` next to the code. Tests that
  touch the database run against the local `postuli_test` database from `docker compose`, reset per
  test file. LLM and storage modules are mocked at their gateway.
- Playwright runs end-to-end tests in `e2e/*.spec.ts`, starting the app through its `webServer`
  option; the common UI criteria (360/768/1440 px, keyboard, axe with `@axe-core/playwright`)
  are checked there.
- Scripts: `pnpm test` (Vitest), `pnpm e2e` (Playwright), `pnpm typecheck`
  (`next typegen && tsc --noEmit`), `pnpm lint`, `pnpm build`.

## Considered options
- Jest — rejected: slower TypeScript/ESM setup; Vitest is the lighter option the Next.js docs list.
- Cypress — rejected: Playwright covers several browsers and viewports in one runner and runs
  headless in CI more cheaply.
- Mocking the database in integration tests — rejected: authorization and uniqueness rules are
  exactly what mocks hide.

## Consequences
- Easier: one command per level, matching the pipeline's `Test`, `E2E` and `Typecheck` settings.
- Harder: integration tests need Docker running locally.
- Watch: the end-to-end suite runs once at ship (`E2E stage: ship`), not during each task.
