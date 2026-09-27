# Stories Review — Postuli.tn

> Fresh-context review of `docs/stories.md` against `docs/prd.md`. Each issue is classified as critical, major or minor.

## Perimeter coverage
| PRD feature (core loop) | Covered by | OK? |
|---|---|---|
| F1 — Account creation / login (AUTH-01) | s01 | ✅ |
| F2 — CV upload + extraction of essential fields (PROF-01) | s04 | ✅ |
| F3 — Minimal Career Profile, viewable and correctable (PROF-02/03) | s03 (form, correction, confirmation), s05 (profile used as search context), s04 (prefill feeding the s03 form) | ✅ |
| F4 — Corpus from whitelisted sources + admin curation (SUP-01, DATA-01/02/03, ADMIN-01) | s02 (sources, CSV import, normalization, admin role), s13 (review queue, takedown), s14 (dedupe), s15 (freshness), s18 (crawl, freezable) | ✅ |
| F5 — Conversational search in natural language (CHAT-01/02/03) | s05 (rule-based intent), s06 (LLM intent + fallback, FR/AR), s09 (refine and clarify) | ✅ |
| F6 — Retrieval + ranking v0 + match explanation (RET-01, RANK-01, EXPL-01) | s05 (hard-constraint retrieval), s10 (ranking + bands), s11 (grounded explanation + Truth Guard) | ✅ |
| F7 — Opportunity Cards with source, freshness and provenance (RES-01, DATA-03) | s05 (cards + source link), s07 (detail + provenance), s14 ("Aussi vu sur"), s15 (freshness wording) | ✅ |
| F8 — Save / hide + open original source (SAVE-01) | s08 (save, hide, undo, saved list), s05 and s07 (open source) | ✅ |
| F9 — Minimum funnel and supply-quality analytics (AN-01) | s01 (event log), per-story events, s12 (relevance/novelty feedback), s17 (export + metrics page) | ✅ |
| F10 — Simplified URL contribution (CONTRIB-01), Should | s19 (gated on Day 9 checkpoint and all P0 shipped) | ✅ |

Cross-cutting P0 obligations are also covered:
- Privacy notice: s01.
- Explicit CV consent: s04.
- Account and data deletion: s16.
- French UI: the common criteria.
- FR/AR request understanding: s06.
- Responsive at 360/768/1440 px and a11y: the common criteria on every UI story.
- Takedown process: s13.

Every item on the PRD's never-cut list (provenance, save, instrumentation, profile correction, curation, dedupe, freshness, data deletion) sits in non-freezable stories.

- [x] Every feature of the PRD "Replicated (core loop)" table is delivered by at least one story

## Scope
- [x] No story reintroduces an item from the PRD graveyard ("Explicitly NOT replicated").
  - s10 explicitly forbids any displayed percentage. The internal score is used for ordering only.
  - s15, s16 and s18 exclude queues and workers.
  - s17 excludes Grafana and BI tools.
  - s18 and s19 refuse LinkedIn and any CAPTCHA or auth circumvention.
  - s08's saved list stays a list, not an application tracker.
  - s06 adds Arabic *understanding* only, with no AR UI or RTL.
  - No alerts, auto-apply, social or employer features appear.
- [x] No story goes beyond the perimeter.
  - s12 (feedback) is required by the PRD's own pilot KPIs (relevance rate, novelty acceptance) and the North Star, under AN-01.

## Story quality
- [x] Each story is an end-to-end shippable slice, not a technical layer.
  - The event log, request log and roles are created inside the stories that first need them (s01, s02).
  - Admin-only stories (s02, s13, s17, s18) deliver operator or product-owner value.
- [ ] Every acceptance criterion can become a test. This passes almost everywhere, with a few minor gaps:
  - s06 and s11: "first feedback" is not defined.
  - s13: the takedown doc is a manual check.
  - s17: KPI values are shown without expected values in a fixture.
  - s09: the clarification trigger is worded ambiguously.
- [x] Agentic notes present and useful. Every story has API surface, PRD references, traps, a target reference and release-gate notes.
- [x] Complexity scored; no unsplit 5; every 4 states its risk.
  - Six stories are scored 4, and each states its risk: s02, s04, s05, s06, s11 and s18.
  - s17's 2 looks low (see findings).

## The list as a whole
- [x] Dependency order executable: no cycle, no forward reference in the dependency graph.
  - Every declared dependency points to a lower-numbered story.
  - Layered amendments are explicit and flow forward: s13 amends s02's import, s12 amends s10's novelty, s16 is extended by s19.
  - Two minor ownership and declaration gaps are noted below.
- [x] Ids well-formed (`s<number>-<slug>`), unique and stable: s01–s19, all distinct.
  - One stability risk: s05's conditional split could create an unlisted id at plan time (see findings).
- [x] No overlap or duplication between stories.
  - Shared touchpoints are split by origin or layer, not duplicated:
    - `opportunity_opened` has origin `card` in s05 and `detail` in s07.
    - Freshness moves from a raw date in s05 to wording in s15.
    - Status `inactive` comes from takedown in s13 and from a 404 in s15.

## Findings
- minor — s05-search-opportunity-cards — The complexity note says: "if its plan passes ten tasks, split the conversation persistence out before executing". That hands a breakdown decision to /ks-plan. A split at plan time would create a story id that isn't in `docs/stories.md`, and s09 and s16 depend on conversation persistence. Decide now: either keep it in s05 for good, or split it into its own numbered story before the pipeline starts.
- minor — s05-search-opportunity-cards / s03-career-profile — Traceability mismatch. s05 claims PROF-03 and F3, while s03 (the story that actually makes the profile viewable and correctable) lists only PROF-02. Coverage is not affected, but the PRD-refs column is misleading.
- minor — s02-admin-opportunity-import — The canonical field list in AC4 omits two fields that other criteria rely on:
  - `description`, which AC11 truncates to the *Description excerpt*.
  - `last_verified_at`, which is shown by s05 and s07 and written by s15.
  - Add them to the list, or say which story introduces each column.
- minor — s04-cv-upload-profile-prefill — AC5 pre-fills "first/last name", but the s03 profile form has no name field (roles, skills, locations, remote, types, experiences, education, languages, availability). Either add name to s03 or drop it from s04.
- minor — s13-admin-review-queue — AC2 tests `GET /opportunities/{id}` returning 404 for non-active items. That endpoint is created by s07, which s13 does not declare as a dependency. The calendar already waits on s07, so order is not broken; the declaration is incomplete.
- minor — s15-freshness-verification / s18-whitelist-source-crawl — The "position filled page returns 200" trap is left unowned:
  - s15's notes defer the missing-JobPosting check to "once s18 produces them".
  - No s18 criterion claims it, so JSON-LD items would never be deactivated on removal.
  - Fix: add the check as an s18 criterion.
- minor — s06-natural-language-intent / s11-grounded-match-explanation — "Time to first feedback" and "time to full answer" are recorded and gated (p95 < 3 s / < 6 s), but no criterion defines where the clock starts and stops. For example: submit until chips or cards render, and submit until the last reason renders. As written, the gate cannot be measured unambiguously.
- minor — s09-refine-and-clarify — The AC4 trigger "neither the message nor the profile gives an opportunity type **or** a role/domain" can be read two ways: both missing, or either missing. The follow-up clause ("still missing both") suggests "both". State it explicitly so the test can't pick the wrong reading.
- minor — s17-funnel-supply-analytics-export — AC3 and AC4 list about nine KPI formulas and five supply metrics, but give no fixture with expected values. A test can only assert that they are displayed, not that they are correct. The formulas also point to context §15.2/§15.3, which is outside the PRD.
  - Add one AC like "given the journey fixture, the page shows activation = X, relevance rate = Y…".
  - Complexity 2 looks low for this much KPI business logic. It is closer to 3 on the PRD scale.
- minor — s13-admin-review-queue — The last AC is declared manual (the takedown doc exists). It could become an automated check (the file exists and contains the receive / delay / action sections), or be moved to the release-gate table where it already appears.
- minor — stories-wide (calendar / release-gate table) — Two small wording and scheduling issues:
  - The supply track starts s02 on Day 1 in parallel with s01, but s02 depends on s01 (accounts and roles). Say that s02 starts once s01's role column exists.
  - In the release-gate table, the "Privacy notice, CV consent, takedown process" row puts story ids in the "Measured by" column and "—" in "Instrumentation owned by". The columns are shifted.

## Verdict
No critical and no major issues. The whole PRD perimeter is covered, no graveyard item comes back, no story is a technical layer, the dependency graph has no cycle, and every 4 states its risk. The minor findings are small fixes and don't block the pipeline, but s05's conditional split and the s15/s18 JSON-LD ownership gap are worth fixing before /ks-plan runs on those stories.

Max severity: minor
Stories ready: yes
