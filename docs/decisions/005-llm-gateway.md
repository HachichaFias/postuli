# ADR 005 — One internal LLM gateway with schema-validated output

- Status: accepted
- Date: 2026-09-27
- Scope: framing

## Context
Four stories call an LLM: CV extraction (s04), intent extraction (s06), explanations (s11) and page
extraction (s18). The PRD requires an interchangeable provider, a Truth Guard that validates every
structured output, PII minimization, deterministic fallbacks, and tight latency (first feedback
p95 <3 s). The provider will be chosen on measured accuracy and latency, not upfront.

## Decision
Every LLM call goes through a single server-only module, `src/server/llm/`, built on the Vercel AI
SDK (`ai` package plus one provider package). It exposes typed functions that take a zod schema
and return validated output or a typed failure; callers always implement a fallback. Provider and
model come from environment variables (`LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`), so changing
provider is a config change. The gateway enforces a timeout, strips fields not allowed by the
schema, and logs model, latency and validation outcome with the request id — never the prompt's
personal data. The first story that calls a model (s04) adds the packages and picks the initial
provider using the eval scripts.

## Considered options
- Calling a provider SDK directly from each story — rejected: four copies of timeout, validation
  and logging logic, and a provider change touches every story.
- A hosted LLM proxy service — rejected: another vendor and network hop against a 3 s budget.

## Consequences
- Easier: Truth Guard checks live in one place; swapping providers is an env change; tests mock one
  module.
- Harder: provider-specific features (e.g. prompt caching) have to be exposed through the gateway.
- Watch: the eval scripts (`eval:cv`, `eval:intent`, `eval:explanations`) are the evidence for any
  provider or model change.
