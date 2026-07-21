import { test, expect } from '@playwright/test';

// NOTE: These sign-in/sign-up tests only assert that the page renders — not that
// authentication actually succeeds. A real Firebase sign-in flow requires either a
// test Firebase project or mocking `firebase/auth`, which is out of scope for this
// seed suite. Whoever extends this later should add that coverage.

test('sign-in page renders the sign-in form', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

test('reset-password page renders the reset form', async ({ page }) => {
  await page.goto('/reset-password');
  await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();
});

test('trending page renders without crashing', async ({ page }) => {
  await page.route('**/api/openstates/bills**', route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) })
  );
  await page.goto('/trending');
  await expect(page.locator('body')).toBeVisible();
});

test('about page renders', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('body')).toBeVisible();
});
