# PRD — Postuli.tn

> Transcribed into the killer-saas template from `Postuli_Project_Context_2026-09-25.md` (source of
> truth for the build) and `Postuli_PRD_v2_1_Final_FR.pdf` (detailed requirements). On
> conflict, the context file wins — except the timeline, which the Product Owner reset on
> 27 Sept 2026 to **2.5 weeks** (see Constraints). Complexity scores are proposed by the
> transcription and await Product Owner validation (Firas).

## Target SaaS
Postuli is not a one-to-one clone: it competes with the tools a Tunisian candidate uses today, and
each one is the reference implementation of a part of the loop.
- **TanitJobs / Keejob** (tanitjobs.com, keejob.com) — local job boards: listing, search by criteria, save.
- **Optioncarriere Tunisie** (optioncarriere.tn) — multi-source aggregation of job ads with links to the original source.
- **LinkedIn Jobs** — profile-based recommendations and "why you match" signals.

## Kill mode
**Competing product.** Postuli is sold to candidates (free discovery, premium acceleration later)
and eventually to universities, companies and providers. Scope implication: the MVP must prove
*qualified discovery* better than the alternatives. It does not need feature parity with any of
them.

## Why kill it
- The alternatives show every candidate the same highly visible offers, so competition
  concentrates on them. Relevant opportunities stay scattered across company career pages,
  universities, incubators, communities and informal groups.
- Job boards are organized around their own inventory and criteria search, not around
  multi-source discovery, provenance and novelty.
- Facebook/WhatsApp groups carry fast local signal but are unstructured, unsearchable, with
  variable provenance.
- We do not need their employer side (ATS, paid postings), their social network, or their
  auto-apply.

## Problem
Tunisian final-year students and young graduates concentrate on a limited set of visible
opportunities while other relevant ones remain fragmented outside their field of view. They lose
time repeating the same searches, cannot tell which offers deserve their time, and miss
opportunities that don't circulate in their routine. Why now: 26.6% graduate unemployment (INS,
Q2 2026), 324,564 students, 84.3% internet penetration, and cheap structured LLMs.

## Target users
**Primary MVP persona:** Tunisian final-year student or young graduate (0–3 years' experience),
with an existing CV, actively searching within 30–60 days for a PFE, internship or first job,
with a routine dominated by a few platforms/groups and a limited professional network. Priority
field areas: Grand Tunis, Sfax, Sousse/Monastir (web product open to all of Tunisia).
**Internal operator:** supply/ops team member (Oussama, Firas) who curates sources and reviews
doubtful items.
**Non-targets MVP:** executive recruiting, employer ATS, freelance marketplace, full social
network, autonomous auto-apply, native mobile, multi-country.

## Perimeter — the 20% that matters
### Replicated (core loop)
| Feature | Complexity (1-5) | Why this score |
|---|---|---|
| F1 — Account creation / login (AUTH-01) | 3 | Managed auth + session + strict per-account isolation + rate limiting |
| F2 — CV upload + extraction of essential fields (PROF-01) | 4 | LLM extraction, private file storage, consent, PII minimization, no-invention guard |
| F3 — Minimal Career Profile, viewable and correctable (PROF-02/03) | 2 | Form + persistence; corrections become the reference truth |
| F4 — Corpus from whitelisted sources + admin curation (SUP-01, DATA-01/02/03, ADMIN-01) | 4 | External sources, robots/ToS policy, extraction, normalization, dedupe, freshness, admin role |
| F5 — Conversational search in natural language (CHAT-01/02/03) | 4 | LLM intent extraction to a structured query, context kept across refinements, clarification, fallback |
| F6 — Retrieval + ranking v0 + match explanation (RET-01, RANK-01, EXPL-01) | 4 | Hard constraints, hybrid explainable ranking, grounded LLM explanation behind a Truth Guard |
| F7 — Opportunity Cards with source, freshness and provenance (RES-01, DATA-03) | 2 | Structured display of data already produced |
| F8 — Save / hide + open original source (SAVE-01) | 2 | Per-user persistence, idempotent save |
| F9 — Minimum funnel and supply-quality analytics (AN-01) | 2 | Event log + export |
| F10 — Simplified URL contribution (CONTRIB-01) — **Should, only if capacity remains after P0** | 3 | Reuses the ingestion pipeline with an untrusted submitter |

Scale: 1 trivial CRUD · 2 form + persistence + list · 3 business logic / several states · 4 integrations, payments, roles · 5 real-time, migrations, external systems. A 5 is a graveyard candidate — keep it only if it IS the core value.

Cross-cutting P0 obligations: privacy notice + explicit CV consent, account/data deletion, French
UI with FR/AR request understanding (full RTL later), responsive at 360/768/1440 px.

### Explicitly NOT replicated (graveyard)
- Company Watch, alerts
- Application Copilot / CV tailoring / Application Pack
- Full application tracker
- Networking Copilot
- Provider dashboard, employer pages, campus dashboard, public posting portal
- Payment / Premium (fake-door tests only, outside the product build)
- Native mobile app
- Portfolio generator
- Auto-apply (any form)
- Social network features (feed, connections, messaging)
- Employer ATS, talent marketplace
- LinkedIn scraping or any dependency on it; any CAPTCHA/auth circumvention
- Numeric match percentage (e.g. "87%") before calibration
- Full Arabic UI / RTL
- Microservices, dedicated queue/workers (Redis/BullMQ), Grafana
- Multi-country

### The angle (done differently / better)
- **Novelty, not volume:** up to 5 strong opportunities, ranked for *discovery value* (novelty to
  the user, source rarity, freshness, confidence), including at least one the user would not have
  seen in their routine.
- **Visible provenance:** every opportunity carries its original source, canonical URL and
  freshness; duplicates across sources are merged and every source is kept.
- **Conversation-first, structured underneath:** a free French request ("Je cherche un PFE
  backend à Tunis, idéalement dans une startup") becomes structured criteria; "seulement remote"
  refines without restarting.
- **Truth over generation:** every match reason is grounded in the Career Profile or the
  opportunity; nothing is invented, and a failing LLM falls back to deterministic output.
- **Qualitative match bands** (Très pertinent / Pertinent / À considérer / Faible correspondance)
  instead of false precision.

## Constraints
- **Time:** 2.5 weeks — Day 1 = Sun 27 Sept 2026, release candidate = **Day 18, Wed 14 Oct
  2026**. Capacity 4 people × 4–5 h × 18 days ≈ 290–360 h gross, ~200–250 h usable at 70%;
  critical engineering capacity is mainly one person (Moez). The whole perimeter below ships in
  this window — there is no later "weeks 3–6" phase inside this build.
- **Checkpoint Day 9 (Mon 5 Oct):** if account → profile → CV → chat → opportunities →
  source/save is not stable, all P1 is frozen. Cut order: polish, second ingestion method
  (automated crawl), numeric score, full AR/RTL, everything P1 (incl. F10). Never cut
  provenance, save, instrumentation, profile correction, curation, dedupe, freshness or data
  deletion.
- **Days 17–18:** release gates measured, bugfix only, release candidate on Day 18.
- **Stack (decided 27 Sept 2026, replaces the PRD's React + Vite / Express recommendation):**
  Next.js as frontend and backend (TypeScript, Tailwind, shadcn/ui); Supabase as the integrated
  backend platform — Supabase Auth, PostgreSQL + pgvector through supabase-js with Row Level
  Security, Supabase Storage (private CV bucket); configurable LLM gateway (interchangeable
  provider); Railway hosting; Sentry + structured logs. No microservices. Details and rejected
  options: `docs/architecture.md` and `docs/decisions/` in the code repository.
- **Legal:** Tunisian organic law 2004-63 / INPDP; robots.txt, rate limits and ToS review for
  every source; no long original descriptions copied without a legal basis; takedown process.
- **Brand:** Coral #FF6265 (primary CTA), Navy #192038 (structure), Azure #2563EB (info/source),
  Emerald #10B981 (success), Surface #F8FAFC, Border #E2E8F0; Plus Jakarta Sans (headings), Inter
  (body); clean, light, no "AI glow".

## Success criteria
**Release gates — Day 18 (14 Oct 2026)**
- [ ] 100% of critical P0 requirements Pass; 0 blocker / critical security bug
- [ ] ≥40 controlled active opportunities from 5–10 whitelisted sources
- [ ] Provenance coverage ≥95% of active opportunities
- [ ] CV parsing ≥90% success on essential fields over a 20-CV QA set
- [ ] 0 critical hallucination over a 50-explanation QA set
- [ ] Deduplication ≥95% correct on 30 labelled pairs
- [ ] Funnel analytics verified end to end
- [ ] Privacy notice + CV consent available; source/takedown process documented
- [ ] NFRs: non-AI API p95 <500 ms; chat first feedback p95 <3 s, full answer p95 <6 s; CV
      upload+parse p95 <20 s; onboarding median ≤5 min; 0 cross-account access; P0 flow usable
      at 360/768/1440 px; 0 critical a11y issue on the P0 flow

**Pilot KPIs (the angle, measured)**
| KPI | Target |
|---|---|
| Activation rate | ≥50% |
| Relevance rate (results judged relevant / rated) | ≥60% |
| Novelty acceptance (results "new to me" / rated) | ≥40% |
| Discovery-to-action (activated users who saved/opened source) | ≥30% |
| Time to first qualified opportunity (median) | ≤10 min |
| D7 retention (after sufficient sample) | ≥30% |

North Star: Weekly Qualified Discovery Actions (relevant + new + useful action).
