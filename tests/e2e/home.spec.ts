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

const MOCK_TRENDING_RESPONSE = {
  bills: [
    {
      ...MOCK_BILLS_RESPONSE.results[0],
      id: 'ocd-bill/trending-1',
      identifier: 'SB 9',
      title: 'A national trending bill about health',
      trendingReason: 'Trending',
    },
  ],
};

test.describe('Homepage', () => {
  test('cold load shows trending bills with no interaction', async ({ page }) => {
    // The whole point of the un-gate: value on first paint, zero clicks.
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.goto('/');
    await expect(page.locator('a[href^="/bill/"]').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('A national trending bill about health', { exact: true })).toBeVisible();
  });

  test('restoring ?q= does not flash the national feed', async ({ page }) => {
    // A zip, not a state name: `parseLocationInput('Texas')` resolves in a
    // microtask, so it never opens a window in which the flash could happen.
    // A zip awaits a real network lookup — that async gap is the actual bug.
    await page.route('**api.zippopotam.us/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1_500));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ places: [{ 'state abbreviation': 'TX', latitude: '25.9', longitude: '-80.2' }] }),
      });
    });
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );

    // Assert on the section heading, not a card: the heading paints immediately,
    // so it catches a flash of trending *skeletons* too — which is what a
    // visitor actually sees regress.
    const trendingHeading = page.getByRole('heading', { name: 'Trending across the US' });
    let sawTrending = false;
    const poll = setInterval(() => {
      trendingHeading.isVisible().then(v => { if (v) sawTrending = true; }).catch(() => {});
    }, 50);

    await page.goto('/?q=33028');
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible({ timeout: 15_000 });
    clearInterval(poll);

    expect(sawTrending).toBe(false);
  });

  test('empty /api/trending renders the tumbleweed, not an error', async ({ page }) => {
    // Every one of the 8 topic queries catches its own timeout and returns [],
    // so an empty feed is a legitimate response, not a failure. It must never
    // surface the destructive "Error Fetching Bills" alert.
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ bills: [] }) })
    );
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'No Trending Bills' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Error Fetching Bills')).toHaveCount(0);
    await expect(page.locator('a[href^="/bill/"]')).toHaveCount(0);
  });

  test('picking a state swaps trending for state bills plus the reps sidebar', async ({ page }) => {
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );

    await page.goto('/');
    // Trending is the pre-selection state.
    await expect(page.getByRole('heading', { name: 'Trending across the US' })).toBeVisible({ timeout: 10_000 });

    await selectTexas(page);

    // Swapped: state feed in, national feed out.
    await expect(page.getByRole('heading', { name: 'Latest Bills in Texas' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Trending across the US' })).toHaveCount(0);
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible();
    await expect(page.getByText('A national trending bill about health', { exact: true })).toHaveCount(0);

    // The reps sidebar comes back with the state feed. A dropdown pick carries
    // no coords, so it is the "add your zip" prompt rather than rep cards —
    // that prompt is correct here and deliberately absent from trending.
    // YourRepsWidget renders a mobile strip and a desktop sidebar as separate
    // DOM, so filter to the copy actually shown at this viewport; `.first()`
    // would pick the display:none mobile one.
    await expect(page.getByRole('heading', { name: 'Your Representatives' }).locator('visible=true')).toBeVisible();
    await expect(page.getByText('Want to see how your reps vote?').locator('visible=true')).toBeVisible();
  });

  test('a zip restore fills the reps sidebar with actual representatives', async ({ page }) => {
    await page.route('**api.zippopotam.us/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ places: [{ 'state abbreviation': 'TX', latitude: '25.9', longitude: '-80.2' }] }),
      })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.route('**/api/openstates/people.geo**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 'ocd-person/test-rep-1',
              name: 'Dana Rivers',
              party: 'Democratic',
              current_role: { title: 'Senator', district: '12', org_classification: 'upper' },
            },
          ],
        }),
      })
    );

    await page.goto('/?q=33028');

    await expect(page.getByRole('heading', { name: 'Latest Bills in Texas' })).toBeVisible({ timeout: 15_000 });
    // Desktop sidebar copy — see the note above about the widget's two layouts.
    await expect(page.getByText('Dana Rivers').locator('visible=true')).toBeVisible();
    await expect(page.getByRole('link', { name: /see their votes/i }).locator('visible=true'))
      .toHaveAttribute('href', /^\/rep\/ocd-person/);
  });

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

    // No summary is cached for a mocked bill, so the feed card degrades to the
    // title — still a real heading, not a styled div (PLAN-18).
    await expect(card.locator('h3')).toHaveText('A test bill about housing');

    // The flag stands alone — no redundant state abbreviation next to it.
    await expect(card.getByText('TX', { exact: true })).toHaveCount(0);

    // Index noise ("A", "…, see also") is filtered out and SHOUTY entries are
    // title-cased. The feed variant renders 1 chip so the hook keeps the visual
    // weight; the detailed variant's 2 chips are covered in BillCard.test.tsx.
    const chips = card.locator('span.rounded-full.border-border');
    await expect(chips).toHaveCount(1);
    await expect(chips.nth(0)).toHaveText('Housing');
  });

  test('feed cards never request an AI summary', async ({ page }) => {
    // The hook line is cache-only by design: a 20-card feed must cost zero
    // Gemini tokens. A stray /api/summarize call here is a live billing leak.
    const summarizeRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/summarize')) summarizeRequests.push(req.url());
    });

    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );

    await page.goto('/');
    await expect(page.locator('a[href^="/bill/"]').first()).toBeVisible({ timeout: 10_000 });
    await selectTexas(page);
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible({ timeout: 10_000 });

    expect(summarizeRequests).toEqual([]);
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

  test('no analytics requests fire while analytics is disabled', async ({ page }) => {
    // CI runs without NEXT_PUBLIC_ANALYTICS_ENABLED, so instrumentation must be
    // completely inert — it cannot slow or break the page in tests.
    const trackRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/track')) trackRequests.push(req.url());
    });

    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.goto('/');
    await selectTexas(page);

    const card = page.locator('a[href^="/bill/"]').first();
    await expect(card).toBeVisible({ timeout: 10_000 });
    await card.click();

    expect(trackRequests).toEqual([]);
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
