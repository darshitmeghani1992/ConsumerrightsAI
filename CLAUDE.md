# CLAUDE.md — Project Guide for Consumer Rights AI

This file is read automatically by Claude Code at the start of every session in this
repo. It exists so any session — today or six months from now — has full context
without the human re-explaining the product each time.

---

## What this product is

An AI-powered consumer-rights and dispute-recovery copilot for mobile. Users go
through a guided, adaptive intake for a dispute (deposit, refund, insurance claim,
airline comp, billing, employment) and get a tailored plan with rights, options, a
recommended next step, evidence guidance, a timeline, an action plan, and — where
appropriate — a demand letter draft.

**Core framing, never to be violated:** legal *information* to help the user decide,
not legal *advice*. Every feature, prompt, and UI copy decision should be checked
against this line.

## Stack

- **Mobile:** Expo / React Native
- **Backend:** Next.js API routes
- **DB:** Postgres via Prisma
- **AI:** Claude (Anthropic API)
- **Hosting:** Vercel (app + API) + Neon (Postgres)

## Source of truth for what to build

- `ROADMAP.md` in this repo is the backlog, phased and ordered. Always check it before
  starting new work. Work top-down within the current phase unless told otherwise.
- Do not jump ahead to a later phase's items without flagging it — the phases are
  ordered by risk/dependency on purpose, not just priority.

## Guardrails — never touch these without explicit human sign-off

These are the areas we've identified as carrying real legal/safety risk. Claude Code
should implement the *mechanical* parts freely, but must stop and ask before shipping
anything that changes behavior in these areas:

1. **Citation logic** — how statutes/laws are selected, verified, or displayed.
   Never auto-"fix" a citation or change the verification source without flagging it.
2. **Out-of-scope guard** — the logic that declines to produce a plan for criminal,
   family-law, immigration, personal-injury, or emergency situations. Never loosen
   this without an explicit human decision.
3. **Confidence score / recovery estimate logic** — how these numbers are computed.
   Changes here affect how much weight a user puts on the plan.
4. **Demand letter generation** — the actual text/legal claims produced. Formatting
   and send/export mechanics are fine to build freely; wording logic is not.
5. **Data retention / deletion** — changes to how long data is kept or how deletion
   works need sign-off, since this ties to a written policy, not just code.
6. **Anything that would widen product scope** — e.g., turning intake into an
   open-ended "ask anything" Q&A. This was explicitly decided against — see
   decision log below.

If a ticket in ROADMAP.md seems to require touching one of these, implement everything
else in the ticket and leave a clear TODO / PR note flagging the specific piece that
needs review.

## Decision log (context so this doesn't get re-litigated every session)

- **Rejected:** open-ended "ask anything about law" chatbot. Decided against because
  it breaks the out-of-scope guard's reliability and erodes the calm, structured
  intake that differentiates the product. Category expansion should happen within the
  existing guided-intake format instead.
- **Accepted:** "5 things to ask a lawyer" as a per-case generated feature (not a
  static list), same generation pattern as the follow-up intake questions.
- **Accepted:** phased build order — risk containment (Phase 0) before new
  user-facing features, because several later features are only safe to ship once
  citation verification and data policy exist.

## Working conventions

- Prefer small, reviewable PRs over large ones. One ticket = one PR where possible.
- Every PR touching a guardrail area (see above) must include a note in the PR
  description explicitly calling that out, even if the change seems minor.
- Write tests for anything touching dates/deadlines, citation display, or data
  deletion — these are the areas where silent bugs are most costly.
- Match existing code patterns in the repo rather than introducing new patterns
  for the same problem.
- Commit to a feature branch and open a PR. Never push directly to main.
- When a task involves a judgment call flagged as "human-reviewed" in the platform
  monitoring design (see ROADMAP.md Phase 0/3), implement the flagging mechanism,
  not an auto-resolution.

## Session workflow

1. Read `ROADMAP.md`, find the next unstarted ticket in the current phase.
2. Confirm the ticket's scope, especially whether it touches a guardrail area.
3. Implement, test, and open a PR.
4. Update `ROADMAP.md` to mark the ticket in progress/done.
5. Summarize what was done and what needs human review before ending the session.
