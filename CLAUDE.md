# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Development Server
- `npm run dev` - Start development server with hot reload

### Building
- `npm run build` - Type check and build for production

### Code Quality
- `npm run lint` - Run ESLint on TypeScript and TSX files

---

## Apple Silicon (M1) — Native Binary Fixes

npm may install x64 binaries instead of arm64 when running under Rosetta. The fix is always the same two-step pattern:

### @tailwindcss/oxide darwin-arm64 Missing Binary
If `npm run dev` fails with `Cannot find native binding` from `@tailwindcss/oxide`:
```
arch -arm64 npm install @tailwindcss/oxide-darwin-arm64@<version> --save-optional
cp -r node_modules/@tailwindcss/oxide-darwin-arm64 node_modules/@tailwindcss/postcss/node_modules/@tailwindcss/
```
Check the required version with:
```
node -e "console.log(require('./node_modules/@tailwindcss/postcss/node_modules/@tailwindcss/oxide/package.json').version)"
```

### lightningcss darwin-arm64 Missing Binary
If the build fails with a `lightningcss/darwin-arm64` binary error:
```
rm -rf .next node_modules/.cache && npm ci
```
If `npm ci` alone doesn't fix it, install the binary manually and copy it into the nested location under `@tailwindcss/postcss/node_modules/`.

**Rules**: Do NOT use `--force` or `--legacy-peer-deps`. Never delete and reinstall `node_modules` unless explicitly asked.

---

## Architecture Overview

This is a Next.js 15 legislation tracking application built with:
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS v4 with Radix UI components
- **Authentication**: Firebase Auth (email/password + Google/GitHub)
- **Database**: Firebase Firestore for user data and saved bills
- **State Management**: React Context (UserContext, DemoContext, SearchCacheContext)
- **External APIs**: OpenStates API v3 (proxied server-side), Google Gemini AI (server-side only)

### Key Architectural Patterns

**Component Structure**: Uses shadcn/ui pattern with reusable UI components in `src/components/ui/`

**API Integration**:
- OpenStates requests go through `/api/openstates` (Next.js proxy route) — API key never reaches the browser
- Gemini AI runs server-side only via `/api/summarize` route — API key never reaches the browser
- Axios client in `src/services/api-client.ts` with `baseURL: "/api/openstates"`
- Custom hooks (`useBills`, `useBillSummary`, `useReps`, etc.) call these routes transparently

**Security**: `GEMINI_API_KEY` and `OPENSTATES_API_KEY` are server-side only. `NEXT_PUBLIC_FIREBASE_*` vars are safe to expose to the client.

**Type Safety**: Comprehensive TypeScript types in `src/types/index.ts`

**Routing Structure** (Next.js App Router, `src/app/`):
- `/` - Homepage with Hero section and jurisdiction-specific or trending bills
- `/sign-in` - Firebase Auth sign-in
- `/sign-up` - Firebase Auth sign-up
- `/profile-setup` - State selection and display name for new users (protected)
- `/dashboard` - User's saved bills and personalized view (protected)
- `/trending` - National trending legislation
- `/about` - About page
- `/rep/[repId]` - Representative scorecard
- `/api/openstates/[...path]` - OpenStates proxy (injects API key server-side)
- `/api/summarize` - Gemini AI summary route (server-side only)
- `/api/track` - product-analytics sink; writes events to Firestore via the Admin SDK

### Key Features

**User Authentication**: Firebase Auth with email/password and social providers (Google, GitHub)

**Profile Setup**: New users select their state and display name for a personalized experience

**Bill Tracking**: Real-time momentum analysis with custom `MomentumLevel` scoring system

**Smart Filtering**: Jurisdiction selector (US states) and topic-based filtering

**AI Summaries**: Gemini AI (`gemini-3.6-flash`) generates plain-English summaries with 2-layer caching:
- L2: Firestore `bill_summaries/{billId}` — written server-side via the Admin SDK, permanent,
  shared across all users. Read by both the client and `/api/summarize` (before Gemini is called).
  Invalidated only by bumping `SUMMARY_PROMPT_VERSION` in `src/lib/summaryCacheKey.ts`.
- L1: In-memory Map on the server (per-process, deduplicates concurrent requests)

The Gemini client, prompt, and `generateForBill` live in `src/lib/summaryGenerator.ts`, shared by
`/api/summarize` and the prewarm cron so the prompt can never drift between the two.

**Prewarming**: `.github/workflows/prewarm-summaries.yml` POSTs to `/api/prewarm-summaries`
hourly. Each run generates at most 3 missing summaries for bills in the national trending feed, so
the homepage's AI impact lines cost zero live tokens. The batch is deliberately small: it is caught
between the Gemini free tier's **5 requests per minute** (hence 13s spacing) and Vercel Hobby's
**60s** function cap — `BATCH_SIZE=4` returned 504 in production. Raise the cron frequency, never
`BATCH_SIZE` or `DELAY_MS`. Runs that find nothing missing cost Firestore reads only, no tokens.
The route is authenticated with
`CRON_SECRET` and deliberately bypasses the same-origin and per-IP rate limits that protect
`/api/summarize` — those would block the cron itself. With `CRON_SECRET` unset the route 404s, so
the endpoint is simply off rather than open.

**Persistent Bill Saving**: Authenticated users can save bills to Firestore

**Responsive Design**: Mobile-first TailwindCSS v4 implementation

**Analytics**: self-hosted on Firestore — **no third-party vendor, no plan tier, nothing that can
bill**. All product events go through the typed `track()` helper in `src/lib/analytics.ts`, which
beacons to `/api/track`; that route validates the event name and writes to the `analytics_events`
collection with the Admin SDK.

- `track()` is a no-op unless `NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'`, which keeps the unit
  suite and local dev silent (jsdom defines `window`, so the browser check alone is not enough).
- It never throws and never awaits. It uses `navigator.sendBeacon` so a `bill_card_click` survives
  the navigation it triggers, falling back to `fetch(..., { keepalive: true })`.
- Clients never write to Firestore directly — `firestore.rules` denies all client access to
  `analytics_events`. An open create rule would be a spam target.
- The event union is **closed** — the five names below are the whole vocabulary. Adding one means
  editing both the union and `ALLOWED_EVENTS` in `src/app/api/track/route.ts`.

| Event | Props |
|---|---|
| `feed_view` | `{ feed: 'trending' \| 'state' \| 'following', count: number }` |
| `bill_card_click` | `{ feed: string, position: number, hasSummary: boolean }` |
| `location_set` | `{ method: 'dropdown' \| 'zip' \| 'chip' \| 'profile' }` |
| `summary_view` | `{ cached: boolean }` |
| `topic_chip_tap` | `{ topic: string }` — reserved, no call site yet (PLAN-21) |

Props must stay non-identifying: bill IDs are public and safe, but never attach the Firebase `uid`,
display name, or email. The route sanitizes props defensively (primitives only, truncated, capped)
and stores no IP — the client IP is used for rate limiting and then discarded.

**Error Monitoring**: none, deliberately — every hosted option is a paid or freemium vendor.
`src/app/global-error.tsx` catches App Router render errors and `console.error`s them, which the
host platform's runtime logs capture at no cost.

## Environment Variables

Server-side only (never exposed to client):
- `OPENSTATES_API_KEY` - OpenStates API key
- `GEMINI_API_KEY` - Google Gemini API key
- `CRON_SECRET` - bearer secret for `/api/prewarm-summaries`; must match the GitHub Actions secret

Client-safe (`NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_ANALYTICS_ENABLED` - `'true'` only in production; anything else disables tracking
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Import Aliases

- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)

## Development Notes

**Client vs Server components**: All components using React hooks or browser APIs have `'use client'` at the top. API routes (`src/app/api/`) are server-side only.

**Authentication Flow**: Sign-up → profile-setup → dashboard. Protected routes redirect to `/sign-in` client-side via `useEffect` + `useRouter.replace()`.

**`useSearchParams` requires Suspense**: Any page using `useSearchParams` from `next/navigation` must be wrapped in a `<Suspense>` boundary.

**Firestore Security**: Firebase Auth user ID used as document ID; saved bills in subcollections.

**Rate Limiting**: Gemini route enforces a 4-second delay between API calls to avoid hitting limits.
