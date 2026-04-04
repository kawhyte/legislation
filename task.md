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
- [ ] Create the `app` directory
- [ ] Migrate `index.html` + global providers into `app/layout.tsx`
- [ ] Migrate Vite entry point to `app/page.tsx`

**Status: PENDING**

---

### Step 5 — Component & Hook Client Migration
- [ ] Scan `src/components` and `src/hooks`
- [ ] Add `"use client"` directive to all files using React hooks, browser APIs, or event listeners

**Status: PENDING**

---

### Step 6 — Routing Migration
- [ ] Convert React Router routes to Next.js file-based routing (`app/[route]/page.tsx`)
- [ ] Replace `<Link>` from `react-router-dom` with `next/link`

**Status: PENDING**

---

### Step 7 — Secure API & Cache Migration (Critical)
- [ ] Create `app/api/summarize/route.ts` for Gemini API (server-side only)
- [ ] Migrate `src/services/geminiServices.ts` logic into server route
- [ ] Refactor in-memory cache / rate-limiting to work in Next.js server environment
- [ ] Update client components to call `/api/summarize` instead of SDK directly
- [ ] Create `app/api/openstates/route.ts` for OpenStates API (server-side only)
- [ ] Update client components to call new OpenStates API route
- [ ] Verify API keys are hidden in network tab

**Status: PENDING**

---

### Step 8 — Cleanup
- [ ] Remove leftover Vite config files (`vite.config.ts`, `index.html`, etc.)
- [ ] Run final `npm run build` to ensure production readiness

**Status: PENDING**
