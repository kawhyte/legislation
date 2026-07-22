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

    // Swapped: the state feed leads, and the national feed is demoted to the
    // labelled backfill band below it (one mocked bill is a thin session).
    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Trending across the US' })).toHaveCount(0);
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Trending nationwide' })).toBeVisible();

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

    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
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

  test('cold load with no stored location offers to set a state', async ({ page }) => {
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.goto('/');
    const chip = page.getByRole('status');
    await expect(chip).toContainText('Showing trending US bills');
    await expect(chip.getByRole('button', { name: /set your state/i })).toBeVisible();
  });

  test('a remembered jurisdiction loads that state feed, once', async ({ page }) => {
    // Exactly one bills request: `setJurisdiction` clears the cache whenever the
    // jurisdiction differs, so a resolution effect that re-fires would thrash it
    // into a fetch loop. This is the regression test for that.
    const billsRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/openstates/bills')) billsRequests.push(req.url());
    });

    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.addInitScript(() => {
      localStorage.setItem('billhound:lastJurisdiction', 'TX');
    });

    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('status')).toContainText('Showing Texas');
    // Never the national feed — the local state won before first paint of a feed.
    await expect(page.getByRole('heading', { name: 'Trending across the US' })).toHaveCount(0);

    await page.waitForTimeout(3_000);
    expect(billsRequests).toHaveLength(1);
    expect(billsRequests[0]).toContain('Texas');
  });

  test('garbage in localStorage is ignored, not looked up', async ({ page }) => {
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.addInitScript(() => {
      localStorage.setItem('billhound:lastJurisdiction', 'florida');
    });
    await page.goto('/');
    await expect(page.getByRole('status')).toContainText('Showing trending US bills');
  });

  test("the chip's action focuses the one existing state picker", async ({ page }) => {
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.goto('/');
    await page.getByRole('status').getByRole('button', { name: /set your state/i }).click();

    // The chip must not build a second picker — it hands off to the hero's.
    await expect(page.getByRole('combobox').first()).toBeFocused();
    await expect(page.getByRole('combobox')).toHaveCount(1);
  });

  test('picking a state updates the chip and is remembered for next visit', async ({ page }) => {
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
    await page.goto('/');
    await selectTexas(page);

    await expect(page.getByRole('status')).toContainText('Showing Texas');
    expect(await page.evaluate(() => localStorage.getItem('billhound:lastJurisdiction'))).toBe('TX');
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

/**
 * PLAN-21 — the chips are a client-side re-sort of bills already in memory.
 * Their whole value is that steering the feed costs zero requests and zero
 * tokens, so the request count is as much the subject of these tests as the
 * ordering is.
 */
test.describe('Homepage — topic chips', () => {
  const CANNABIS_BILL = {
    ...MOCK_BILLS_RESPONSE.results[0],
    id: 'ocd-bill/test-cannabis',
    identifier: 'HB 2',
    title: 'Cannabis retail licensing act',
    subject: ['Cannabis'],
  };

  // Housing (weight 40) outranks cannabis (28) by default, so the cannabis bill
  // can only lead the feed if a chip tap actually moved it.
  const TWO_BILLS = { results: [MOCK_BILLS_RESPONSE.results[0], CANNABIS_BILL] };

  const firstCardTitle = (page: Page) => page.locator('a[href^="/bill/"] h3').first();

  // Two taps, not one, and that is the point: a single tap is worth ~1.43×,
  // which lifts cannabis (28) to 39.9 — still just under housing's 40. The curve
  // is deliberately too gentle to hand the feed over on one tap.
  const TAPS_TO_FLIP = 2;

  async function loadTexasFeed(page: Page) {
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(TWO_BILLS) })
    );
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.addInitScript(() => localStorage.setItem('billhound:lastJurisdiction', 'TX'));
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
  }

  test('a chip tap re-sorts the feed without a single new request', async ({ page }) => {
    const apiRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('/api/')) apiRequests.push(req.url());
    });

    await loadTexasFeed(page);
    await expect(firstCardTitle(page)).toHaveText('A test bill about housing');

    const countBeforeTap = apiRequests.length;
    const weed = page.getByRole('button', { name: 'Weed', exact: true });
    for (let i = 0; i < TAPS_TO_FLIP; i++) await weed.click();

    await expect(firstCardTitle(page)).toHaveText('Cannabis retail licensing act');
    // Re-sorted, not filtered — the housing bill is still on the page.
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible();
    await page.waitForTimeout(1_000);
    expect(apiRequests.length).toBe(countBeforeTap);
  });

  test('the tap is remembered, and Clear forgets it', async ({ page }) => {
    await loadTexasFeed(page);
    const weed = page.getByRole('button', { name: 'Weed', exact: true });
    for (let i = 0; i < TAPS_TO_FLIP; i++) await weed.click();
    await expect(weed).toHaveAttribute('aria-pressed', 'true');
    await expect(firstCardTitle(page)).toHaveText('Cannabis retail licensing act');

    // Survives a reload — affinity lives in localStorage, not component state.
    await page.reload();
    await expect(firstCardTitle(page)).toHaveText('Cannabis retail licensing act', { timeout: 15_000 });
    await expect(page.getByRole('button', { name: 'Weed', exact: true })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect(firstCardTitle(page)).toHaveText('A test bill about housing');
    expect(await page.evaluate(() => localStorage.getItem('billhound:topicAffinity'))).toBeNull();
  });

  test('chips are operable by keyboard alone', async ({ page }) => {
    await loadTexasFeed(page);
    const weed = page.getByRole('button', { name: 'Weed', exact: true });
    await weed.focus();
    await expect(weed).toBeFocused();
    for (let i = 0; i < TAPS_TO_FLIP; i++) await page.keyboard.press('Enter');
    await expect(weed).toHaveAttribute('aria-pressed', 'true');
    await expect(firstCardTitle(page)).toHaveText('Cannabis retail licensing act');
  });

  test('the chip row does not make the page scroll sideways on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await loadTexasFeed(page);
    await expect(page.getByRole('group', { name: 'Sort the feed by topic' })).toBeVisible();

    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});

/**
 * Vercel injects `x-vercel-ip-*` on every production request. `next dev` and any
 * non-Vercel host never send them, so the specs above cover the header-less path
 * and these cover the production one. Resolution runs in a client effect, so the
 * SSR HTML always carries the national chip — these must assert post-hydration.
 */
test.describe('Homepage — IP geo defaulting', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_BILLS_RESPONSE) })
    );
  });

  test.describe('a US visitor', () => {
    test.use({ extraHTTPHeaders: { 'x-vercel-ip-country': 'US', 'x-vercel-ip-country-region': 'FL' } });

    test('is offered their state as a guess, never as a fact', async ({ page }) => {
      await page.goto('/');
      const chip = page.getByRole('status');
      await expect(chip).toContainText("Looks like you're in Florida");
      await expect(chip.getByRole('button', { name: /change your state/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'More in Florida' })).toBeVisible({ timeout: 15_000 });
    });

    test('loses to a remembered jurisdiction — geo is the weakest signal', async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem('billhound:lastJurisdiction', 'TX');
      });
      await page.goto('/');
      await expect(page.getByRole('status')).toContainText('Showing Texas');
      await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
    });
  });

  test.describe('a non-US visitor', () => {
    // Ontario's "ON" and Berlin's "BE" both arrive in the same header a US
    // state would. Neither may be silently read as a US state.
    test.use({ extraHTTPHeaders: { 'x-vercel-ip-country': 'CA', 'x-vercel-ip-country-region': 'ON' } });

    test('is never guessed into a US state', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByRole('status')).toContainText('Showing trending US bills');
      await expect(page.getByText(/Looks like you're in/)).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Trending across the US' })).toBeVisible();
    });
  });
});

/**
 * PLAN-20 — the top tier only exists when one of the viewer's own state
 * legislators actually sponsored a bill in the feed. Everything here turns on
 * the intersection between /people.geo and the sponsorships already in memory.
 */
test.describe('Homepage — from your reps', () => {
  const REP_ID = 'ocd-person/test-rep-1';

  const billSponsoredBy = (personId: string) => ({
    results: [
      {
        ...MOCK_BILLS_RESPONSE.results[0],
        sponsorships: [
          { id: 's1', name: 'Rivers', primary: true, classification: 'primary', person: { id: personId, name: 'Dana Rivers' } },
        ],
      },
    ],
  });

  const rep = (classification: string) => ({
    results: [
      {
        id: REP_ID,
        name: 'Dana Rivers',
        party: 'Democratic',
        current_role: { title: 'Senator', district: '12', org_classification: 'upper' },
        jurisdiction: { id: 'ocd-jurisdiction/texas', name: 'Texas', classification },
      },
    ],
  });

  async function setup(page: Page, bills: object, reps: object) {
    await page.route('**api.zippopotam.us/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ places: [{ 'state abbreviation': 'TX', latitude: '25.9', longitude: '-80.2' }] }),
      })
    );
    await page.route('**/api/trending', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_TRENDING_RESPONSE) })
    );
    await page.route('**/api/openstates/bills**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bills) })
    );
    await page.route('**/api/openstates/people.geo**', route =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(reps) })
    );
  }

  test('a bill your own senator filed leads the feed, attributed and linked', async ({ page }) => {
    await setup(page, billSponsoredBy(REP_ID), rep('state'));
    await page.goto('/?q=33028');

    await expect(page.getByRole('heading', { name: 'From your reps' })).toBeVisible({ timeout: 15_000 });
    const attribution = page.getByRole('link', { name: 'Dana Rivers sponsored this', exact: true });
    await expect(attribution).toBeVisible();

    // The disclosure is where "why am I seeing this" lives — state-level and
    // honest about the zip being a centroid, never "your city" or "voted on".
    await page.getByText('why these? ›').first().click();
    await expect(page.getByText('Bills sponsored by the state legislators who represent ZIP 33028.')).toBeVisible();

    // The attributed bill is not also repeated in the state tier below.
    await expect(page.getByText('A test bill about housing', { exact: true })).toHaveCount(1);

    // Nested-anchor trap: the attribution navigates to the rep, the card to the bill.
    await attribution.click();
    await expect(page).toHaveURL(/\/rep\/ocd-person/);
  });

  test('no matching sponsor means no "From your reps" heading at all', async ({ page }) => {
    // An empty promise of relevance is worse than not making one.
    await setup(page, billSponsoredBy('ocd-person/somebody-else'), rep('state'));
    await page.goto('/?q=33028');

    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'From your reps' })).toHaveCount(0);
  });

  test('federal reps are filtered out — they cannot sponsor a state bill', async ({ page }) => {
    // /people.geo returns congressional reps alongside state ones. Matching on
    // them would be meaningless even when the ids happen to line up.
    await setup(page, billSponsoredBy(REP_ID), rep('country'));
    await page.goto('/?q=33028');

    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'From your reps' })).toHaveCount(0);
  });

  test('a dropdown pick never requests reps and never shows tier 1', async ({ page }) => {
    const geoRequests: string[] = [];
    page.on('request', req => {
      if (req.url().includes('people.geo')) geoRequests.push(req.url());
    });
    await setup(page, billSponsoredBy(REP_ID), rep('state'));

    await page.goto('/');
    await selectTexas(page);

    await expect(page.getByRole('heading', { name: 'More in Texas' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'From your reps' })).toHaveCount(0);
    expect(geoRequests).toEqual([]);
  });
});
