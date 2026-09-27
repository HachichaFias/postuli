# Postuli — settings and conventions

**This file is yours. `install.sh` never overwrites it, and `/ks-setup` is its only creator.**
`AGENTS.md` belongs to the method and is rebuilt on every update — write nothing there.

Every value below is read by the pipeline commands. One setting per line, `Name: value`, nothing
else on the line: a command reads the value as everything after the colon, trimmed. Change any of
them at any time.

**After changing anything here, rerun `install.sh`** — it reassembles `AGENTS.md` from the method's
rules plus this file, and `AGENTS.md` is what an agent loads automatically. Settings are also read
straight from here, so those take effect immediately; the conventions at the bottom only reach an
agent through `AGENTS.md`, and stay stale until you reinstall.

## Pipeline settings

```
Merge mode:        pr
Target branch:     main
Plan validation:   human
Ship confirmation: human
Story track:       auto
Flow threshold:    2
Design source:     internal
Design skill:      —
Design tool:       —
Test budget:       25
Verification mode: record
Full suite:        execute-end
E2E stage:         ship
E2E scope:         nominal
E2E browsers:      —
Build stage:       ship-if-route
Issue tracker:     github
Worktree root:     .worktrees/
```

| Setting | Accepted values |
| --- | --- |
| Merge mode | `local` (squash-merged locally, no review platform) · `pr` (a pull request against the target branch) |
| Plan validation | `human` (a checkpoint blocks until you validate) · `autonomous` (the agent validates its own plan) |
| Ship confirmation | `human` (asked before any merge) · `automatic` |
| Design source | `internal` (the agent draws, using `Design skill`) · `external` (a brief goes to `Design tool`) |
| Story track | `auto` (the story's complexity picks the lane) · `full` (always the six-phase pipeline) · `flow` (always `/ks-flow`) |
| Flow threshold | complexity at or below which `auto` picks `/ks-flow` |
| Test budget | tests per story — a plan wanting more says why |
| Verification mode | `record` (the implementer records what it ran; the reviewer checks the record instead of re-running) · `rerun` (the reviewer runs everything itself) |
| Full suite | when the whole unit suite runs: `execute-end` · `ship` · `both` |
| E2E stage | when the end-to-end suite runs: `execute-end` · `ship` · `ci` · `—` |
| E2E scope | how far the end-to-end suite goes; `nominal` is one happy path |
| E2E browsers | browsers for the story cycle, e.g. `chromium`; `—` means the project's own default. Ship always runs them all |
| Build stage | when the production build runs: `ship-if-route` (only when a route or manifest moved) · `ship` · `review` · `ci` · `—` |

## Project commands

```
Package manager:   pnpm
Test:              pnpm test
Typecheck:         pnpm typecheck
E2E:               pnpm e2e
Build:             pnpm build
```

A command left at `—` is one the agents cannot run: they say so rather than guess one.

## Project conventions

Full detail: `docs/architecture.md`; decisions and rejected options: `docs/decisions/` (ADR 001–008).

### Stack
Next.js 16 App Router (TypeScript strict, `@/*` → `src/*`) · Tailwind 4 + shadcn/ui (`base-nova`,
Base UI) · PostgreSQL 17 + pgvector via Drizzle ORM · Better Auth · Supabase Storage (CVs) · LLM
through `src/server/llm/` only · Vitest + Playwright · Railway + cron scripts · pnpm 11.

### Rules
- **Layering:** Route Handler (`src/app/api/`) or Server Component → `src/server/dal/<domain>.ts` →
  Drizzle. Route files stay thin; business logic lives in `src/server/` and is tested there.
- **Server-only:** every module in `src/server/` starts with `import "server-only"`. Only
  `src/server/env.ts` reads `process.env`. Client Components never import from `src/server/`.
- **Authorization:** in the DAL, with the verified session — never only in `proxy.ts` or a layout.
  Another user's resource → 404, wrong role → 403, no session → 401. Return DTOs.
- **API:** mutations are Route Handlers under `/api` (no Server Actions); zod-validate every body;
  400 `{ errors: { field: message } }` with French messages; 429 when rate limited.
- **Data:** Drizzle schema in `src/server/db/schema.ts` is the source of truth; snake_case in SQL,
  camelCase in TS; UUID keys; `timestamptz`; unknown → `null`, never a guess. `pnpm db:generate`
  then `pnpm db:migrate`; commit a migration separately from the story commit.
- **LLM:** only via `src/server/llm/`; zod-validated output; deterministic fallback in every caller;
  never send name, email, phone or address.
- **Events:** `track()` from `src/server/events.ts`; snake_case names from the stories; no PII in props.
- **UI:** Server Components by default, `"use client"` only for interactive leaves. Use
  `src/components/ui/` (add with `pnpm dlx shadcn add <name>`, never hand-edit) and tokens from
  `docs/design-system.md`. User-facing copy in French; code, identifiers and commits in English.
- **Naming:** files kebab-case; components PascalCase; page URLs French (`/profil`, `/recherche`),
  API URLs English (`/api/me/profile`).
- **Tests:** colocated `*.test.ts(x)` (Vitest); DB tests against `DATABASE_URL_TEST` (run
  `pnpm db:up` first); e2e in `e2e/*.spec.ts`; mock the LLM and storage gateways, never the database.
- **Commits:** Conventional Commits with the story id — `feat(s01): candidate sign-up and login`.
- **Local setup:** `cp .env.example .env.local`, `pnpm db:up`, `pnpm db:migrate`, `pnpm dev`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
