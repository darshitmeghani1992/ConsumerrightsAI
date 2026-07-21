# Ticket 0.2 — Citation Verification Layer

Design doc, not final code. Hand this to Claude Code as the starting point for the
ticket — it should confirm the approach with you before implementing, per the
"design-first" note in CLAUDE.md's session workflow.

## Problem

`src/lib/ai.ts` currently asks the model, at the prompt level, not to fabricate a
statute/citation it isn't confident about — but nothing actually checks a citation
before it's:
1. shown to the user in the Rights tab, or
2. embedded in a generated demand letter that gets sent to a third party.

A prompt instruction is a soft mitigation. This ticket adds a real check.

## Design goal

Every `law` field the model returns should end up in one of three states before
it's shown:
- **Verified** — matches an entry in our own citation store for that
  category + jurisdiction → shown normally.
- **Unverified but plausible** — no matching entry, but not obviously wrong →
  shown with a "not independently verified" indicator, never blocked outright
  (blocking would mean silently downgrading the plan's usefulness).
- **Flagged** — fails a basic sanity check (e.g., malformed citation format,
  jurisdiction mismatch) → shown with a stronger caveat and logged for human
  review. Never auto-corrected — see CLAUDE.md guardrail #1.

This is intentionally *not* "the model checks itself" — it's a separate,
deterministic lookup against data we control, because the whole point is not to
trust the model's own confidence about its own citation.

## Schema addition (Prisma)

Add to `prisma/schema.prisma`, alongside the existing `Case` model:

```prisma
// A maintained, human-reviewed store of real statutes/regulations we're willing
// to cite confidently. Seeded manually at first category-by-category; growth is
// additive only — see workflow below. Never auto-populated from model output.
model VerifiedCitation {
  id            String   @id @default(cuid())
  category      String   // matches the dispute category values used at intake
  jurisdiction  String   // e.g. "California", "US-Federal", "General" for
                         // jurisdiction-agnostic principles
  lawName       String   // canonical name as it should be displayed to users
  citationText  String?  // optional exact section/citation, only when confident
  summary       String   // plain-English summary, safe to show in a law explainer
  sourceUrl     String?  // link to the actual statute text or official source
  addedBy       String   // human identifier, not "system" — enforces the
                         // no-auto-add rule at the data-entry level
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([category, jurisdiction])
}

// Every citation the model actually produced in a real plan, whether or not it
// matched something in VerifiedCitation. This is what lets 0.2 feed the
// Citation Freshness Monitor (platform monitoring track) later, and is also the
// audit trail regulators/counsel may eventually want to see.
model CitationCheck {
  id                String   @id @default(cuid())
  caseId            String
  lawNameRaw        String   // exactly what the model returned
  jurisdictionRaw   String?
  matchedCitationId String?  // set if it matched a VerifiedCitation row
  status            String   // "verified" | "unverified" | "flagged"
  flagReason        String?  // only set when status = "flagged"
  reviewedByHuman   Boolean  @default(false)
  createdAt         DateTime @default(now())

  case Case @relation(fields: [caseId], references: [id], onDelete: Cascade)
}
```

Also add the inverse relation to `Case`:
```prisma
model Case {
  // ...existing fields...
  citationChecks CitationCheck[]
}
```

## Flow

1. `runIntakeStep()` in `src/lib/ai.ts` returns `result.rights`, each with a
   `law` field, same as today — no change to the AI call itself.
2. **New function** `verifyRights(rights: PlanRight[], category: string,
   jurisdiction: string | null): Promise<VerifiedRight[]>` runs right after
   `normalizeResult()`, before the case is persisted:
   - Looks up `VerifiedCitation` rows matching `category` + `jurisdiction`
     (falling back to `jurisdiction: "General"` entries).
   - Does a simple text-similarity match against `lawName` (exact/near-exact
     match only — this is intentionally not fuzzy AI matching; false positives
     here are worse than false negatives).
   - Classifies each right as verified / unverified / flagged per the rules
     above, and writes a `CitationCheck` row per right.
3. **API route change**: `POST /api/intake/step` persists the `Case` as today,
   plus the `CitationCheck` rows from step 2, and includes a
   `verificationStatus` field per right in the response.
4. **Mobile UI change** (Rights tab in `mobile/src/app/case/[id].tsx`): show a
   small indicator per right based on `verificationStatus` — nothing for
   verified, a subtle "not independently verified" label for unverified, and a
   more visible caveat for flagged. Never hide a right outright.

## What this ticket does NOT include (deliberately out of scope)

- Populating `VerifiedCitation` at scale — starts empty or lightly seeded by a
  human for the top 2-3 dispute categories (e.g., security deposits, since
  that's explicitly called out elsewhere in the app). Filling it out further is
  ongoing content work, not a one-time build task.
- Any automatic writing to `VerifiedCitation` from model output or user
  activity — `addedBy` being a required human identifier enforces this at the
  schema level.
- The Citation Freshness Monitor (rechecking `VerifiedCitation` entries against
  live law over time) — that's a separate platform-monitoring item that
  consumes this schema once it exists, not part of this ticket.

## Open questions for you before implementation

- Who's the initial human populating `VerifiedCitation`? Worth deciding before
  Claude Code builds the admin/entry path — a simple seed script vs. an actual
  internal admin UI are very different scopes.
- Should "unverified" plans still show a recovery estimate/confidence score
  with full confidence, or should heavy unverified-citation presence also
  soften the confidence display? Worth a decision, not an assumption.
