# ADR 001 — Next.js full-stack app with Tailwind and shadcn/ui

- Status: accepted
- Date: 2026-09-27
- Scope: framing

## Context
Postuli must ship its whole P0 perimeter (19 stories) in 2.5 weeks (release candidate 14 Oct 2026),
with most engineering capacity coming from one person. The PRD (§13.2 / context §18) recommends
React 19 + Vite for the web app and a separate Node 24 + Express API, but labels it a
recommendation, not an irreversible decision. killer-saas works fastest on top of a boilerplate
whose conventions agents can extract. No boilerplate existed.

## Decision
One Next.js 16 application (App Router, `src/` directory, TypeScript strict) serves both the UI
and the HTTP API, scaffolded with `create-next-app` and styled with Tailwind CSS 4 and shadcn/ui.
Pages read data through Server Components; client mutations and every endpoint named in the
stories go through Route Handlers under `/api`.

## Considered options
- React 19 + Vite SPA + Express API (PRD recommendation) — rejected because it means two apps to
  scaffold, wire (CORS, auth cookies across origins), deploy and keep in sync, all on the critical
  engineer's time, with no boilerplate to start from.
- ship-saas.now or another purchased boilerplate — rejected because nobody on the team owns one
  and setting one up costs days the calendar doesn't have.
- Blank repo with the stack recorded only as ADRs — rejected because the first story would build
  every foundation and agents would have no conventions to follow.

## Consequences
- Easier: one deployment, one type system from database to UI, shadcn/ui components for every
  screen, server-side authorization close to the data (Data Access Layer).
- Harder: Next.js 16 differs from older versions (Middleware is now `proxy.ts`; read
  `node_modules/next/dist/docs/` before coding). Long-running work (crawl, verification) must not
  run inside a request: see ADR 007.
- Watch: keep business logic in `src/server/`, not in route files, so it stays testable and
  movable if an API split is ever needed.
