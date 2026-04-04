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

### Key Features

**User Authentication**: Firebase Auth with email/password and social providers (Google, GitHub)

**Profile Setup**: New users select their state and display name for a personalized experience

**Bill Tracking**: Real-time momentum analysis with custom `MomentumLevel` scoring system

**Smart Filtering**: Jurisdiction selector (US states) and topic-based filtering

**AI Summaries**: Gemini AI (`gemini-2.5-flash`) generates plain-English summaries with 2-layer caching:
- L2: Firestore (client-side, 24h, shared across all users)
- L1: In-memory Map on the server (per-process, deduplicates concurrent requests)

**Persistent Bill Saving**: Authenticated users can save bills to Firestore

**Responsive Design**: Mobile-first TailwindCSS v4 implementation

## Environment Variables

Server-side only (never exposed to client):
- `OPENSTATES_API_KEY` - OpenStates API key
- `GEMINI_API_KEY` - Google Gemini API key

Client-safe (`NEXT_PUBLIC_` prefix):
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
