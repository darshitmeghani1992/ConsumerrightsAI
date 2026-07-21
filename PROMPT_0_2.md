Read CLAUDE.md, ROADMAP.md, and CITATION_SCHEMA.md in full before doing anything.

Implement ROADMAP.md ticket 0.2 — the citation verification layer — following
the design in CITATION_SCHEMA.md. Do this in stages, and stop for my
confirmation between each stage rather than doing everything in one shot:

STAGE 1 — Schema
- Add the `VerifiedCitation` and `CitationCheck` Prisma models exactly as
  drafted in CITATION_SCHEMA.md, plus the inverse relation on `Case`.
- Generate the migration but do NOT run it against any real database yet.
- Show me the migration and stop.

STAGE 2 — Verification logic
- Add `verifyRights()` to src/lib/ai.ts (or a new src/lib/citations.ts if that
  keeps ai.ts cleaner — your call, tell me which and why).
- Follow the matching rule from CITATION_SCHEMA.md exactly: exact/near-exact
  text match only, no fuzzy AI-based matching. False positives here are worse
  than false negatives.
- Write tests covering: a right that matches a VerifiedCitation exactly, one
  that doesn't match anything (unverified), and one that fails a basic sanity
  check (flagged) — per CLAUDE.md's testing convention for citation-display
  code paths.
- Stop and show me the diff before wiring it into the API route.

STAGE 3 — API integration
- Wire verifyRights() into POST /api/intake/step, right after the existing
  normalizeResult() call, before the case is persisted.
- Persist the CitationCheck rows alongside the Case in the same
  db.case.create() flow (or a follow-up write if that's cleaner — tell me
  which).
- Include a verificationStatus per right in the API response.
- Stop and show me the diff.

STAGE 4 — Mobile UI
- In mobile/src/app/case/[id].tsx's Rights tab, add a visual indicator per
  right based on verificationStatus: nothing for verified, a subtle
  "not independently verified" label for unverified, a more visible caveat
  for flagged. Never hide a right outright, per CLAUDE.md guardrail #1 — this
  displays information, it never suppresses it.
- Match the existing component patterns in that file rather than introducing
  a new pattern for this.

STAGE 5 — Seed data
- Add a small seed script (not a migration) that inserts a handful of
  VerifiedCitation rows for ONE category to start — security deposit
  disputes, since that's the category referenced elsewhere in the app. Use
  real, correct statute names for a couple of well-known states (e.g.
  California, New York) plus one "General" jurisdiction entry. Set `addedBy`
  to a placeholder human identifier ("seed-data-manual-review-pending") since
  per CITATION_SCHEMA.md this must always be a human identifier, never
  "system".
- Flag clearly that this seed data still needs a human (ideally the person
  from the UPL audit, ticket 0.1) to actually verify the statute names before
  this ships to real users — do not present the seed data as already legally
  verified.

Once all 5 stages are done: open a single PR (not one per stage) with a
description that explicitly calls out this PR touches a CLAUDE.md guardrail
area (citation logic), per the guardrail-flagging convention, even though the
change is additive (it doesn't loosen anything, it adds a check). Update
ROADMAP.md to mark ticket 0.2 as done.

Do not run the migration against a real database, do not merge the PR
yourself, and do not populate VerifiedCitation beyond the flagged
placeholder seed data — all per the boundaries above.
