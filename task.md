# Next.js Migration Task Tracker

## Migration Plan: Vite + React → Next.js (App Router)

---

### Step 1 — Scaffolding & Tracking
- [x] Create `task.md` in the root directory
- [x] Add `task.md` and `.next` to `.gitignore`

**Status: COMPLETE**

---

### Step 2 — Dependency & Script Updates
- [x] Install `next`, update `react` and `react-dom` to compatible versions
- [x] Remove `vite`, `@vitejs/plugin-react` from dependencies
- [x] Update `package.json` scripts (`dev`, `build`, `start`)
- [x] Update `tsconfig.json` for Next.js compatibility

**Status: COMPLETE**

---

### Step 3 — Environment Variable Migration
- [x] Rename all `VITE_FIREBASE_*` → `NEXT_PUBLIC_FIREBASE_*` in `.env` and codebase
- [x] Remove `VITE_` prefix from `VITE_GEMINI_API_KEY` and `VITE_OPENSTATES_API_KEY` (keep as server-side secrets)
- [x] Replace all `import.meta.env` with `process.env` globally

**Status: COMPLETE**

---

### Step 4 — Layout & Root Setup
- [x] Create `src/app/` directory (inside src to match project structure)
- [x] Migrate `index.html` + global providers into `src/app/layout.tsx`
- [x] Created `src/app/providers.tsx` ("use client" wrapper for UserProvider, DemoProvider, SearchCacheProvider)
- [x] Created `src/app/[[...slug]]/page.tsx` (catch-all, renders App via dynamic import with ssr:false)
- [x] Added `next.config.ts` and `postcss.config.mjs`
- [x] Renamed `src/pages/` → `src/views/` to avoid Next.js Pages Router conflict
- [x] Fixed ESLint config, lightningcss ARM64 binary, and pre-existing lint issues

**Status: COMPLETE**

---

### Step 5 — Component & Hook Client Migration
- [x] Scan `src/components`, `src/hooks`, `src/contexts`, `src/views`
- [x] Added `"use client"` to 58 files (all hooks, contexts, components, views using React hooks/browser APIs)

**Status: COMPLETE**

---

### Step 6 — Routing Migration
- [x] Created `src/app/page.tsx` (HomePage), `about`, `trending`, `sign-in`, `sign-up`, `profile-setup`, `dashboard`, `rep/[repId]`
- [x] Replaced `Link` from react-router-dom → `next/link` (`href=` instead of `to=`)
- [x] Replaced `useNavigate` → `useRouter` from `next/navigation`
- [x] Replaced `useLocation` → `usePathname` from `next/navigation`
- [x] Replaced `useParams` → `useParams` from `next/navigation`
- [x] Replaced `useSearchParams` → `useSearchParams` from `next/navigation` (with Suspense boundaries)
- [x] Removed `[[...slug]]` catch-all (no longer needed)
- [x] Added Header + Footer to `src/app/layout.tsx`
- [x] Protected routes implemented client-side in dashboard/profile-setup pages

**Status: COMPLETE**

---

### Step 7 — Secure API & Cache Migration (Critical)
- [x] Created `src/app/api/summarize/route.ts` — Gemini runs server-side only; in-memory cache + 4s rate limiter preserved exactly
- [x] Removed `GeminiService` import from `useBillSummary.ts`; client now calls `POST /api/summarize`
- [x] Firestore 2-layer cache preserved: client checks Firestore first, API route checks in-memory cache
- [x] Created `src/app/api/openstates/[...path]/route.ts` — proxy that injects `OPENSTATES_API_KEY` server-side
- [x] Updated `api-client.ts` baseURL: `https://v3.openstates.org` → `/api/openstates`; all existing hooks unchanged
- [x] `GEMINI_API_KEY` and `OPENSTATES_API_KEY` no longer bundled in client JS (verified: homepage bundle shrank)

**Status: COMPLETE**

---

### Step 8 — Cleanup
- [x] Remove leftover Vite config files (`vite.config.ts`, `index.html`, etc.)
- [x] Run final `npm run build` to ensure production readiness

**Status: COMPLETE**
