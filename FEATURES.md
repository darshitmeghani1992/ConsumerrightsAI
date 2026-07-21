# Consumer Rights AI — Feature Overview

A brainstorming-ready snapshot of what the app is, what's built today, and where it
could go. Paste this into a chat to give context, then riff on new ideas.

---

## What the app is

An AI-powered consumer-rights and dispute-recovery copilot for mobile. Someone with a
dispute — a withheld deposit, a refused refund, a denied insurance claim, an airline
comp issue, a billing or employment problem — is guided through a short, adaptive
intake. The AI then combines the laws and rights that apply into a tailored plan and
opens a persistent **Case Workspace** they can return to.

Framing throughout: **legal information to help you decide, not legal advice.**

**Stack:** Expo / React Native (mobile app) + Next.js API backend + Postgres (Prisma) +
Claude (Anthropic API) for the AI engine. Deployed on Vercel + Neon.

---

## Current features

### Accounts & sync
- Email/password signup and login.
- Cases persist per user across visits and devices (bearer-token + cookie sessions).
- Settings tab with account info and log out.

### Guided intake (the front door)
- Calm, **one-question-at-a-time** wizard — deliberately not a chatbot.
- Two fixed seed questions: dispute category, then "what happened?" in plain English.
- After that, **2–4 AI-generated follow-up questions** tailored to the specific case —
  never generic filler, never re-asking what's known.
- Question types: single-choice cards, multi-select chips, short text, long text, dollar
  amounts.
- Progress bar, back button (restores prior answers), and graceful "analyzing" and
  "that didn't go through / try again" states.
- **Out-of-scope guard:** if the situation is criminal, family-law, immigration,
  personal-injury, or an active emergency, the AI declines to produce a plan and instead
  says it needs a licensed attorney (or emergency services).

### The tailored plan (AI output)
For each case, the AI produces:
- A case title + plain-English summary.
- A confidence read ("Strong position · 4 of 5") and an estimated recovery range.
- The **rights** that apply, each with the relevant law/statute name.
- Ranked **options** to resolve it, each with effort / timeline / cost and pros & cons.
- A single recommended **next step**.
- **Evidence** the user likely already has, plus evidence worth gathering.
- An auto-built **timeline** of events and a step-by-step **action plan**.
- A ready-to-send **demand letter** draft, when that's the right tool for the dispute.

### Case Workspace (8 tabs)
The persistent home for one dispute:
- **Overview** — recovery estimate, confidence meter, "what happened", recommended next
  step, and stat tiles that deep-link to the other tabs.
- **Timeline** — the sequence of events, built from intake answers.
- **Rights** — plain-language rights with statute citations.
- **Options** — resolution paths with effort/timeline/cost and pros/cons.
- **Action Plan** — numbered steps with a "next up" marker.
- **Evidence** — what you have vs. what would strengthen the case.
- **Similar Situations** — *intentionally an honest "not connected to real data yet"
  state* rather than fabricated statistics (see Known gaps).
- **Documents** — generated documents (e.g. demand letter) with a live preview.

---

## Known gaps / honest placeholders
- **Similar Situations** shows no numbers on purpose — real comparables would come from
  public court records (small claims / CourtListener), regulator complaint databases
  (CFPB, FTC, state AG, BBB), and, over time, the platform's own anonymized outcomes.
- **Documents** are generated but there's no send/export flow yet (no email, PDF, or
  certified-mail integration).
- No document/photo **upload** during intake (evidence is described, not attached).
- No notifications or **deadline reminders** (e.g. the 21-day deposit clock).
- Single language, US-centric legal framing.

---

## Possible directions to brainstorm
Seeds, not commitments — pull on whatever's interesting:

**Make the plan actionable**
- One-tap send of the demand letter (email / PDF export / certified-mail partner).
- Deadline tracking with push reminders (statute-of-limitations, response windows).
- A checklist that tracks real progress through the action plan, with nudges.

**Strengthen the case**
- Upload photos/PDFs/receipts and let the AI weave them into the timeline & evidence.
- Auto-extract dates and facts from uploaded documents (leases, denial letters, emails).
- "Evidence strength" score that goes up as you add items.

**Real data behind Similar Situations**
- Wire in public court-record / regulator datasets and show sourced, sample-sized comps.
- Aggregate anonymized outcomes from the platform's own cases over time.

**Guidance & trust**
- Jurisdiction-aware rights (pick your state/country; laws adapt).
- "Talk to a lawyer" handoff for cases that outgrow self-help, or the out-of-scope path.
- Plain-language explainers for each cited law.

**Engagement & reach**
- Case status dashboard across multiple disputes.
- Shareable case summary (for a co-tenant, spouse, or advocate).
- Templates library beyond the demand letter (mediation request, small-claims prep,
  complaint filings).

**Monetization (if relevant)**
- Free intake + plan; paid document sending, deadline tracking, or lawyer handoff.
- Per-case cost is small (a few cents of AI per light case), so usage-based pricing is
  viable.

---

*This doc reflects the app as built. For anything you decide to add, bring it back to the
coding session and it can be implemented.*
