# Consumer Rights AI

An AI-powered consumer-rights and dispute-recovery copilot. A user with a dispute (withheld deposit,
refused refund, denied insurance claim, airline compensation, billing, employment, etc.) is guided through
a short, adaptive intake, then the AI combines the laws and rights that apply into a tailored plan and opens
a persistent **Case Workspace** with tabs: Overview, Timeline, Rights, Options, Action Plan, Evidence,
Similar Situations, Documents.

This is **legal information to help you decide, not legal advice.** For a binding opinion, consult a
licensed attorney.

## Structure

- **Root** — a Next.js API-only backend: auth (email/password, bearer-token + cookie sessions), the AI
  intake engine, and case persistence (Postgres via Prisma). There is no web UI here.
- **`mobile/`** — the actual product: an Expo Router (React Native) mobile app implementing the guided
  intake wizard and the Case Workspace.

## How it works

1. The mobile app runs a calm, one-question-at-a-time intake — deliberately **not** a chatbot. Two fixed
   seed questions (dispute category, then a free-text description), followed by 2-4 AI-generated follow-up
   questions tailored to the specific case.
2. When the AI has enough to go on, it returns a full tailored plan in one structured JSON response: a
   title/summary, the rights that apply (with statute/law names), ranked options with pros/cons, a
   recommended next step, evidence to gather, an auto-built timeline and action plan, and — when
   appropriate — a ready-to-send demand letter.
3. The backend persists this as a `Case` tied to the signed-in user, and the mobile app opens the Case
   Workspace to it.
4. If the situation looks criminal, family-law, immigration, personal-injury, or an active emergency, the
   AI declines to produce a plan and instead tells the user this needs a licensed attorney (or emergency
   services).

**Similar Situations** is intentionally left as an honest "not connected yet" state rather than showing
fabricated statistics — see `design_handoff_consumer_rights_copilot/README.md` § Data Sources for the
intended real data sources (public court records, regulator complaint databases, aggregated case outcomes).

## Backend setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL and ANTHROPIC_API_KEY
npx prisma migrate dev --name init
npm run dev
```

- `DATABASE_URL` — any Postgres connection string (a free Neon-backed DB from Vercel's Storage tab works
  well for deploys).
- `ANTHROPIC_API_KEY` — from https://console.anthropic.com/settings/keys. Without it, `/api/intake/step`
  returns a clear "AI engine not configured" error instead of failing silently.

Deploy the root app to Vercel; note its stable production domain for the mobile app's `.env`.

## Mobile app setup

```bash
cd mobile
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL to the backend's URL
npm start
```

Open in Expo Go (scan the QR code) or an iOS/Android simulator. Pinned to Expo SDK 54 to match what Expo
Go's App Store build actually supports — see `mobile/AGENTS.md`.

## Design reference

`design_handoff_consumer_rights_copilot/` contains the original high-fidelity design handoff (colors,
type, copy, exact layouts) this app was built from.
