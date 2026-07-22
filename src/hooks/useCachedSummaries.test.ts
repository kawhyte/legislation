import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { Bill, BillSummaryData } from "@/types";

const getCachedSummary = vi.fn();
vi.mock("@/services/cacheService", () => ({
	getCachedSummary: (id: string) => getCachedSummary(id),
}));

const { useCachedSummaries } = await import("./useCachedSummaries");

const summary = (who: string): BillSummaryData => ({
	gist: "g",
	whoItAffects: who,
	walletImpact: "w",
	controversy: { for: [], against: [] },
});

const bill = (id: string) => ({ id } as Bill);

beforeEach(() => {
	getCachedSummary.mockReset();
});

describe("useCachedSummaries", () => {
	it("maps only the bills that have a cached summary", async () => {
		getCachedSummary.mockImplementation(async (id: string) =>
			id === "a" ? summary("homeowners") : null
		);

		const { result } = renderHook(() => useCachedSummaries([bill("a"), bill("b")]));

		await waitFor(() => expect(result.current.size).toBe(1));
		expect(result.current.get("a")?.whoItAffects).toBe("homeowners");
		expect(result.current.has("b")).toBe(false);
	});

	// Callers build a fresh array every render; keying the effect on the joined
	// id string is what stops a 20-card feed refetching forever.
	it("does not refire when the array identity changes but the ids do not", async () => {
		getCachedSummary.mockResolvedValue(summary("renters"));

		const { result, rerender } = renderHook(({ bills }) => useCachedSummaries(bills), {
			initialProps: { bills: [bill("a"), bill("b")] },
		});

		await waitFor(() => expect(result.current.size).toBe(2));
		expect(getCachedSummary).toHaveBeenCalledTimes(2);

		rerender({ bills: [bill("a"), bill("b")] });
		await waitFor(() => expect(result.current.size).toBe(2));
		expect(getCachedSummary).toHaveBeenCalledTimes(2);
	});

	it("refires when the ids actually change", async () => {
		getCachedSummary.mockResolvedValue(summary("renters"));

		const { rerender } = renderHook(({ bills }) => useCachedSummaries(bills), {
			initialProps: { bills: [bill("a")] },
		});

		await waitFor(() => expect(getCachedSummary).toHaveBeenCalledTimes(1));
		rerender({ bills: [bill("a"), bill("c")] });
		await waitFor(() => expect(getCachedSummary).toHaveBeenCalledTimes(3));
	});

	it("reads nothing for an empty list", async () => {
		const { result } = renderHook(() => useCachedSummaries([]));
		expect(result.current.size).toBe(0);
		expect(getCachedSummary).not.toHaveBeenCalled();
	});

	// A Firestore outage must degrade the feed to titles, not break it.
	it("survives a rejected read", async () => {
		getCachedSummary.mockRejectedValue(new Error("firestore down"));
		const { result } = renderHook(() => useCachedSummaries([bill("a")]));
		await waitFor(() => expect(getCachedSummary).toHaveBeenCalled());
		expect(result.current.size).toBe(0);
	});
});
