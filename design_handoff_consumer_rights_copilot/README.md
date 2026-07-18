# Handoff: Consumer Rights AI — Copilot (Guided Intake + Case Workspace)

## Overview
Consumer Rights AI is a mobile-first consumer-rights and recovery copilot. A user with a
dispute (withheld deposit, refused refund, denied insurance claim, airline comp, billing,
employment, etc.) is guided through a short, adaptive intake, then the AI combines the laws
and rights that apply into a tailored plan and opens a persistent **Case Workspace** with
tabs: Overview, Timeline, Rights, Options, Action Plan, Evidence, Similar Situations,
Documents.

This bundle covers two connected experiences:
1. **Guided intake** — a calm, one-question-at-a-time wizard (deliberately NOT a chatbot)
   that adapts each follow-up question to the specific case, then produces a plan.
2. **Case Workspace** — the tabbed workspace the plan flows into.

## About the Design Files
The file(s) in this bundle are **design references created in HTML** — a working prototype
showing the intended look, copy, and behavior. They are **not production code to ship
directly**. The task is to **recreate these designs in the target codebase's environment**
(React Native / Expo, native iOS/Android, or a responsive React web app) using that project's
established patterns, component library, navigation, and state management. If no codebase
exists yet, choose the most appropriate stack for a mobile-first consumer app (recommended:
**React Native + Expo** for true mobile, or **Next.js + React** if web-first) and implement
the designs there.

The prototype is a single self-contained "Design Component" HTML file. Treat its structure
(screens, states, copy, tokens) as the source of truth; re-implement, don't copy the runtime.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, and interaction states are all
specified below and present in the HTML. Recreate the UI pixel-accurately using the codebase's
libraries. Exact hex values, font sizes (px), and copy are given.

---

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| Canvas / paper | `#f4f1ea` | App background (inside phone) |
| Desk (outside frame) | `#e4e0d4` | Prototype page bg only — not app |
| Surface / card | `#ffffff` | Cards, inputs |
| Warm off-white | `#fffdf9` | Document preview surface |
| Ink (primary text) | `#1c2620` | Headings, primary text |
| Ink-2 | `#33403a` | Body text on cards |
| Muted text | `#5d6b63` / `#6a766e` | Secondary text |
| Faint text / meta | `#9aa49b` / `#8a948b` | Labels, captions |
| Primary green | `#37624a` | Buttons, active tab, accents |
| Primary deep | `#274736` | Hero panels, emphasis |
| Primary hover | `#274736` | Link/btn hover |
| Green tint bg | `#eef3ee` | Soft callout backgrounds |
| Green tint border | `#d5e2d8` | Soft callout borders |
| Success dot/bar | `#4d8a63` / `#8fc2a0` | Progress, confidence, checks |
| Card border | `#ece7db` | Hairline card borders |
| Divider | `#e7e2d7` / `#e2ddd0` | Rules, tracks |
| Input border | `#ddd7c9` | Text inputs |
| Amber (flag/warn) | `#b0763a` / `#a37a52` / `#96602c` | Missed-deadline flags, cons, warnings |
| Amber bg | `#f4e6d3` / `#fbf7f0` | Warning tint surfaces / borders `#ecdfcb` |
| On-dark text | `#eef3ee` | Text on green panels |
| On-dark faint | `#c7d6ca` / `#9fc0ac` | Secondary text on green panels |

### Type
- **Display / headings:** `Newsreader` (serif), weights 400/500/600. Used for case titles,
  section titles, big numbers, the recovery amount, and document previews.
- **UI / body:** `Hanken Grotesk` (sans), weights 400/500/600/700. Everything else.
- Google Fonts import (both): `Hanken+Grotesk:wght@400;500;600;700` and
  `Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600`.
- Uppercase micro-labels: 10–11px, `letter-spacing: 1.2–1.5px`, weight 600, color `#9aa49b`.

### Type scale (px, as used)
- Big number / recovery amount: 44 (Newsreader 500)
- Screen question (intake): 25 (Newsreader 600)
- Section / case title: 19–21 (Newsreader 600)
- Card title: 15–16 (Hanken 600)
- Body: 13.5–14.5 (Hanken 400/500), line-height ~1.5
- Meta / caption: 11.5–12.5
- Micro-label (uppercase): 10–11

### Radius
Inputs/cards 14px · large cards 18px · hero panels 22px · pills 999px · small chips 7–8px ·
icon tiles 11–12px.

### Shadow
Cards: `0 1px 2px rgba(28,38,32,0.04)`. Elevated/result card: `0 3px 12px rgba(28,38,32,0.07)`.

### Spacing
Screen padding 18–20px horizontal. Card padding 14–17px. Gaps 8–16px. Status-bar top pad 54px
(device frame), section bottom pad ~44px.

---

## Screens / Views

### A. Guided Intake (wizard)
Purpose: capture the case with as few, as-relevant questions as possible; feels like a premium
product form, not a chat.

Layout (top → bottom):
1. **Header** — 54px top pad. Green rounded icon tile (36px, `#274736`) + micro-label
   "NEW CASE · GUIDED INTAKE" + "Consumer Rights AI" (Newsreader 19).
2. **Progress bar** — full-width 4px track `#e2ddd0`, fill `#37624a`, width driven by
   `progressPct` (`min(88, 14 + (qNumber-1)*20)%`), `transition: width .4s ease`.
3. **Question area** (scrollable) — micro-label "Question {n}"; question (Newsreader 25);
   helper line (13.5, `#6a766e`); then the input matching the question `kind`:
   - `choice`: full-width tappable cards (white, border `#ece7db`, radius 14, 15px/500 label,
     chevron `›` in `#c3ccc4`). Tapping a card advances immediately.
   - `multichoice`: wrapping chips; selected = filled `#37624a` white text; unselected = white,
     border `#ddd7c9`.
   - `textarea`: white, min-height 120, border `#ddd7c9`, radius 14.
   - `text`: single-line input, same styling.
   - `amount`: input with a leading Newsreader `$` (24px, `#8a948b`); numeric value in
     Newsreader 24.
4. **Footer** (hidden on `choice` steps unless Back is available) — optional Back button
   (50×50 white, border, `‹`) + **Continue** (flex-1, `#37624a`, white, radius 14, 16px pad).
   Continue is disabled (`#e0e4dd` bg, `#a7b0a8` text) until the step has a valid answer.

States:
- **Form** (default) — the above.
- **Analyzing** — centered 56px spinner (3px ring, top color `#37624a`, `spin .9s linear
  infinite`), title (Newsreader 22) = "Reading your situation…" for the first AI turn else
  "One moment…", subline explaining it's matching laws/rights.
- **Error** — centered amber `!` disc (52px, bg `#f4e6d3`, text `#a37a52`), "That didn't go
  through", reassurance that answers are saved, and a **Try again** button (`#37624a`).
- **Result (tailored plan)** — scrollable: micro-label "YOUR TAILORED PLAN"; case title
  (Newsreader 24); summary; **Rights on your side** (bulleted, each = plain-language title +
  law/statute caption); **Your options** (bordered cards: name + `effort · time` + one-line
  why); **Best next step** (deep-green panel `#274736`); **Evidence to gather** (wrapping
  chips); primary CTA "Open my case workspace ›" (links to workspace); secondary "Start a new
  case".

Intake flow rules (important — this is the fix that makes it feel intelligent):
- Only **two fixed seed questions**: (1) category `choice`
  [Deposit or housing, Refund or defective product, Airline or travel, Subscription or billing,
  Insurance claim, Employment, Something else]; (2) "In your own words, what happened?"
  `textarea`.
- After the seeds, **every follow-up is generated by the AI**, specific to the case, skipping
  anything irrelevant. Ask only **2–4 tailored follow-ups**, then finish with the plan.
- Back must restore the previous question and its prior answer.

### B. Case Workspace
Purpose: the persistent home for one dispute.

Layout:
- **Sticky header** (z-index low so status bar shows): back chevron tile; micro-label
  "CASE FILE · STRONG POSITION"; case title (Newsreader 21); live status dot (9px `#4d8a63`
  with soft ring); sub-line "Meridian Property Group · Opened Jul 2, 2026".
- **Scrollable tab strip** (horizontal, hidden scrollbar): pills; active = filled `#37624a`
  white; inactive = `#6a766e` text. Tabs: Overview, Timeline, Rights, Options, Action plan,
  Evidence, Similar, Documents. Hairline divider under the header.
- **Tab body** (18px padding):
  - **Overview** — deep-green hero with "ESTIMATED RECOVERY" + amount (Newsreader 44) + a 5-seg
    confidence meter ("Strong position · 4 of 5"); "What happened" card; **Recommended next
    step** callout (green tint, taps to Documents); 2×2 stat grid (Rights / Options / Evidence
    gathered `4/7` / Similar cases won) — each taps to its tab; a quiet "not legal advice" note.
  - **Timeline** — vertical connector list; normal nodes = white ring, flagged node = amber
    dot with a "Deadline missed by landlord" chip.
  - **Rights** — cards: green check tile + plain-language title + statute caption + body.
  - **Options** — cards with an optional "RECOMMENDED" badge; name; description; a row of
    Effort / Timeline / Cost; two-column Pros (`+`, green) / Cons (`–`, muted amber).
  - **Action plan** — progress bar (1 of 5) + step rows: done (green `✓`), current (green
    number + "Next up" chip), upcoming (grey number).
  - **Evidence** — "You have this" (green-check rows) and "Would strengthen your case"
    (amber `+` cards with a why line).
  - **Similar** — two stat cards (deep-green "68% resolved after a demand letter"; white
    "$2,100 average recovered") + comparable-case cards (title + amount + outcome + duration).
    **NOTE:** these figures are currently placeholder/mock — see Data Sources below.
  - **Documents** — generated-doc cards (icon + name + desc + status chip + "Open ›") and a
    live **demand-letter preview** on a warm off-white Newsreader surface.

Interactions: tab pills switch the body via a single `tab` state. Overview's recommended-step
callout and each stat tile deep-link to the relevant tab. Result CTA in intake navigates to
the workspace.

---

## Interactions & Behavior
- **Tab switching**: single string state `tab`; active pill styling; instant swap.
- **Intake advance**: `choice` cards advance on tap; other kinds advance via Continue.
  Continue disabled until valid (`amount` always allowed to be empty/optional per copy).
- **Adaptive questioning**: after 2 seed answers, call the model for the next question or the
  final plan (see AI Engine).
- **Loading**: spinner state during every AI call.
- **Error handling (required)**: the AI call must **retry once** on a network error OR an
  unparseable/empty/wrong-shape JSON response; if it still fails, show the Error state with
  Try again (which re-runs with preserved answers). This was a real bug source — long user
  descriptions made the model jump to a full plan that overflowed the token budget and got
  truncated. Set a generous max_tokens (≈2200) and validate JSON shape before using it.
- **Progress bar**: animates width on each question.
- **Transitions**: spinner `spin .9s linear`; progress `width .4s ease`.

## State Management
Intake state:
- `phase`: `form | result` (with `busy` and `error` flags layered on `form`).
- `q`: the current question object `{key, kind, q, help, options[], placeholder}` (null → first
  seed).
- `qNumber`, `seedIndex`: numbering / seed cursor.
- `history`: `[{key, q, answer}]` — all answered questions (drives the AI prompt and Back).
- `qStack`: stack of prior question objects (for Back).
- `draft`, `evidence[]`: current input buffers.
- `busy`, `error`, `result`.
Workspace state:
- `tab`: which section is shown.
- All tab content (rights, options, plan, evidence, similar, docs, timeline) — in the
  prototype these are static arrays; in production they come from the analysis result +
  case record.

## AI Engine (core of the product)
Two model calls, both returning **strict JSON only** (parse defensively — strip ``` fences,
slice from first `{` to last `}`):

1. **Adaptive next-question / finish** — system prompt: run a short adaptive intake for a
   consumer/legal dispute, informational-only (not a lawyer). Given `answersSoFar`, ask the
   single most useful **case-specific** next question (never generic filler, never re-ask), or
   finish. Ask only 2–4 follow-ups total. Response is either
   `{"done":false,"question":{key,kind,q,help,options?,placeholder?}}` or
   `{"done":true,"result":{...}}`.
2. **Result / plan** shape:
   `{title, summary, rights:[{title,law}], options:[{name,why,effort,time}], nextStep,
   evidence:[...]}`. Base rights/laws on stated jurisdiction; if unknown and it matters, ask
   once, else give general guidance and note specifics vary by location.

Model used in prototype: `claude-sonnet-4-5`, `max_tokens ≈ 2200`. In production, route trivial
turns to a cheaper model and use prompt caching for uploaded documents to control cost
(marginal cost ≈ $0.05 light case → ~$1–2 document-heavy case).

Out-of-scope handling (recommended, not yet built): detect criminal / family / immigration /
personal-injury / urgent matters and route to "this needs a licensed attorney" instead of a
plan.

## Data Sources
- The **Similar Situations** percentages and dollar figures, and all workspace tab content,
  are **hardcoded placeholder data** in the prototype. There is no database behind them yet.
- For production, back these with real data and label the source + sample size: public court
  records (small claims / CourtListener), regulator complaint databases (CFPB, FTC, state AG,
  BBB), and — over time — the platform's own anonymized/aggregated case outcomes.

## Assets
- No raster images or custom icon sets. All iconography is simple CSS shapes (dots, tiles,
  chevrons as text `›` `‹`, `✓`, `+`, `!`). Replace with the codebase's icon library.
- Fonts: Google Fonts (Hanken Grotesk, Newsreader).
- The phone frame in the prototype (`ios-frame.jsx`) is a **prototype-only device mock** — do
  not port it; render inside the real app shell.

## Files
- `Consumer Rights Workspace.dc.html` — the full prototype (intake wizard + workspace + two
  alternate Overview layouts `1b`, `1c`). Open it to see live behavior and read exact styles.
- `ios-frame.jsx` — prototype device frame only (ignore for production).

## Positioning / legal
Not a law firm, not an AI lawyer, not a guarantee of outcomes. Keep the "legal information,
not legal advice" framing woven in (present in Overview and intended app-wide).
