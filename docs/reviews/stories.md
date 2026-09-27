# Stories Review — Postuli.tn

> Fresh-context review of `docs/stories.md` against `docs/prd.md`. Each issue classified: critical / major / minor.

## Perimeter coverage
| PRD feature (core loop) | Covered by | OK? |
|---|---|---|
| F1 — Account creation / login (AUTH-01) | s01-candidate-signup | ✅ |
| F2 — CV upload + extraction of essential fields (PROF-01) | s04-cv-upload-profile-prefill | ✅ |
| F3 — Minimal Career Profile, viewable and correctable (PROF-02/03) | s03-career-profile (PROF-02); s05 (profile used as search context, PROF-03); s10 (a correction changes the ranking) | ✅ |
| F4 — Corpus from whitelisted sources + admin curation (SUP-01, DATA-01/02/03, ADMIN-01) | s02 (SUP-01, DATA-01, admin role), s13 (ADMIN-01), s14 (DATA-02), s15 (DATA-03), s18 (automated crawl, which can be frozen: the PRD names it in the cut order as the "second ingestion method") | ✅ |
| F5 — Conversational search in natural language (CHAT-01/02/03) | s05 (rule-based skeleton), s06 (CHAT-01, FR/AR), s09 (CHAT-02 refine, CHAT-03 clarify) | ✅ |
| F6 — Retrieval + ranking v0 + match explanation (RET-01, RANK-01, EXPL-01) | s05 (RET-01), s10 (RANK-01, qualitative bands), s11 (EXPL-01, Truth Guard) | ✅ |
| F7 — Opportunity Cards with source, freshness and provenance (RES-01, DATA-03) | s05 (cards), s07 (detail + provenance), s14 (all sources shown), s15 (freshness in words) | ✅ |
| F8 — Save / hide + open original source (SAVE-01) | s08 (save, hide, undo), s05 / s07 ("Voir la source") | ✅ |
| F9 — Minimum funnel and supply-quality analytics (AN-01) | s17 (export + metrics page), s12 (relevance/novelty feedback), events added in s01, s03–s06, s08, s09 | ✅ |
| F10 — Simplified URL contribution (CONTRIB-01), Should | s19-contribute-opportunity-url (Should, can be frozen) | ✅ |
| Cross-cutting P0: privacy notice + CV consent | s01 (privacy notice), s04 (explicit CV consent) | ✅ |
| Cross-cutting P0: account/data deletion | s16-delete-account-data | ✅ |
| Cross-cutting P0: French UI, FR/AR understanding | Common criteria (French copy), s06 (Arabic aliases, LLM + fallback) | ✅ |
| Cross-cutting P0: responsive 360/768/1440 | Common criteria for every **UI** story | ✅ |

- [x] Every feature of the PRD "Replicated (core loop)" table is delivered by at least one story

## Scope
- [x] No story reintroduces an item from the PRD graveyard ("Explicitly NOT replicated"). Checked: s10 bans any percentage in the UI and keeps the numeric score internal. s15 and s16 use an in-process job or platform cron, with no Redis or BullMQ. s17 uses a plain admin page and CSV, with no Grafana. s18 and s19 refuse LinkedIn and never get around logins or CAPTCHAs. s06 understands Arabic but adds no Arabic UI or RTL. s08's saved list is SAVE-01, not an application tracker. No alerts, Company Watch, Copilot, auto-apply or social features appear.
- [x] No story goes beyond the perimeter. s12 (feedback) sits inside F9/AN-01 and feeds the pilot KPIs the PRD defines (relevance rate, novelty acceptance, North Star).

## Story quality
- [x] Each story is an end-to-end shippable slice, not a technical layer. Shared foundations are built inside the story that first needs them: the event log and request log in s01, the `admin` role and audit log in s02, the fetch policy in s15.
- [ ] Every acceptance criterion can become a test. Almost all can, with a few minor exceptions listed below: s10, s13, s01.
- [x] Agentic notes present and useful (files, constraints, traps). Every story has them, with API surface, PRD references, target reference and traps.
- [x] Complexity scored; no unsplit 5; every 4 states its risk. The 4s are s02, s04, s06, s11 and s18, and each one writes out its risk explicitly. There are no 5s.

## The list as a whole
- [x] Dependency order executable: no cycle, no forward reference in the numbered order. A few dependencies are used but not declared (minor, below).
- [x] Ids well-formed (`s<number>-<slug>`), unique and stable: s01 to s19, no duplicates.
- [x] No overlap or duplication between stories. The layered handoffs are all stated explicitly: s05 then s06 (same intent shape, s05 parser as fallback), s05 then s10 (temporary ordering replaced), s13 and s15 (manual versus automated `inactive`), s02 and s14 (same-source upsert versus cross-source grouping).

## Findings
- minor — s13-admin-review-queue — The takedown criterion says "its opportunities disappear from candidate results on the next search", which needs s05's retrieval. s05 is not declared as a dependency, and the calendar runs s13 on a parallel supply track ("s02, then s13 → s15", Days 1–15). If s13 starts before s05 ships, that criterion cannot be tested yet. Declare s05 as a dependency, or schedule s13 after s05.
- minor — s17-funnel-supply-analytics-export — The ten-event export criterion needs `cv_uploaded` (s04). s04 is not in s17's declared dependencies, directly or through them. The numbered order still works (s04 is #4), but the dependency is undeclared.
- minor — s02-admin-opportunity-import / s13-admin-review-queue — s02 stores every accepted row with `status = active`. s13 later changes this so rows below the *Confidence threshold* become `pending_review`, but neither story says that s13 amends s02's criterion. Also, s02 does not say where `confidence` comes from for a manual CSV import (a column or a default). Its "absent → null" rule leaves open how s13 treats a null confidence against the 0.8 threshold.
- minor — s07-opportunity-detail — `GET /opportunities/{id}` has no criterion for opportunities that are not `active`. s15 covers `inactive`/`expired` ("n'est plus disponible"), but nothing stops a candidate from opening a `pending_review` or `rejected` item (s13) by id. That goes against s13's promise that "only trustworthy items reach candidates". s05's "only active" rule covers search, not the detail endpoint.
- minor — s07-opportunity-detail — The criterion shows `last_verified_at`, but that field is only filled by s15, which comes later, and s02's canonical field list does not include it. Until s15 ships it will show "Non précisé". This is harmless but is an implicit forward reference; s05's "discovered_at or last_verified_at" wording is the safer form.
- minor — s15-freshness-verification — The agentic-notes trap ("only treat a missing JobPosting as removed when the item was extracted from JSON-LD") refers to `extraction_method = jsonld`. That value only exists in s18, which comes later and can be frozen. Before s18, every item is `manual`, so the note should say so.
- minor — s10-ranking-v0-match-bands — "After a profile correction (s03), the next search's ranking reflects it" is vague as a test. It needs a concrete fixture, for example: adding skill X moves an opportunity requiring X above one that does not.
- minor — s13-admin-review-queue — The criterion "`docs/ops/takedown.md` describes how a takedown request is received, the response delay, and the admin action" can be checked by review or by the file existing, not by an automated test. That is acceptable for a release-gate document, but it should be marked as a manual check.
- minor — s01-candidate-signup — "No endpoint accepts another user's id to read their data" is a universal negative. To be testable it needs a stated way to check it, such as a route-inventory test, or it should be narrowed to the endpoints this story creates. Later stories each carry their own ownership criteria.
- minor — s11-grounded-match-explanation — Match reasons are stored per candidate ("Every reason is stored…"), but s11 has no cross-account authorization criterion. The release-gate table also leaves s11 out of the "0 cross-account access" owners (s01, s03, s05, s08, s12).
- minor — s05-search-opportunity-cards — The complexity note says this story has "the most criteria of any story". That is wrong: s05 has 10, s02 has 11 and s04 has 12. Separately, score 3 is low for a story that covers F3, F5, F6, F7 and F8 at once (parser, profile merge, hard-constraint retrieval, cards, events, conversation ownership). Consider a 4 with the walking-skeleton schedule risk written out as its risk.

## Verdict
Max severity: minor
Stories ready: yes
