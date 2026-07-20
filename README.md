# 🐕 Billhound

**US laws that affect you, explained plainly.**

Congress and your state legislature pass thousands of bills a year, most of them written like they're actively trying to lose you by paragraph two. Billhound goes and sniffs them out, tracks how they're moving through the process, and has an AI translate the legalese into "here's what this actually means for your wallet."

No account needed to browse. Sign up if you want to save bills and see how *your* reps voted.

---

## What it actually does

- 🔍 **Search by state or zip code** — pulls real-time bills from [OpenStates](https://openstates.org), all 50 states plus Congress
- 🤖 **"Translate to Plain English"** — Gemini turns official bill text into a plain-language gist, who it affects, the wallet impact, and the strongest arguments for/against
- 📈 **Momentum tracking** — a custom scoring system tells you if a bill is gaining steam, stalled, or already law, based on real legislative activity (not vibes)
- 🔥 **Trending nationwide** — the bills everyone's watching right now, surfaced automatically
- 🧑‍⚖️ **Rep scorecards** — look up your senators and representatives and see how they've actually voted
- 🔖 **Save bills** — bookmark anything and it syncs to your account via Firestore
- 📱 Fully responsive, because nobody's reading a 40-page bill on a laptop at 11pm anyway (they're doing it on their phone)

## The stack

Next.js 15 (App Router) + React 19 + TypeScript, styled with Tailwind v4 and Radix UI. Firebase handles auth and saved bills. Two API keys never touch the browser — OpenStates and Gemini both get proxied through server-side routes, with rate limiting and an origin check standing guard so nobody turns your keys into a free public API.

```
Next.js 15 · React 19 · TypeScript
TailwindCSS v4 · Radix UI
Firebase Auth + Firestore
OpenStates API v3 · Google Gemini (gemini-2.5-flash)
```

## Running it locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:3000`. You'll need a `.env` with:

```
OPENSTATES_API_KEY=
GEMINI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Other useful commands:

```bash
npm run build   # type check + production build
npm run lint    # eslint
```

## Where things live

```
src/app/            routes — homepage, /trending, /dashboard, /rep/[repId], /api/*
src/components/      UI components (shadcn/ui pattern)
src/hooks/           useBills, useBillSummary, useReps, and friends
src/services/        API client (axios, hits our own /api proxy)
src/lib/             rate limiting, Firebase admin, misc utils
src/types/           the shape of everything
```

The two paid-API routes (`/api/openstates`, `/api/summarize`) are server-only, rate-limited per IP, and same-origin-checked — your keys are never exposed to the browser and can't be hotlinked from someone else's site.

## Roadmap

Open `docs/PLAN-ROADMAP.html` in a browser for the full build roadmap — what's shipped, what's next, ranked by leverage.
