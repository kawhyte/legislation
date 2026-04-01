# Landing Page Pivot: Zip Code Discovery

- [x] **Task 1: Ungate the Homepage**
  - Modify `src/App.tsx`.
  - Remove `ProfileSetupChecker` and authentication requirements for the `/` route.
  - Ensure unauthenticated users can view the homepage without redirects.

- [x] **Task 2: Build the Zip Code Lookup Utility**
  - Create `src/utils/zipToJurisdiction.ts`.
  - Fetch state data using the free API: `https://api.zippopotam.us/us/{zip}`.
  - Map the returned state abbreviation (e.g., 'CA') to the OpenStates jurisdiction ID.

- [x] **Task 3: Refactor the Hero Component**
  - Update `src/components/Hero.tsx`.
  - Remove current primary CTAs.
  - Implement a bold, centered form asking for a Zip Code.
  - Add state for the zip input and an `onSubmit` handler.
  - Keep existing typography and color utility classes.

- [x] **Task 4: Connect Search to Bill Grid**
  - Update `src/components/HomepageContent.tsx` (or the parent component rendering the Hero and BillGrid).
  - Manage the state of the active `jurisdiction`.
  - When the Hero search form submits, use `getJurisdictionFromZip`, set the jurisdiction state, and pass it to your existing bill fetching hook.
  - If the fetch returns empty, render the `Tumbleweed Rolling.json` Lottie animation as an empty state.

- [x] **Task 5: Create an Auth Modal (Soft-Gate)**
  - Create a new component `src/components/AuthModal.tsx` using shadcn/ui `Dialog`.
  - Move the core sign-in/sign-up logic (Google/Email) into this modal so it can be rendered anywhere, not just on dedicated routes.

- [x] **Task 6: Intercept the "Save/Track" Action**
  - Update `src/components/BookmarkButton.tsx` (or equivalent save button on the `BillCard`).
  - Check the `useUser` auth state.
  - If unauthenticated, prevent the save action and open the `AuthModal` instead.
  - If authenticated, proceed with the normal Firestore save action.

- [x] **Task 7: Preserve User Context Post-Login**
  - Ensure that after a user successfully authenticates via the `AuthModal`, the modal closes and the app stays on the current homepage/search view. 
  - Do NOT force a redirect to `/dashboard` or `/profile-setup` if they are just trying to save a bill from the homepage.

  - [x] **Task 8: Restructure the Gemini Prompt**
  - Update `src/services/geminiServices.ts`.
  - Rewrite the prompt. Instruct the AI to return ONLY valid JSON with this exact schema: `{ "gist": "1-2 sentences max", "whoItAffects": "Target demographic string", "walletImpact": "Direct financial impact string", "controversy": { "for": ["point"], "against": ["point"] } }`.

- [x] **Task 9: Parse the AI Response**
  - Update the parsing logic in `src/services/geminiServices.ts` to strip out markdown blocks (e.g., \`\`\`json) and use `JSON.parse()`.
  - Add error handling: if parsing fails, fall back to displaying the raw text as the `gist`.

- [x] **Task 10: Rebuild the Summary UI**
  - Refactor the UI where the summary is displayed (e.g., `BillCard.tsx` or similar).
  - Remove the single paragraph layout.
  - Implement a clean, scannable UI using existing Tailwind/shadcn classes to display the parsed JSON fields. Make "Wallet Impact" stand out.

- [x] **Task 11: Strip Boring Metadata**
  - Modify `src/components/BillCard.tsx`.
  - Remove any display of committees, full sponsor lists (keep primary if necessary, or drop entirely), and raw legislative text. The card should only highlight the Title, Momentum, and the AI Summary sections.

- [x] **Task 12: Apply "Doodle Art" Styling**
  - Update the Tailwind classes in `src/components/BillCard.tsx`.
  - Apply `border-2 border-foreground rounded-xl shadow-[4px_4px_0px_0px_var(--tw-shadow-color)] shadow-foreground` to the main cards.
  - Make buttons and badges pop with similar thick borders and distinct background colors.
  - Keep the layout clean so the new AI summary JSON data is the star.

- [x] **Task 13: Polish the Empty State**
  - Adjust the empty state in `src/components/HomepageContent.tsx`.
  - Style the Tumbleweed Lottie container to be responsive (max-w-xs or similar).
  - Add a friendly, casual heading and subtext below the animation telling the user there are no active bills for that zip code.

- [x] **Task 15: Evict Homepage Clutter**
  - Create `src/pages/AboutPage.tsx`. Move all the generic educational content, carousels, and "Why it matters" sections here.
  - Update `src/App.tsx` to include the `<Route path='/about' element={<AboutPage />} />`.
  - Add an "About" link to `src/components/Header.tsx` so users can still find it.

- [x] **Task 16: The "Zillow" Hero Redesign**
  - Gut `src/components/Hero.tsx` and `src/components/HomepageContent.tsx`.
  - The homepage should essentially just be the search Hero, taking up at least `70vh` so it's vertically centered.
  - Supersize the search input: use classes like `text-2xl py-8 px-6`. Apply the neo-brutalist doodle art styling (`border-4 border-foreground shadow-[6px_6px_0px_0px_var(--tw-shadow-color)]`).
  - If a user hasn't searched yet, the space below the search bar should be completely clean (no Lotties, no grid). Only render the bill grid or the Tumbleweed empty state *after* a search submission.

  - [x] **Task 17: Return State Name alongside Jurisdiction**
  - Update `src/utils/zipToJurisdiction.ts`. 
  - Modify the return type to include both the OpenStates jurisdiction ID and the plain English state name (e.g., `{ jurisdiction: 'ocd-jurisdiction/...', stateName: 'California' }`).

- [x] **Task 18: Build the State Reveal Header**
  - Update `src/components/HomepageContent.tsx` (or wherever the bill grid renders).
  - When a search completes successfully, render a massive, neo-brutalist header above the `BillGrid` that says: "Latest Bills in [State Name]".
  - If they search a zip code that has 0 bills in session, the empty state Lottie should explicitly say: "The [State Name] legislature is pretty quiet right now."

- [x] **Task 19: Add a State Dropdown Fallback**
  - Update `src/components/Hero.tsx`.
  - Right below the massive Zip Code input, add a subtle "Or select your state" text link that toggles a simple shadcn `Select` dropdown for the 50 states, giving users an alternative way in.

  - [x] **Task 20: Build the Omni-Search Parser**
  - Update `src/utils/zipToJurisdiction.ts` (rename it to `locationParser.ts` if you want, or just add a new function).
  - Create a new function `parseSearchInput(input: string)` that checks:
    - If input is 5 digits: Run the existing Zip Code API fetch.
    - If input is 2 letters: Match it against state abbreviations.
    - If input is > 2 letters: Do a case-insensitive match against full state names.
  - Return the `{ jurisdictionId, stateName }` object for all valid cases, or throw an error for invalid input.

- [x] **Task 21: Update the Hero Search**
  - Update the `onSubmit` handler in `src/components/Hero.tsx` to use the new `parseSearchInput` logic.
  - Change the placeholder text in the massive input to: `"Enter Zip Code or State..."`.

  - [x] **Task 22: Fix Gemini Model Version (404 Error)**
  - Update `src/services/geminiServices.ts`.
  - Find where the model is initialized (likely `genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })`).
  - Change `"gemini-2.0-flash-exp"` to the stable `"gemini-1.5-flash"`.

  - [x] **Task 23: Force Explicit Gemini Version**
  - Update `src/services/geminiServices.ts`.
  - Change the model string to `"gemini-1.5-flash-latest"`.

- [x] **Task 24: Update Gemini SDK**
  - Run `npm install @google/generative-ai@latest` to ensure the SDK is fully compatible with the v1beta 1.5 models.

  - [x] **Task 25: The API Chokehold (Filter by Type)**
  - Update `src/hooks/useBills.ts`.
  - In the `baseParams` object, add `classification: 'bill'` to stop OpenStates from returning resolutions and memorials entirely.

- [x] **Task 26: The "Junk" Bouncer (Negative Heuristics)**
  - In `src/hooks/useBills.ts` inside the `processedData` logic, create a Regex pattern for junk keywords (e.g., mourning, congratulating, designating, honoring). 
  - Filter out any bill whose title matches these keywords.

- [x] **Task 27: The 7-Day Expiration Rule**
  - In `src/hooks/useBills.ts`, check the `momentum.level` from `analyzeBillMomentum`.
  - If the level is "Stalled" or "Enacted", check `latest_action_date`. 
  - If that date is older than 7 days, filter the bill out of the results.

- [x] **Task 28: The Impact Score (Sorting)**
  - Calculate a custom `relevanceScore`. Start with `momentum.score`.
  - Add +50 points if the bill title contains high-impact keywords (tax, healthcare, housing, gun, school, budget, fee, rent).
  - Sort the final array of bills by `relevanceScore` descending before returning it to the UI.

  - [ ] **Task 29: Update Firestore Rules for Global Cache**
  - Update `firestore.rules`.
  - Add a new match block for `match /bill_summaries/{billId}` that allows public reads and writes (`allow read, write: if true;`). *Note: We are allowing public writes so unauthenticated users can trigger and cache the Gemini fetch.*

- [ ] **Task 30: Implement Firestore Cache Service**
  - Create a new file `src/services/cacheService.ts`.
  - Export two functions using Firebase `getDoc` and `setDoc`: `getCachedSummary(billId)` and `cacheSummary(billId, summaryData)`.

- [ ] **Task 31: Wire the Cache Interceptor**
  - Update `src/hooks/useBillSummary.ts`.
  - Modify the `generateSummary` function to accept `bill.id`.
  - Logic flow: Check `getCachedSummary(bill.id)`. If exists, return it immediately. If null, call `GeminiService.summarizeBillWithImpacts`, then call `cacheSummary(bill.id, newSummary)`, then return it.

- [ ] **Task 32: The "Magic" Placeholder UI**
  - Update `src/components/BillCard.tsx`.
  - If the AI summary is NOT loaded yet, hide the raw OpenStates abstract/summary. 
  - Render a large, full-width button (dashed border, light blue background) with a `Sparkles` icon (from lucide-react) that says "✨ Translate to Plain English".
  - Clicking this button triggers the `generateSummary` function.