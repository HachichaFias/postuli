# User Stories — Postuli.tn

> One story = one shippable slice, written to be executed by an agent.
> Id format: `s<number>-<short-slug>` — reused in every pipeline file and in the branch name.

Source: [docs/prd.md](prd.md). Product UI is **French**; requests are understood in FR (and AR per
decision D1). **Stack:** Next.js (frontend and backend: pages + Route Handlers) with Supabase as
the integrated backend platform — Supabase Auth, Postgres (+ pgvector) accessed with supabase-js,
Row Level Security on every table, Supabase Storage for CVs. Folders and conventions come from
`docs/architecture.md` (`/ks-architect`) — no story assumes a file layout before it exists. API
paths are the PRD §13.3 surface. **Cross-account criteria ("cannot read another candidate's …")
are enforced twice:** an RLS policy on the table, and the ownership check in the server code.

## Calendar — 2.5 weeks

Day 1 = Sun 27 Sept 2026 · **Checkpoint Day 9 = Mon 5 Oct** · **Release candidate Day 18 = Wed 14 Oct**.

| Window | Stories | Exit |
|---|---|---|
| Days 1–9 — core journey | s01 → s08 | PRD §18.3 scenario #1 passes end to end: FR CV → profile → "PFE data Tunis" → cards → open source → save |
| Days 1–15 — supply track (parallel, Oussama + admin) | s02 (Days 1–4), then s13 → s15 once s05, s07 and s08 have shipped | ≥40 active curated opportunities, dedupe and freshness running |
| Days 10–16 — quality, privacy, instrumentation | s09 → s12, s16, s17 | All P0 stories shipped |
| Days 14–16 — only if the Day 9 checkpoint was green | s18, then s19 | — |
| Days 17–18 — release | no new story | Release gates below measured; bugfix only |

**Freeze rule (Day 9).** If s01–s08 are not stable at Day 9, only **s18** (automated crawl — the
PRD's "second ingestion method") and **s19** (F10, a *Should*) are frozen. Every other story is
P0 and continues: s02 alone is enough to reach the corpus gate, and no P0 story depends on s18.

## Pinned values (proposed — Product Owner to confirm)

Acceptance criteria refer to these by name; change a value here, not in the stories.

| Name | Value | Used by |
|---|---|---|
| Password policy | ≥ 8 characters (Supabase Auth `minimum_password_length = 8`) | s01 |
| Auth rate limit | 10 sign-in + sign-up requests per 5 min per IP → HTTP 429 (Supabase Auth `sign_in_sign_ups = 10`; Supabase has no per-email limit) | s01 |
| Description excerpt | ≤ 500 characters | s02 |
| Opportunity types | `pfe`, `stage`, `emploi` (labels PFE, Stage, Emploi) | s02, s03, s05 |
| Known locations | Tunis, Ariana, Ben Arous, Manouba, Sfax, Sousse, Monastir, Nabeul, Bizerte, other | s03, s05 |
| Arabic aliases | تونس → Tunis, صفاقس → Sfax, سوسة → Sousse, المنستير → Monastir, أريانة → Ariana, نابل → Nabeul, بنزرت → Bizerte · تربص → stage, مشروع ختم الدروس → pfe, عمل / وظيفة → emploi · عن بعد → remote | s06 |
| Undo window | 10 s | s08 |
| CV file limit | PDF, ≤ 5 MB | s04 |
| Confidence threshold | 0.8 (below → `pending_review`) | s13, s18 |
| Per-domain fetch delay | ≥ 5 s between requests, user agent `PostuliBot/1.0 (+contact URL)` | s15, s18 |
| Dedupe similarity | same organization + same city + normalized-title similarity ≥ 0.85 (tuned on the 30-pair set) | s14 |
| Verification failures before deactivation | 3 consecutive transient failures | s15 |
| Conversation retention | from config; 90 days recommended (decision D5 still open) | s16 |
| Contributions limit | 10 per candidate per day → HTTP 429 | s19 |

## Common criteria for every story with a candidate or admin screen

Each story marked **UI** below also passes these, verified by its end-to-end test:
- [ ] At 360, 768 and 1440 px wide the story's screens have no horizontal scroll and every action is reachable (NFR-08).
- [ ] Every action is keyboard-reachable, every form field has a label, and an axe scan of the story's screens reports 0 critical issues.
- [ ] All user-facing copy is French.

## Release gates — measured Days 17–18, not per-story tests

Stories own the **instrumentation or script** (a repeatable test); the **threshold** is judged once
at release on real data. Each dataset has an owner and a due date so no story waits on it.

| Gate | Measured by | Instrumentation owned by | Dataset / owner / due |
|---|---|---|---|
| CV parse ≥ 90% on essential fields | `eval:cv` script | s04 | 20 anonymized CVs + expected fields — Oussama — Day 4 |
| Upload + parse p95 < 20 s | parse duration log over the 20 CVs | s04 | same set |
| Chat first feedback p95 < 3 s, full answer p95 < 6 s | per-query timings over 40 fixture queries | s06 (first feedback), s11 (full answer) | 40 FR/AR queries with expected hard constraints — Yasmine — Day 6 |
| Intent hard-constraint accuracy ≥ 95% | `eval:intent` script | s06 | same 40 queries |
| 0 critical hallucination | `eval:explanations` script + human labels | s11 | 50 explanations labelled critical/ok — Firas — Day 14 |
| Dedupe ≥ 95% correct | `eval:dedupe` script | s14 | 30 labelled pairs — Oussama — Day 11 |
| Non-AI API p95 < 500 ms | k6 run on staging from request logs | s01 (request log) | — Moez — Day 17 |
| Onboarding median ≤ 5 min | 10 moderated tests | s03, s04 (timestamps in events) | — Yasmine — Days 16–17 |
| ≥ 40 active curated opportunities, provenance ≥ 95% | s17 supply metrics | s02, s17 | 5–10 approved sources — Oussama — Day 8 |
| Funnel analytics verified E2E | journey fixture test | s17 | — |
| 0 cross-account access | authorization tests in each story | s01, s03, s05, s08, s11, s12 | — |
| Privacy notice, CV consent, takedown process | s01, s04, s13 | — | privacy notice text — Firas — Day 3 |

## Order and dependencies

| # | Id | PRD refs | Cx | Depends on |
|---|---|---|---|---|
| 1 | s01-candidate-signup | F1 · AUTH-01 | 3 | — |
| 2 | s02-admin-opportunity-import | F4 · SUP-01, DATA-01 | 4 | s01 |
| 3 | s03-career-profile | F3 · PROF-02 | 2 | s01 |
| 4 | s04-cv-upload-profile-prefill | F2 · PROF-01 | 4 | s03 |
| 5 | s05-search-opportunity-cards | F3, F5, F6, F7, F8 · PROF-03, RET-01, RES-01 | 4 | s02, s03 |
| 6 | s06-natural-language-intent | F5 · CHAT-01 | 4 | s05 |
| 7 | s07-opportunity-detail | F7 · DATA-03 | 2 | s05 |
| 8 | s08-save-hide-opportunity | F8 · SAVE-01 | 2 | s07 |
| 9 | s09-refine-and-clarify | F5 · CHAT-02, CHAT-03 | 3 | s06 |
| 10 | s10-ranking-v0-match-bands | F6 · RANK-01 | 3 | s05 |
| 11 | s11-grounded-match-explanation | F6 · EXPL-01 | 4 | s10 |
| 12 | s12-relevance-novelty-feedback | F9 · AN-01 | 2 | s10 |
| 13 | s13-admin-review-queue | F4 · ADMIN-01 | 3 | s02, s05 |
| 14 | s14-cross-source-dedupe | F4 · DATA-02 | 3 | s02, s07 |
| 15 | s15-freshness-verification | F4, F7 · DATA-03 | 3 | s02, s08 |
| 16 | s16-delete-account-data | Privacy · NFR-PRIV-01 | 3 | s04, s08, s09, s11, s12 |
| 17 | s17-funnel-supply-analytics-export | F9 · AN-01 | 2 | s04, s09, s12, s14, s15 |
| 18 | s18-whitelist-source-crawl *(freezable)* | F4 · SUP-01 | 4 | s13, s14, s15 |
| 19 | s19-contribute-opportunity-url *(Should)* | F10 · CONTRIB-01 | 3 | s16, s18 |

---

## Story s01-candidate-signup — Create an account and log in
**As a** candidate **I want** to create an account and log in **so that** my profile, searches and saved opportunities are kept between visits. **UI**

### Complexity
3 — managed auth integration, session handling, rate limiting, and the per-account isolation rule every later story relies on.

### Acceptance criteria
- [ ] Signing up with a valid email and a password meeting the *Password policy* creates an account, opens a session and lands on the authenticated home page, which shows the account email and a logout button.
- [ ] Sign-up requires accepting the privacy notice (link visible on the form); without acceptance no account is created.
- [ ] An invalid email or a password below the *Password policy* shows a field error and creates no account.
- [ ] Logging in with an existing account opens a session; wrong credentials show one generic error that does not reveal whether the email exists.
- [ ] The session survives a page reload; logging out invalidates it (a request with the old session is rejected).
- [ ] An unauthenticated visit to any candidate page redirects to login.
- [ ] Exceeding the *Auth rate limit* on login or sign-up returns HTTP 429.
- [ ] The current-user endpoint takes no user id parameter and returns only the caller's own account; a request with another session returns that session's account, never the first one. (Each later story carries its own cross-account criterion for the endpoints it adds.)
- [ ] A `signup_completed` event is recorded with a pseudonymous user id and timestamp, and no email or name in its payload.
- [ ] Every API request is logged with request id, route, status code and duration in ms, and no request body.

### Dependencies
None — first story.

### Agentic notes
- Supabase Auth (email/password) with `@supabase/ssr` cookie sessions; the PRD §13.3 `/auth/register` and `/auth/login` are Route Handlers calling it. Password policy and rate limit are Supabase Auth settings (`supabase/config.toml` locally, dashboard in staging/prod) — set them to the pinned values. Passwords are never stored by us.
- The **event log** (event name, pseudonymous user id, timestamp, JSON properties without PII) is created here because `signup_completed` needs it; every later story appends its own events. RLS: no candidate can read the table; only server code with the secret key writes and reads it. The request log is the data source for the non-AI API p95 gate.
- An app-side `profiles` row (id = `auth.users.id`) holds `role` (`candidate` by default), created on sign-up; s02 adds `admin`. RLS lets a user read only their own row and never change `role`.
- Trap: after logout, verify the old access token is really rejected — authorization checks must validate the session with Supabase Auth, not only decode the JWT locally (a decoded JWT stays valid until it expires).
- Trap: the rate limit is per IP, so a test suite signing users up through the public endpoint trips it from localhost; create test users with the admin API (secret key), and keep public sign-up calls for the tests that assert the 429.
- The home page is a shell: s03 turns it into the onboarding entry point.
- Target reference: TanitJobs / Keejob candidate sign-up.
- Trap: never log passwords, tokens or emails in structured logs or Sentry breadcrumbs.

---

## Story s02-admin-opportunity-import — Register a whitelisted source and import its opportunities
**As an** operator **I want** to register an approved source and import its opportunities into the canonical schema **so that** candidates discover from a controlled, provenance-tagged corpus. **UI** (admin)

### Complexity
4 — **risk:** introduces the `admin` role (an authorization boundary every admin story reuses) and the canonical normalization every ingestion path depends on; a wrong canonical URL rule silently duplicates the corpus.

### Acceptance criteria
- [ ] An operator grants the `admin` role with a command-line script `admin:grant <email>`; no screen or public endpoint can grant it.
- [ ] Only accounts with the `admin` role reach admin pages and endpoints; a candidate receives 403.
- [ ] An operator creates a source with name, base URL, source kind (company, university, incubator, community, job board) and a rights-review status; a source whose rights review is not `approved` cannot receive imports.
- [ ] An operator imports opportunities for a source from a CSV file; each accepted row is stored with the canonical fields: title, type, organization, location, remote_policy, skills[], published_at, valid_through, canonical_url, source_id, discovered_at (set at import), extraction_method = `manual`, confidence, content_hash, status = `active`.
- [ ] `confidence` comes from an optional CSV column (a number from 0 to 1); a row without it gets 1.0, because the operator curated it. This is provenance metadata, not an opportunity fact, so the "null, never a guess" rule doesn't apply to it; a value outside 0–1 rejects the row.
- [ ] A row missing title, type or canonical_url is rejected and reported with its line number; the other rows of the file are imported.
- [ ] Optional fields absent from the input are stored as null, never filled with a default guess.
- [ ] `type` only accepts the *Opportunity types*; any other value rejects the row.
- [ ] Canonical URLs are normalized (lowercase host, no fragment, no `utm_*` parameters) before storage; re-importing the same normalized URL for the same source updates the existing opportunity instead of creating a second one, and the change is recorded in the audit log.
- [ ] Every admin action (source created or edited, import run) writes an audit log entry with actor, action and time.
- [ ] The stored description is cut to the *Description excerpt* length.
- [ ] The admin source list shows each source's count of active opportunities.

### Dependencies
s01 (accounts and roles).

### Agentic notes
- The guaranteed path to the corpus gate (≥40 active opportunities from 5–10 sources, Day 8); Oussama curates the CSVs. s18 (crawl) is optional on top of it.
- Canonical schema: PRD §11.1 / context §7.3. Data rules §11.2: null over invention, no long original description without a legal basis, canonical URL stays attached, no silent rewrite.
- `content_hash` = hash of normalized title + organization + location; s14 uses it for dedupe.
- `admin:grant` runs server-side with the Supabase secret key and updates `profiles.role`; RLS policies on `sources`, `opportunities` and `audit_log` allow writes only to admins, and candidates can read only `active` opportunities.
- Admin screens stay internal and minimal (PRD §13.3); brand styling is enough.
- Target reference: Optioncarriere keeps a source link on every ad; mirror that provenance.

---

## Story s03-career-profile — Fill, correct and confirm my Career Profile
**As a** candidate **I want** to fill in, correct and confirm my Career Profile **so that** recommendations use accurate information, even if I have no CV. **UI**

### Complexity
2 — form + persistence + validation.

### Acceptance criteria
- [ ] After sign-up, the home page shows a "Compléter mon profil" action that opens the profile form.
- [ ] The profile form lets the candidate enter and edit target roles, skills, preferred locations (from *Known locations*), remote preference, opportunity types (from *Opportunity types*), experiences, education, languages and availability.
- [ ] Saved values are still present after logging out and back in.
- [ ] Each field records its origin; values typed by the candidate are `user_entered`.
- [ ] Confirming the profile records a `profile_confirmed` event with the time since `signup_completed`.
- [ ] `PATCH /me/profile` rejects values outside the schema (e.g. an unknown opportunity type) with a field error and saves nothing.
- [ ] A candidate cannot read or modify another candidate's profile (403/404).

### Dependencies
s01 (authenticated candidate).

### Agentic notes
- API: `GET /me/profile`, `PATCH /me/profile`. Career Profile structure: context §8.1. This story creates the profile record; s04 pre-fills it from a CV.
- Profile correction is on the PRD's never-cut list, and deliberately does not depend on the LLM story s04.
- Use chips for skills and locations rather than free-text lists: onboarding median must stay ≤5 min.
- Target reference: TanitJobs / LinkedIn profile edit.

---

## Story s04-cv-upload-profile-prefill — Import my CV to pre-fill my Career Profile
**As a** candidate **I want** to upload my CV as a PDF **so that** Postuli pre-fills my Career Profile without long re-typing. **UI**

### Complexity
4 — **risk:** LLM extraction accuracy, the no-invention guarantee, PII minimization before the model, private file storage.

### Acceptance criteria
- [ ] The home page offers "Importer mon CV" next to the existing profile action, now labelled "Je n'ai pas de CV".
- [ ] The upload control is disabled until the candidate ticks an explicit consent to CV processing; without consent nothing is uploaded or stored.
- [ ] A PDF within the *CV file limit* is accepted; a non-PDF shows "Format non supporté : PDF uniquement" and an oversized file shows "Fichier trop volumineux (5 Mo maximum)"; neither is stored.
- [ ] The file lands in a private bucket: fetching it without a valid signed URL is denied, and another user's session cannot obtain one.
- [ ] After parsing, the profile form from s03 opens pre-filled with first/last name if present, experiences, education, skills and languages, each marked `cv_extracted`.
- [ ] Every extracted item is grounded in the CV text: an item the model returns that does not appear in the extracted text is dropped (fixture CV + mocked model response containing an invented skill).
- [ ] A partially parsed CV pre-fills the fields found and leaves the others empty, marked "à compléter".
- [ ] An unreadable, empty or scanned-only PDF shows "Nous n'avons pas pu lire ce CV" with a link to fill the profile manually, and pre-fills nothing.
- [ ] Re-uploading a CV never overwrites a field whose origin is `user_entered`.
- [ ] The text sent to the model has email, phone number and postal address redacted (asserted on the captured model request).
- [ ] A `cv_uploaded` event is recorded with the parse duration in ms and no CV content.
- [ ] `eval:cv` runs over the 20-CV QA set and prints per-field accuracy and p95 parse duration.

### Dependencies
s03 (profile record, form and field origins).

### Agentic notes
- API: `POST /me/cv` (upload + parse). LLM behind the configurable gateway; validate its JSON against a schema before use.
- Storage: private Supabase Storage bucket `cvs`, object path `<user id>/<cv id>.pdf`; storage RLS policies allow a user only their own folder; downloads only through short-lived signed URLs created by the server.
- Release gates (not test assertions): ≥90% on essential fields, upload + parse p95 <20 s. The 20-CV set is due Day 4 (Oussama), anonymized; never commit a real candidate CV.
- Show progress states during parsing, not a frozen screen.
- PDF only in P0 (PRD §10.2).
- Target reference: LinkedIn "apply with resume" profile prefill.

---

## Story s05-search-opportunity-cards — Search and get opportunity cards
**As a** candidate **I want** to type what I'm looking for and get a few matching opportunity cards with their source **so that** I find relevant opportunities without a filter form. **UI**

### Complexity
4 — **risk:** schedule. This is the walking skeleton of the Day 9 journey and spans five features (F3, F5–F8): rule-based intent, profile merge, hard-constraint retrieval, cards, source link, events and conversation ownership. No LLM (that is s06). Start it no later than Day 5; if its plan passes ten tasks, split the conversation persistence out before executing.

### Acceptance criteria
- [ ] The chat screen asks "Que cherches-tu ?" with example suggestion chips; no filter form is shown.
- [ ] A rule-based parser turns "PFE backend à Tunis" into a structured intent (types = pfe, roles include backend, locations = Tunis) using the *Opportunity types* and *Known locations* dictionaries, and "remote" / "à distance" into remote-only.
- [ ] Criteria absent from the message are taken from the Career Profile (types, locations, skills); a constraint stated in the message overrides the profile.
- [ ] Retrieval applies hard constraints first: no returned opportunity violates an explicit type, location or remote constraint, and only opportunities with status `active` are returned — every other status, present or added later, is excluded.
- [ ] Up to 5 Opportunity Cards are returned (most recent first), each showing title, organization, type, location/remote if known, source name, discovered_at or last_verified_at, and a "Voir la source" link.
- [ ] "Voir la source" on a card opens the canonical URL in a new tab (with `noopener`) and records `opportunity_opened` with the opportunity id and origin `card`.
- [ ] A search with zero matches answers with a broadening suggestion (another city or type) and shows no card.
- [ ] A loading indicator is visible before the response returns (asserted in the E2E test with a delayed response).
- [ ] `query_submitted` and `results_shown` (opportunity ids with their positions) events are recorded.
- [ ] Queries are stored in a conversation owned by the candidate; another candidate cannot read it (403/404).

### Dependencies
s02 (corpus), s03 (Career Profile as context).

### Agentic notes
- This story owns the "only `active` is ever returned" rule; s13 and s15 add statuses and rely on it.
- API: `POST /chat/query`. Intent shape: PRD §9.2 (`opportunity_types`, `roles`, `locations`, `organization_preference`, `start_period`, `hard_constraints`, `soft_preferences`); s06 produces the same shape through the LLM and falls back to this parser.
- Retrieval = SQL filters on hard constraints (a Postgres function called through supabase-js `rpc` if the filter outgrows the query builder; + optional pgvector similarity on role/skills), never LLM-picked items. Ordering is temporary; s10 replaces it.
- Target reference: Optioncarriere / Keejob search results, shown as chat + cards (context §5.1).
- Trap: "Grand Tunis" / "Ariana" vs "Tunis" — map every alias to *Known locations* or hard constraints will over-filter.

---

## Story s06-natural-language-intent — Be understood when I write freely, in French or Arabic
**As a** candidate **I want** Postuli to understand a free-form request **so that** I can phrase my search naturally instead of using keywords. **UI**

### Complexity
4 — **risk:** LLM intent accuracy (gate ≥95% on hard constraints) and latency (first feedback p95 <3 s); the search must keep working when the LLM fails.

### Acceptance criteria
- [ ] A free-form request ("Je cherche un stage en data, plutôt dans une startup, à partir de février") is converted by the LLM into the s05 intent shape, including `organization_preference` and `start_period`.
- [ ] The LLM output is validated against the intent JSON schema; an invalid output falls back to the s05 rule-based parser, and the search still returns.
- [ ] With the LLM unavailable or timing out (simulated), the search uses the rule-based parser and returns results or the zero-result message; the screen never stays blank.
- [ ] The candidate sees the understood criteria as chips above the cards (e.g. "Stage · Data · Startup").
- [ ] An Arabic request is sent to the model as written, and any Arabic value it returns is mapped to canonical values through the *Arabic aliases* (mocked response containing «صفاقس» and «تربص» → location Sfax, type stage).
- [ ] With the LLM unavailable, the rule-based parser also recognizes the *Arabic aliases*: «أبحث عن تربص في صفاقس» yields type stage and location Sfax.
- [ ] The model receives the message plus profile roles and skills only, never name, email or CV text (asserted on the captured model request).
- [ ] Each query records time to first feedback in the `results_shown` event.
- [ ] `eval:intent` runs the 40 FR/AR fixture queries and prints hard-constraint accuracy and p95 timings.

### Dependencies
s05 (intent shape, rule-based fallback, retrieval and cards).

### Agentic notes
- CHAT-01; option D1: FR UI, FR/AR understanding. Release gates: hard-constraint accuracy ≥95%, first feedback p95 <3 s. Fixture queries due Day 6 (Yasmine).
- LLM via the configurable gateway (interchangeable provider); set a timeout well under 3 s and fall back.
- Target reference: none among the targets (they use filter forms); this is part of the angle.

---

## Story s07-opportunity-detail — See an opportunity's full detail and provenance
**As a** candidate **I want** to open an opportunity's detail **so that** I can evaluate it and see exactly where it comes from. **UI**

### Complexity
2 — read view + outbound link + event.

### Acceptance criteria
- [ ] "Voir" on a card opens a detail view with every known canonical field, the source list (name, canonical URL, discovered_at), and last_verified_at when known; unknown fields show "Non précisé".
- [ ] "Voir la source" in the detail opens the canonical URL in a new tab and records `opportunity_opened` with origin `detail`.
- [ ] An unknown opportunity id shows a not-found page, not a crash.
- [ ] `GET /opportunities/{id}` requires an authenticated session.

### Dependencies
s05 (cards to open from).

### Agentic notes
- API: `GET /opportunities/{id}` (detail + provenance). Provenance display is on the PRD's never-cut list.
- The source list is a list from day one even with one entry: s14 adds secondary sources. The "no longer active" state arrives with s15.
- Target reference: Optioncarriere redirects to the original ad; Postuli shows provenance first.

---

## Story s08-save-hide-opportunity — Save or hide an opportunity
**As a** candidate **I want** to save opportunities to come back to and hide the ones that don't interest me **so that** I can act on the good ones and stop seeing the others. **UI**

### Complexity
2 — per-user persistence and a list.

### Acceptance criteria
- [ ] "Sauvegarder" on a card or detail saves the opportunity and records `opportunity_saved`; the saved state persists after logging out and back in.
- [ ] Saving an already saved opportunity does not create a duplicate (idempotent).
- [ ] Removing a save (`DELETE /opportunities/{id}/save`) removes it from the saved list.
- [ ] The saved-list page (`GET /me/saved`) shows the candidate's saved opportunities.
- [ ] "Masquer" removes the card from the current results and excludes that opportunity from all of the candidate's later searches; an "Annuler" action available for the *Undo window* restores it.
- [ ] A save or hide failure shows "Action impossible, réessaie" and leaves the previous state unchanged.
- [ ] Candidate A calling candidate B's saved list, save or hide endpoints gets 403/404.

### Dependencies
s07 (detail view the saved list links to).

### Agentic notes
- Hide has no PRD endpoint: add one next to save, with the same ownership rule. This story owns "hidden is excluded from results"; later ranking changes must keep that test green.
- Closes the Day 9 core journey: PRD §18.3 scenario #1 must pass end to end here.
- Target reference: TanitJobs / LinkedIn "save job".

---

## Story s09-refine-and-clarify — Refine my search without repeating myself
**As a** candidate **I want** to refine my search in follow-up messages, and be asked for clarification only when truly needed, **so that** I don't have to repeat everything. **UI**

### Complexity
3 — conversational state with several transitions (refine, replace, reset, clarify).

### Acceptance criteria
- [ ] After "PFE backend à Tunis", sending "seulement remote" keeps type and role, adds remote-only, and updates the results.
- [ ] Then "et à Sfax ?" changes the location to Sfax while keeping type, role and the remote constraint.
- [ ] "nouvelle recherche", or the "Nouvelle recherche" button, starts from an empty context.
- [ ] When neither the message nor the profile gives an opportunity type **or** a role/domain (the essential constraints), Postuli asks exactly one clarification question with suggestion chips before searching; a second answer still missing both runs the search with profile defaults instead of asking again.
- [ ] Each clarification records a `clarification_asked` event.
- [ ] The current search context survives a page reload.
- [ ] Each refinement records `query_submitted` with `refinement: true`.

### Dependencies
s06 (intent produced from free text; follow-ups are applied to it).

### Agentic notes
- PRD §9.2: a follow-up modifies the current state; it does not restart the search. Keep the structured intent as conversation state and apply each follow-up as a patch.
- Risk trigger (context §24): clarification rate >30% — s17 reports it from `clarification_asked`.
- Target reference: none among the targets (filter forms); part of the angle.

---

## Story s10-ranking-v0-match-bands — Get results ordered by fit, with a relevance band
**As a** candidate **I want** results ordered by how well they fit my profile and request, with a clear relevance band, **so that** I can prioritize. **UI**

### Complexity
3 — business logic combining several signals, explainable and logged.

### Acceptance criteria
- [ ] Every result in `results_shown` carries a contribution for each factor: type/role match, skills overlap between profile and opportunity, location/remote fit, freshness, source confidence, source rarity and novelty to the user.
- [ ] Source rarity is higher for an opportunity whose sources are all non-job-board kinds (company, university, incubator, community) than for one listed on a job board, all else equal.
- [ ] When the matching set holds at least one opportunity that is unseen by the candidate and not listed on a job board, at least one such opportunity is among the 5 cards (fixture: 6 equal matches, 5 already seen or job-board-only, 1 unseen from a company page → it is shown).
- [ ] Each card shows exactly one band: Très pertinent, Pertinent, À considérer or Faible correspondance; no percentage is shown anywhere in the UI.
- [ ] The ranking version is stored with `results_shown`.
- [ ] Fixture: with a profile containing Node.js and PostgreSQL, an opportunity requiring both ranks above one requiring neither, all other factors equal.
- [ ] An opportunity already shown to the candidate in an earlier search ranks below an equally matching unseen one; unseen ones carry the label "Nouvelle pour toi".
- [ ] A skill absent from both the profile and the opportunity data contributes nothing to the score.
- [ ] Fixture: after the candidate adds the skill Docker to their profile (s03), an opportunity requiring Docker ranks above an otherwise identical one that doesn't, in the next search.

### Dependencies
s05 (retrieval and cards).

### Agentic notes
- PRD §9.3 / §9.5 option B: an internal score for ordering, bands only on screen. Band thresholds and factor weights are hypotheses (context §9.4): keep them in one config object, marked experimental.
- Deterministic first; an optional LLM rerank must never be required for a result.
- Target reference: LinkedIn "top job picks for you", without the pseudo-precise %.

---

## Story s11-grounded-match-explanation — Understand why an opportunity is proposed to me
**As a** candidate **I want** to see why each opportunity matches me, and what I may be missing, **so that** I can trust and prioritize it. **UI**

### Complexity
4 — **risk:** LLM hallucination (gate: 0 critical over 50 explanations) and the full-answer latency (p95 <6 s).

### Acceptance criteria
- [ ] Each card shows up to 4 match reasons and up to 2 gaps (e.g. "△ Docker demandé"); when fewer than 2 grounded reasons exist, it shows the ones available followed by "Information non disponible".
- [ ] Every reason is stored with the profile field and the opportunity field it relies on.
- [ ] A candidate cannot read another candidate's stored match reasons (403/404).
- [ ] The Truth Guard rejects any model output citing a skill or experience absent from the Career Profile, and the card falls back to deterministic reasons (mocked response containing an invented candidate skill).
- [ ] The Truth Guard rejects any reason or gap citing a requirement absent from the opportunity's fields, and the card falls back to deterministic reasons (mocked response with the gap "Docker demandé" on an opportunity that never mentions Docker).
- [ ] Model output failing JSON-schema or allowed-field validation falls back to deterministic reasons.
- [ ] With the LLM unavailable, cards still show deterministic reasons.
- [ ] The model receives skills, roles and experience titles only, never name, email or phone (asserted on the captured model request).
- [ ] Time to full answer, reasons included, is recorded in `results_shown`.
- [ ] `eval:explanations` generates explanations for the 50-case QA set and exports them for human labelling.

### Dependencies
s10 (per-factor match signals the reasons are built from).

### Agentic notes
- Truth Guard (PRD §12.4): JSON Schema → allowed fields → grounding check → confidence/fallback. Deterministic reasons come from s10's factor contributions (e.g. "✓ Node.js", "✓ Tunis").
- Card layout reference: context §10 example.
- Generate explanations only for the ≤5 shown cards, in parallel; render cards first, reasons after.
- Release gate: 0 critical hallucination on the 50 labelled explanations (labels by Firas, Day 14).
- Target reference: LinkedIn "how you match" skills list.

---

## Story s12-relevance-novelty-feedback — Tell Postuli whether a result is relevant and new to me
**As a** candidate **I want** to mark a result as relevant or not, and new to me or already seen, **so that** Postuli learns and shows me better discoveries. **UI**

### Complexity
2 — two inputs per card, persistence and events.

### Acceptance criteria
- [ ] Each card offers "Pertinent ?" (oui / non) and "Nouveau pour moi ?" (oui / je l'avais déjà vue).
- [ ] An answer records `relevance_feedback` or `novelty_feedback` with the opportunity id, the value and the query id.
- [ ] Changing an answer replaces the previous one for that candidate, opportunity and query; the latest answer is shown after reload.
- [ ] An opportunity marked "je l'avais déjà vue" is not labelled "Nouvelle pour toi" in later searches and loses the novelty factor in ranking.
- [ ] A candidate cannot read or write another candidate's feedback (403/404).

### Dependencies
s10 (novelty factor in ranking).

### Agentic notes
- Feeds the pilot KPIs: relevance rate ≥60%, novelty acceptance ≥40%, and the North Star (Weekly Qualified Discovery Actions).
- One tap each; no free-text feedback form.
- Target reference: none among the targets; part of the angle.

---

## Story s13-admin-review-queue — Review doubtful opportunities and take down sources
**As an** operator **I want** to approve, correct or reject doubtful opportunities and take down an opportunity or a source **so that** only trustworthy items reach candidates. **UI** (admin)

### Complexity
3 — several states (`pending_review`, `active`, `rejected`, `inactive`), source-level takedown, audit.

### Acceptance criteria
- [ ] This story amends s02's import: a row whose `confidence` is below the *Confidence threshold*, or that the operator flags "à vérifier", is stored as `pending_review` instead of `active`.
- [ ] A candidate requesting the detail of a `pending_review` or `rejected` opportunity by id (`GET /opportunities/{id}`) gets 404; an admin can still open it.
- [ ] The review queue lists `pending_review` items with source, fields, confidence and a link to the original page.
- [ ] Approving (optionally after editing fields) sets the item `active`; rejecting with a reason sets it `rejected`.
- [ ] An operator can deactivate an active opportunity or a whole source (takedown); its opportunities disappear from candidate results on the next search.
- [ ] Every decision and takedown writes an audit log entry with actor, action, reason and time.
- [ ] *(Manual check at review, not an automated test)* `docs/ops/takedown.md` describes how a takedown request is received, the response delay, and the admin action that executes it.

### Dependencies
s02 (sources, import, admin role, audit log), s05 (candidate retrieval, needed to test that a takedown removes results).

### Agentic notes
- ADMIN-01. Exclusion of non-active items from results is s05's rule; s18 (crawl) only feeds the queue.
- The takedown doc backs the release gate "source/takedown process documented".
- Target reference: none among the targets expose curation; closest is a job board's moderation back office.

---

## Story s14-cross-source-dedupe — See each opportunity once, with all its sources
**As a** candidate **I want** an opportunity listed by several sources to appear once, with every source visible, **so that** results aren't cluttered and I can see how widely it circulates. **UI**

### Complexity
3 — matching rules with a measurable accuracy gate and history preservation.

### Acceptance criteria
- [ ] At ingestion, two records with the same normalized canonical_url, the same content_hash, or a match under the *Dedupe similarity* rule are grouped into one opportunity.
- [ ] The card and the detail view show one entry listing every source ("Aussi vu sur …").
- [ ] A regroup command applies the same rule to opportunities already stored before this story shipped, and reports each group it creates.
- [ ] Grouping deletes no source record; each source's discovered_at stays traceable.
- [ ] An operator can split a wrong grouping back into separate opportunities, with an audit log entry.
- [ ] `eval:dedupe` runs over the 30 labelled pairs and prints the share of correct decisions.

### Dependencies
s02 (two sources imported by CSV already produce cross-source duplicates), s07 (detail view with a source list).

### Agentic notes
- DATA-02; data rule §11.2 #4: dedupe merges references, not history. Runs on every ingestion path (s02 now, s18 if built).
- Release gate: ≥95% correct on the 30 pairs (Oussama, Day 11). SLO: duplicate leakage ≤5%.
- Target reference: Optioncarriere shows the same ad from several boards; Postuli merges them.

---

## Story s15-freshness-verification — Only see live opportunities, with their freshness
**As a** candidate **I want** expired or removed opportunities kept out of my results, and each result's freshness visible, **so that** I don't waste time on dead offers. **UI**

### Complexity
3 — scheduled verification with several states and failure tolerance; introduces the polite-fetch policy.

### Acceptance criteria
- [ ] A daily verification job re-checks the canonical_url of active opportunities; a URL disallowed by robots.txt is skipped and logged, and requests respect the *Per-domain fetch delay* and user agent.
- [ ] A successful check updates last_verified_at; a 404/410 sets the opportunity `inactive`; a passed valid_through sets it `expired`.
- [ ] A timeout or 5xx does not deactivate on first occurrence; only after the *Verification failures before deactivation* count in a row.
- [ ] In the saved list and the detail view, inactive and expired opportunities show "Cette opportunité n'est plus disponible" (their exclusion from results is s05's rule).
- [ ] Cards show freshness in words ("Vérifiée aujourd'hui", "Vérifiée il y a 3 jours").
- [ ] Each run records per source the number of checks attempted and succeeded.

### Dependencies
s02 (corpus), s08 (saved list).

### Agentic notes
- DATA-03; data rule §11.2 #6. SLO: stale rate ≤10%. No queue infrastructure (graveyard): an in-process scheduled job or a platform cron.
- The fetch policy (robots.txt, delay, user agent, no login/CAPTCHA) is built here as a reusable helper; s18 reuses it.
- Trap: some career pages return 200 on a "position filled" page. Until s18 exists every item is `extraction_method = manual`, so a 200 means live; the extra check (a missing JobPosting means removed) applies only to items with `extraction_method = jsonld`, once s18 produces them.
- Target reference: Optioncarriere / TanitJobs expire ads by date only; Postuli re-verifies the source.

---

## Story s16-delete-account-data — Delete my account and my data
**As a** candidate **I want** to delete my account and all my personal data **so that** I stay in control of my information. **UI**

### Complexity
3 — deletion across auth, storage and several tables, plus a retention purge.

### Acceptance criteria
- [ ] Account settings offer "Supprimer mon compte" behind an explicit confirmation.
- [ ] Deletion removes the auth account, the CV file in storage, the Career Profile, conversations and their search context, stored match reasons (s11), saves, hides and feedback.
- [ ] Events already recorded, including `results_shown` with its per-factor contributions, keep only the pseudonymous id, unlinked from any account.
- [ ] After deletion, logging in with the old credentials fails and previously issued CV signed URLs no longer work.
- [ ] A failure midway leaves the deletion retryable, and a retry completes it without an orphan CV file.
- [ ] A purge job deletes conversations inactive for longer than the *Conversation retention* value.

### Dependencies
s04 (CV file), s08 (saves, hides), s09 (conversation context), s11 (stored match reasons), s12 (feedback).

### Agentic notes
- NFR-PRIV-01; law 2004-63 / INPDP (context §19). Retention is decision D5, still open: read it from config.
- Deletion uses the Supabase admin API (`auth.admin.deleteUser`) and removes the user's `cvs/<user id>/` folder from Storage; app tables reference `auth.users` with `on delete cascade` where the data must go, and events keep only the pseudonymous id.
- s19, if built, adds contributions to this deletion.
- Target reference: TanitJobs / LinkedIn account closure.

---

## Story s17-funnel-supply-analytics-export — Export funnel and supply-quality metrics
**As the** product owner **I want** to see and export the funnel and supply-quality metrics **so that** I can take the Go / Adjust / Stop decision at release. **UI** (admin)

### Complexity
2 — aggregations and a CSV export behind the admin role.

### Acceptance criteria
- [ ] An admin can export the event log as CSV with pseudonymous user ids and no email, name or CV content.
- [ ] After running the end-to-end journey fixture, the export contains all ten events: signup_completed, cv_uploaded, profile_confirmed, query_submitted, results_shown, opportunity_opened, opportunity_saved, relevance_feedback, novelty_feedback, clarification_asked.
- [ ] An admin page shows funnel counts per step and: activation rate (activated = profile confirmed + ≥1 search + ≥3 results shown + ≥1 marked new + ≥1 save or source open, per context §15.3), relevance rate, novelty acceptance, discovery-to-action, median time from sign-up to first save or source open, D7 retention, Weekly Qualified Discovery Actions (actions on opportunities marked relevant and new, over 7 days), and clarification rate.
- [ ] The same page shows supply quality: active opportunity count, provenance coverage (%), duplicate groups, stale rate, and last-run verification success per source.
- [ ] A candidate calling the export or metrics endpoints receives 403.

### Dependencies
s04 (`cv_uploaded`), s09 (`clarification_asked`), s12 (feedback events), s14 (duplicate groups), s15 (stale rate, verification runs).

### Agentic notes
- AN-01; KPI formulas: context §15.2. "Funnel analytics verified E2E" and provenance ≥95% are release gates; the journey fixture test is the proof.
- No Grafana or BI tool (graveyard): a plain admin page + CSV.
- Target reference: none among the targets (internal tooling).

---

## Story s18-whitelist-source-crawl — Fetch a whitelisted source automatically *(freezable)*
**As an** operator **I want** to fetch an approved source automatically **so that** the corpus grows without manual CSV entry. **UI** (admin)

### Complexity
4 — **risk:** heterogeneous pages and LLM extraction confidence. The PRD's "second ingestion method": frozen first if the Day 9 checkpoint slips; no P0 story depends on it.

### Acceptance criteria
- [ ] An operator can run a fetch on demand for a source whose rights review is `approved`; other sources cannot be fetched.
- [ ] Fetching uses the s15 fetch policy: robots.txt disallow is skipped and logged, the *Per-domain fetch delay* is respected, and a page requiring login or a CAPTCHA is skipped, never circumvented.
- [ ] A page exposing schema.org `JobPosting` JSON-LD is extracted deterministically (`extraction_method` = `jsonld`); otherwise the page text is extracted by the LLM into the canonical schema (`extraction_method` = `llm`) with a confidence value.
- [ ] Items at or above the *Confidence threshold* become `active`; items below enter the s13 review queue as `pending_review`.
- [ ] Every item passes the s02 normalization and the s14 dedupe; re-running a source creates no second record for a posting already stored.
- [ ] Each run logs fetch and extraction errors with source id and request id, and records attempted/succeeded fetch counts.

### Dependencies
s13 (review queue), s14 (dedupe on ingest), s15 (fetch policy).

### Agentic notes
- Pipeline: context §7.1 / PRD §11.3. Reuse s02 normalization; don't fork it. No Redis/BullMQ.
- Never LinkedIn, never behind auth (decision D6). SLO: source fetch success ≥85%.
- Target reference: Optioncarriere's aggregation, restricted to a whitelist.

---

## Story s19-contribute-opportunity-url — Contribute an opportunity by URL *(Should)*
**As a** candidate **I want** to submit the URL of an opportunity I found **so that** the Postuli network discovers supply beyond the crawler. **UI**

### Complexity
3 — reuses the crawl pipeline, with an untrusted submitter and anti-abuse rules. **Should:** only if the Day 9 checkpoint was green and every P0 story has shipped (decision D3).

### Acceptance criteria
- [ ] A candidate submits a URL from an "Ajouter une opportunité" form; a malformed URL is rejected with a field error.
- [ ] The URL is fetched under the s15/s18 fetch policy; a LinkedIn URL or a refused fetch shows the candidate the reason ("Source non prise en charge", "Page inaccessible").
- [ ] Every contribution lands as `pending_review`, never directly `active`, with the contributor recorded.
- [ ] A URL matching an existing opportunity answers "déjà connue" and links the contribution to it instead of creating a new record.
- [ ] Beyond the *Contributions limit*, submissions are refused with HTTP 429.
- [ ] Deleting an account (s16) unlinks the contributor from all their contributions.

### Dependencies
s16 (account deletion to extend), s18 (fetch and extraction pipeline).

### Agentic notes
- CONTRIB-01. Contribution attribution UI and source reputation are P1: record the contributor only.
- Hybrid-phase target: ≥30% of new opportunities from contributions (hypothesis).
- Target reference: none among the targets accept candidate-submitted ads; closest is sharing a link in a Facebook group.
