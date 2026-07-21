# ROADMAP.md — Consumer Rights AI

Phased backlog, ordered by risk/dependency first, priority second. Work top-down
within the current phase. Do not skip ahead to a later phase without flagging it —
see CLAUDE.md for why the order matters.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked/needs human input

---

## Codebase review note (as of this update)

The app was reviewed against this roadmap. Already built, ahead of where a fresh
project would be:
- Auth (bcrypt + random session tokens + expiry), dual cookie/bearer sessions.
- Case ownership checks on the API (404 on mismatch, no existence leak).
- AI intake engine with a working out-of-scope guard (criminal/family-law/
  immigration/personal-injury/emergency) and a system-prompt-level instruction not
  to fabricate unfamiliar statute numbers — this is a *soft* mitigation, not the
  verification layer described in 0.2 below, which is still needed.
- All 8 Case Workspace tabs, including an honest empty state for Similar Situations.
- CI (typecheck/lint/build) for both backend and mobile via GitHub Actions.
- No `.git` history yet — the reviewed copy was a zip export, not a cloned repo.
  **Action: `git init`, commit, push to GitHub before anything else** — this blocks
  PR-based workflows and Claude Code on the web.

Confirmed gaps, matching Phase 0 below: no citation verification store, no
deletion/retention flow, no misuse detection, no rate limiting on
`/api/intake/step`. Rate limiting added to 0.4 below since it's the same general
"is this abuse" surface as misuse detection.

---

## Phase 0 — Risk containment (do this before adding new user-facing features)

- [ ] **0.1 UPL exposure audit** — `[!] human task, not code`. Get legal review of
      demand-letter generation and confidence scoring per state. Blocks 0.2 in spirit
      (verification source should reflect what counsel says is safe to show).
- [~] **0.2 Citation verification layer** — schema drafted (see CITATION_SCHEMA.md),
      not yet implemented. Build an internal store of verified statute citations per
      category/state. Any citation shown to a user or included in a generated
      document must be checked against this store; unverified citations get
      flagged, not shown confidently. Schema + API + flagging UI.
- [ ] **0.3 Data retention & deletion policy implementation** — `[!] policy itself is
      a human decision`. Once written: build delete-my-account and delete-my-case
      flows, and enforce retention windows in the DB layer.
- [ ] **0.4 Basic misuse detection + rate limiting** — lightweight checks for
      contradictory answers or fabricated-looking details during intake, plus rate
      limiting on `/api/intake/step` (currently uncapped — real cost and abuse
      exposure since it's a direct Anthropic API call per request). Flag only for
      misuse; no auto-blocking without human review of the flagged pattern first.

## Phase 1 — Make the existing plan usable end to end

- [ ] **1.1 Deadline extraction + tracking** — surface dates already produced by the
      timeline as trackable deadlines (DB model: `deadlines` table linked to case).
- [ ] **1.2 Push reminders** — notification job (cron/queue) that checks upcoming
      deadlines and sends reminders at sensible intervals (e.g., 7/3/1 day out).
- [ ] **1.3 PDF export of demand letter** — cheapest send/export mechanism first.
- [ ] **1.4 Email send flow** — send the letter directly from the app.
- [ ] **1.5 Certified-mail integration** — evaluate a provider (e.g., Lob), likely a
      paid-tier feature.
- [ ] **1.6 Action plan progress tracking** — checkboxes per step, "next up" logic
      already exists per FEATURES.md — extend with persistence and a
      behind-schedule nudge tied to 1.2's deadline data.

## Phase 2 — Strengthen the case

- [ ] **2.1 Evidence upload (storage + display only)** — photos/PDFs, no AI
      processing yet. Get storage/security right first (ties to Phase 0.3).
- [ ] **2.2 Auto-extraction from uploads** — pull dates/facts from leases, denial
      letters, emails into the timeline. Extracted facts should be flagged for user
      confirmation before silently reshaping the case (same caution as citations).
- [ ] **2.3 Evidence strength score** — derived metric from described + uploaded
      evidence.

## Phase 3 — Make "Similar Situations" real

- [ ] **3.1 Outcome feedback collection** — prompt on older cases (30/60 days post-
      plan) asking what happened. Store as structured outcome data.
- [ ] **3.2 Integrate one external dataset** — start with CFPB complaint database
      (free, structured). Validate sourcing/citation requirements before adding more.
- [ ] **3.3 Add further datasets** — CourtListener, state AG, BBB — one at a time,
      after 3.2 is validated.
- [ ] **3.4 Aggregate platform outcome data** — once 3.1 has real volume, layer
      anonymized internal comparables alongside external data. `[!]` aggregated
      stats need human review before going live (per CLAUDE.md guardrails).

## Phase 4 — Trust & transparency

- [ ] **4.1 Confidence score breakdown UI** — show the factors behind the score.
      Depends on 0.2 (citation verification) being in place first.
- [ ] **4.2 Plain-language law explainers** — per verified citation from 0.2.

## Phase 5 — Guidance expansion

- [ ] **5.1 Jurisdiction selection at intake** — state/country picker, changes which
      citations/rights apply. Prerequisite for Phase 6 category expansion.
- [ ] **5.2 "5 things to ask a lawyer"** — per-case generated (same pattern as
      intake follow-up questions), can be pulled forward if wanted as a quick win —
      low risk, no dependencies.
- [ ] **5.3 Lawyer handoff / referral** — expand out-of-scope path into a real
      handoff; also offer as an option on any case, not just out-of-scope ones.

## Phase 6 — Reach and monetization

- [ ] **6.1 New dispute categories** — landlord-tenant beyond deposits, wage/hour,
      etc. Requires 5.1 (jurisdiction-awareness) first.
- [ ] **6.2 Multi-case dashboard**
- [ ] **6.3 Shareable read-only case summary**
- [ ] **6.4 Templates library** — mediation request, small-claims prep, complaint
      filings.
- [ ] **6.5 Pricing tiers** — free intake/plan, paid send/tracking/lawyer handoff.
      Depends on 1.4/1.5 (send flow) and 5.3 (lawyer handoff) existing to charge for.

---

## Platform monitoring (separate track — see prior design discussion)

Not part of the phased build above, but referenced by it. Build these once the
areas they monitor exist:

- [ ] Deadline & Reminder job runner (build alongside 1.2)
- [ ] Data Retention Enforcer (build alongside 0.3)
- [ ] Misuse/Anomaly Detector as scheduled job, not just intake-time (build after 0.4)
- [ ] Citation Freshness Monitor (build after 0.2)
- [ ] External Dataset Sync job (build after 3.2)
- [ ] Central human review queue/dashboard for all of the above flags
