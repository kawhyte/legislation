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
