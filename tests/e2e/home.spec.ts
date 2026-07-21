import { test, expect, type Page } from '@playwright/test';

const MOCK_BILLS_RESPONSE = {
  results: [
    {
      id: 'ocd-bill/test-1',
      identifier: 'HB 1',
      title: 'A test bill about housing',
      jurisdiction: { id: 'j1', name: 'Texas', classification: 'state' },
      sources: [],
      subject: ['Housing', 'A', 'Taxation, see also', 'PUBLIC HEALTH'],
      actions: [],
      sponsorships: [],
      votes: [],
      abstracts: [],
      latest_action_date: '2026-01-01',
      first_action_date: '2026-01-01',
      last_action_date: '2026-01-01',
      house_passage_date: '',
      senate_passage_date: '',
      enacted_date: '',
      introduced: '2026-01-01',
      status: 'active',
    },
  ],
};

/**
 * The state picker is a Radix Select. `getByText('Texas').click()` does not work:
 * the list is a scrolling viewport, so an option that far down is mounted but
 * clipped out of view. Open with the keyboard (Radix's supported path), then
 * scroll the option in before clicking it. Type-ahead is not used — Radix resets
 * its buffer on a timer, so "Texas" intermittently lands on "Tennessee".
 */
async function selectTexas(page: Page) {
  const stateSelect = page.getByRole('combobox').first();
  await stateSelect.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox')).toBeVisible();
  // The option's accessible name also carries the flag image's alt text
  // ("Texas flag Texas"), so match on contained text rather than exact name.
  const texas = page.getByRole('option').filter({ hasText: /^Texas$/ });
  await texas.scrollIntoViewIfNeeded();
  await texas.click();
  await expect(stateSelect).toContainText('Texas');
}

test.describe('Homepage', () => {
  test('loads and renders the hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('selecting a jurisdiction renders bill cards from a mocked API response', async ({ page }) => {
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.goto('/');
    await selectTexas(page);
    // `exact: true` targets the rendered bill card title, not the sr-only
    // "Add <title> to saved bills" button label that also contains this text.
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible({ timeout: 10_000 });
  });

  test('bill card: h3 title, cleaned topic chips, and a link to the bill page', async ({ page }) => {
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.goto('/');
    await selectTexas(page);

    const card = page.locator('a[href^="/bill/"]').first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    await expect(card).toHaveAttribute('href', /^\/bill\/ocd-bill/);

    // Title is a real heading, not a styled div.
    await expect(card.locator('h3')).toHaveText('A test bill about housing');

    // The flag stands alone — no redundant state abbreviation next to it.
    await expect(card.getByText('TX', { exact: true })).toHaveCount(0);

    // Index noise ("A", "…, see also") is filtered out and SHOUTY entries are
    // title-cased, leaving at most 2 chips.
    const chips = card.locator('span.rounded-full.border-border');
    await expect(chips).toHaveCount(2);
    await expect(chips.nth(0)).toHaveText('Housing');
    await expect(chips.nth(1)).toHaveText('Public Health');
  });

  test('bookmarking a card does not navigate away', async ({ page }) => {
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.goto('/');
    await selectTexas(page);

    const card = page.locator('a[href^="/bill/"]').first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    await card.getByRole('button', { name: /add .* to saved bills/i }).click();

    // Signed out, the bookmark opens the auth modal — and crucially, the click
    // does not bubble up into the card's link.
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('skeleton-to-card swap does not shift layout', async ({ page }) => {
    // Hold the bills response open long enough to measure the skeleton.
    await page.route('**/api/openstates/bills**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2_000));
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) });
    });
    await page.goto('/');
    await selectTexas(page);

    const skeleton = page.locator('.animate-pulse').first();
    await expect(skeleton).toBeVisible();
    const skeletonCard = skeleton.locator('xpath=ancestor::*[contains(@class,"rounded-xl")][1]');
    const skeletonBox = await skeletonCard.boundingBox();

    const card = page.locator('a[href^="/bill/"]').first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    const cardBox = await card.boundingBox();

    expect(skeletonBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    // Same shell, same rows: any residual difference is content-driven, not a jump.
    expect(Math.abs(skeletonBox!.height - cardBox!.height)).toBeLessThanOrEqual(24);
    expect(Math.abs(skeletonBox!.y - cardBox!.y)).toBeLessThanOrEqual(4);
  });
});
