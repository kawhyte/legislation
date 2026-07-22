'use client';

import { useState, useEffect, useMemo } from "react";
import { computeTrendingScore, type BillEngagement, type TopicBoosts } from "../utils/trendingScore";
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
 * engagement nudge (views/saves from Firestore) and the viewer's topic affinity
 * (PLAN-21), then does the final sort — so the server response stays
 * user-agnostic and fully cacheable.
 *
 * @param boosts optional per-topic multipliers. Changing them re-sorts what is
 *   already in memory; it never refetches. Pass a memoised object — a fresh
 *   identity every render would re-sort on every render.
 */
const useTrendingBills = (boosts?: TopicBoosts) => {
	const [bills, setBills] = useState<Bill[]>([]);
	const [engagement, setEngagement] = useState<Map<string, BillEngagement>>(new Map());
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

		// Best-effort engagement nudge, off the critical path.
		getTopEngagement(200)
			.then((m) => {
				if (signal.aborted) return;
				setEngagement(m);
			})
			.catch(() => {
				/* engagement unavailable — ignore */
			});

		fetch("/api/trending", { signal })
			.then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
			.then(({ bills: fetched }: { bills: Bill[] }) => {
				if (signal.aborted) return;
				setBills(fetched ?? []);
				setIsLoading(false);
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

	const data = useMemo(
		() =>
			[...bills].sort(
				(a, b) =>
					computeTrendingScore(b, engagement.get(b.id), undefined, boosts) -
					computeTrendingScore(a, engagement.get(a.id), undefined, boosts)
			),
		[bills, engagement, boosts]
	);

	return { data, isLoading, error };
};

export default useTrendingBills;
