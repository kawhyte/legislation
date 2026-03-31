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