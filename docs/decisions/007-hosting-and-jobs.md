# ADR 007 — Railway hosting, background jobs as cron-run scripts (no queue)

- Status: accepted
- Date: 2026-09-27
- Scope: framing

## Context
Three kinds of work don't fit a web request: freshness verification (s15, daily), the conversation
retention purge (s16), and source crawling (s18, on demand and optionally scheduled). The PRD puts
Redis/BullMQ and dedicated workers in the graveyard, asks for staging distinct from production, and
recommends Railway.

## Decision
The Next.js app is deployed on Railway, with separate staging and production environments. Background
work is written as plain TypeScript functions in `src/server/jobs/`, run by thin entry scripts in
`scripts/jobs/<name>.ts` (`pnpm job:<name>`, executed with `tsx`), and scheduled with Railway cron
services. An admin "run now" action (s18) calls the same function; nothing long-running runs in a
request unless it is bounded to one source.

## Considered options
- Redis + BullMQ workers — rejected: in the PRD graveyard; volume doesn't justify it.
- Vercel with Vercel Cron — rejected: serverless function time limits don't suit polite crawling
  (≥5 s between requests per domain), and the PRD recommends Railway.
- Running jobs inside the web process with timers — rejected: jobs die with each deploy and run
  once per replica.

## Consequences
- Easier: jobs are ordinary functions, testable with Vitest; no extra infrastructure.
- Harder: each cron service needs the same environment variables as the app.
- Watch: a job must be idempotent and safe to re-run (the verification and crawl criteria assume it).
