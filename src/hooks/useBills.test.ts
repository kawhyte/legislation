import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import apiClient from '../services/api-client';
import useBills from './useBills';
import type { States } from '../components/JurisdictionSelector';

vi.mock('../services/api-client', () => ({
	default: { get: vi.fn() },
}));

const mockGet = vi.mocked(apiClient.get);

// apiCache is module-scoped and shared across tests in this file, so each test
// queries its own jurisdiction — otherwise one test's cached response would
// satisfy the next test's request and no fetch would be attempted at all.
let seed = 0;
const jurisdiction = (): States =>
	({ name: `Test State ${seed++}`, abbreviation: 'TS' }) as unknown as States;

const daysAgo = (n: number) => {
	const d = new Date();
	d.setDate(d.getDate() - n);
	return d.toISOString().slice(0, 10);
};

/** Minimal shape useBills' enrichment pipeline needs. */
const bill = (overrides: Record<string, unknown> = {}) => ({
	id: `ocd-bill/${Math.random()}`,
	identifier: 'HB 1',
	title: 'An act relating to housing affordability',
	jurisdiction: { id: 'j1', name: 'Test State', classification: 'state' },
	sources: [],
	subject: [],
	actions: [],
	sponsorships: [],
	votes: [],
	latest_action_date: daysAgo(1),
	...overrides,
});

const renderBills = async (results: unknown[], topic: string | null = null) => {
	mockGet.mockResolvedValue({ data: { results } } as never);
	const state = jurisdiction();
	const { result } = renderHook(() => useBills(state, topic));
	await waitFor(() => expect(result.current.isLoading).toBe(false));
	return result;
};

describe('useBills', () => {
	beforeEach(() => {
		mockGet.mockReset();
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('query params', () => {
		it('builds a state-scoped query', async () => {
			await renderBills([]);

			const [endpoint, config] = mockGet.mock.calls[0];
			expect(endpoint).toBe('/bills');
			expect(config?.params).toMatchObject({
				jurisdiction: expect.stringContaining('Test State'),
				per_page: 20,
				classification: 'bill',
				sort: 'updated_desc',
			});
			expect(config?.params.action_since).toBeTruthy();
			expect(config?.params.created_since).toBeTruthy();
		});

		it('omits q when no topic is selected, and sends it when one is', async () => {
			await renderBills([]);
			expect(mockGet.mock.calls[0][1]?.params.q).toBeUndefined();

			mockGet.mockReset();
			await renderBills([], 'housing');
			expect(mockGet.mock.calls[0][1]?.params.q).toBe('housing');
		});

		it('fires no request without a jurisdiction — there is no nationwide mode', async () => {
			const { result } = renderHook(() => useBills(null, null));
			await waitFor(() => expect(result.current.isLoading).toBe(false));
			expect(mockGet).not.toHaveBeenCalled();
			expect(result.current.data).toEqual([]);
		});
	});

	describe('filtering', () => {
		it('drops ceremonial junk titles', async () => {
			const result = await renderBills([
				bill({ title: 'Congratulating the Springfield High School debate team' }),
				bill({ title: 'An act relating to property tax relief' }),
			]);

			expect(result.current.data.map(b => b.title)).toEqual([
				'An act relating to property tax relief',
			]);
		});

		it('keeps a recently-touched stalled bill but drops a cold one', async () => {
			// "died in committee" is one of analyzeBillMomentum's failure keywords,
			// so these score as Stalled; the recency of the action is then what
			// decides whether the bill is still worth showing.
			const stalled = (date: string, title: string) =>
				bill({
					title,
					latest_action_date: date,
					actions: [{ date, description: 'Died in committee', classification: [] }],
				});

			const result = await renderBills([
				stalled(daysAgo(200), 'An act relating to a cold zoning matter'),
				stalled(daysAgo(1), 'An act relating to a fresh zoning matter'),
			]);

			const titles = result.current.data.map(b => b.title);
			expect(titles).toContain('An act relating to a fresh zoning matter');
			expect(titles).not.toContain('An act relating to a cold zoning matter');
		});
	});
});
