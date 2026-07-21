'use client';

import { useState, useEffect } from "react";
import { computeTrendingScore, type BillEngagement } from "../utils/trendingScore";
import { getTopEngagement } from "@/services/userService";
import type { Bill } from "@/types";

/**
 * National trending feed.
 *
 * The heavy, slow work (8 OpenStates topic queries + enrichment + base ranking)
 * runs server-side and cached in /api/trending — so this hook makes a single,
 * usually-instant request instead of hammering OpenStates from every browser.
 *
 * On top of the server's base ranking, the client layers the per-user
 * engagement nudge (views/saves from Firestore) and does the final sort, so the
 * server response stays user-agnostic and fully cacheable.
 */
const useTrendingBills = () => {
	const [data, setData] = useState<Bill[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		let bills: Bill[] = [];
		let engagement = new Map<string, BillEngagement>();

		const paint = () => {
			if (signal.aborted) return;
			const ranked = [...bills].sort(
				(a, b) =>
					computeTrendingScore(b, engagement.get(b.id)) -
					computeTrendingScore(a, engagement.get(a.id))
			);
			setData(ranked);
		};

		// Best-effort engagement nudge, off the critical path.
		getTopEngagement(200)
			.then((m) => {
				if (signal.aborted) return;
				engagement = m;
				if (bills.length > 0) paint();
			})
			.catch(() => {
				/* engagement unavailable — ignore */
			});

		fetch("/api/trending", { signal })
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
			.then(({ bills: fetched }: { bills: Bill[] }) => {
				if (signal.aborted) return;
				bills = fetched ?? [];
				setIsLoading(false);
				paint();
			})
			.catch((err) => {
				if (signal.aborted) return;
				setError(
					err instanceof Error ? err.message : "Couldn't load trending bills. Try refreshing."
				);
				setIsLoading(false);
			});

		return () => controller.abort();
	}, []);

	return { data, isLoading, error };
};

export default useTrendingBills;
