import { test, expect } from '@playwright/test';

const MOCK_BILLS_RESPONSE = {
  results: [
    {
      id: 'ocd-bill/test-1',
      identifier: 'HB 1',
      title: 'A test bill about housing',
      jurisdiction: { id: 'j1', name: 'Texas', classification: 'state' },
      sources: [],
      subject: [],
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
    // The exact selector for the state picker depends on JurisdictionSelector's rendered DOM;
    // this targets the visible Select trigger inside the Hero component.
    const stateSelect = page.getByRole('combobox').first();
    await stateSelect.click();
    await page.getByText('Texas', { exact: false }).first().click();
    // `exact: true` targets the rendered bill card title, not the sr-only
    // "Add <title> to saved bills" button label that also contains this text.
    await expect(page.getByText('A test bill about housing', { exact: true })).toBeVisible({ timeout: 10_000 });
  });
});
