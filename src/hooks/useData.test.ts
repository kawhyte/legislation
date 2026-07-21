import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import apiClient from '../services/api-client';
import useData from './useData';

vi.mock('../services/api-client', () => ({
	default: { get: vi.fn() },
}));

const mockGet = vi.mocked(apiClient.get);

/** A promise plus the handles to settle it later, so tests control response order. */
const deferred = <T>() => {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
};

const response = (results: unknown[]) => ({ data: { results } });

// apiCache lives in module scope and is shared across tests in this file, so
// every test uses its own params — otherwise one test's cached response would
// satisfy the next test's request and no fetch would be attempted at all.
let keySeed = 0;
const uniqueParams = (extra: Record<string, unknown> = {}) => ({
	jurisdiction: `test-state-${keySeed++}`,
	...extra,
});

describe('useData', () => {
	beforeEach(() => {
		mockGet.mockReset();
		// The hook logs fetch failures; keep the error-path tests quiet.
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('in-flight deduplication', () => {
		it('collapses two concurrent identical requests into one fetch', async () => {
			const params = uniqueParams();
			const d = deferred<ReturnType<typeof response>>();
			mockGet.mockReturnValue(d.promise as never);

			// Both hooks mount before any response lands — the case the dashboard
			// hits when its "all" baseline and its active topic resolve to the
			// same query.
			const first = renderHook(() => useData('/bills', { params }));
			const second = renderHook(() => useData('/bills', { params }));

			expect(mockGet).toHaveBeenCalledTimes(1);

			await act(async () => {
				d.resolve(response([{ id: 'shared' }]));
			});

			expect(mockGet).toHaveBeenCalledTimes(1);
			expect(first.result.current.data).toEqual([{ id: 'shared' }]);
			expect(second.result.current.data).toEqual([{ id: 'shared' }]);
		});

		it('serves a later consumer from the cache once the request has settled', async () => {
			const params = uniqueParams();
			mockGet.mockResolvedValue(response([{ id: 'cached' }]) as never);

			const first = renderHook(() => useData('/bills', { params }));
			await waitFor(() => expect(first.result.current.data).toHaveLength(1));
			expect(mockGet).toHaveBeenCalledTimes(1);

			// Mounted after the response landed: the in-flight entry is gone, so
			// this must come from apiCache rather than a second network call.
			const second = renderHook(() => useData('/bills', { params }));
			await waitFor(() => expect(second.result.current.data).toHaveLength(1));
			expect(mockGet).toHaveBeenCalledTimes(1);
		});

		it('does not share requests across different params', async () => {
			mockGet.mockResolvedValue(response([]) as never);

			// Built once, outside the render callback — params created inline would
			// be a new object on every render and refire the effect each time.
			const housing = uniqueParams({ q: 'housing' });
			const education = uniqueParams({ q: 'education' });

			renderHook(() => useData('/bills', { params: housing }));
			renderHook(() => useData('/bills', { params: education }));

			await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
		});

		it('clears the in-flight entry on failure so a later mount retries', async () => {
			const params = uniqueParams();
			const failing = deferred<ReturnType<typeof response>>();
			mockGet.mockReturnValueOnce(failing.promise as never);

			const first = renderHook(() => useData('/bills', { params }));

			await act(async () => {
				failing.reject(new Error('network down'));
			});
			await waitFor(() => expect(first.result.current.error).toBe('network down'));

			// A failed request writes nothing to the cache, so the next consumer
			// must be free to try again rather than await a dead promise.
			mockGet.mockResolvedValueOnce(response([{ id: 'recovered' }]) as never);
			const second = renderHook(() => useData('/bills', { params }));

			await waitFor(() => expect(second.result.current.data).toEqual([{ id: 'recovered' }]));
			expect(mockGet).toHaveBeenCalledTimes(2);
		});
	});

	describe('out-of-order responses', () => {
		it('ignores a slow first response that lands after the params changed', async () => {
			const slowParams = uniqueParams({ jurisdictionName: 'California' });
			const fastParams = uniqueParams({ jurisdictionName: 'Alaska' });

			const slow = deferred<ReturnType<typeof response>>();
			const fast = deferred<ReturnType<typeof response>>();
			mockGet.mockReturnValueOnce(slow.promise as never).mockReturnValueOnce(fast.promise as never);

			const { result, rerender } = renderHook(
				({ params }) => useData('/bills', { params }),
				{ initialProps: { params: slowParams } }
			);

			// Switch before the first response arrives, as a user re-picking a
			// jurisdiction does.
			rerender({ params: fastParams });
			expect(mockGet).toHaveBeenCalledTimes(2);

			await act(async () => {
				fast.resolve(response([{ id: 'alaska' }]));
			});
			expect(result.current.data).toEqual([{ id: 'alaska' }]);

			// The abandoned request now lands last. Without the stale guard it
			// would overwrite the current selection with the previous one.
			await act(async () => {
				slow.resolve(response([{ id: 'california' }]));
			});

			expect(result.current.data).toEqual([{ id: 'alaska' }]);
		});

		it('ignores a late failure from an abandoned request', async () => {
			const abandoned = uniqueParams();
			const current = uniqueParams();

			const failing = deferred<ReturnType<typeof response>>();
			const succeeding = deferred<ReturnType<typeof response>>();
			mockGet
				.mockReturnValueOnce(failing.promise as never)
				.mockReturnValueOnce(succeeding.promise as never);

			const { result, rerender } = renderHook(
				({ params }) => useData('/bills', { params }),
				{ initialProps: { params: abandoned } }
			);

			rerender({ params: current });

			await act(async () => {
				succeeding.resolve(response([{ id: 'current' }]));
			});
			await act(async () => {
				failing.reject(new Error('stale failure'));
			});

			expect(result.current.data).toEqual([{ id: 'current' }]);
			expect(result.current.error).toBe('');
		});
	});

	it('does not fetch when the endpoint is null', () => {
		const params = uniqueParams();
		renderHook(() => useData(null, { params }));
		expect(mockGet).not.toHaveBeenCalled();
	});
});
