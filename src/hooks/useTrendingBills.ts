'use client';

import { useState, useEffect } from "react";
import apiClient from "../services/api-client";
import { analyzeBillMomentum } from "../utils/billMomentum";
import { isBillTrending } from "../utils/isBillTrending";
import { getPastDate } from "@/lib/utils";
import { getCached, setCached, makeCacheKey } from "@/lib/apiCache";
import type { Bill } from "@/types";
import { stringify } from "qs";

const TOPICS = ["health", "housing", "education", "tax"] as const;
type Topic = typeof TOPICS[number];

const HIGH_IMPACT =
	/tax|fee|rent|housing|health|medical|weapon|gun|school|education|zoning|abortion|appropriation|budget/i;
const JUNK =
	/mourning|congratulating|designating|commending|renaming|honoring|recognizing|celebrating|memorializing|declaring/i;

const buildParams = (topic: Topic, updatedSince: string) => ({
	q: topic,
	per_page: 10,
	updated_since: updatedSince,
	sort: "updated_desc",
	include: ["actions", "sources", "abstracts"],
	classification: "bill",
});

const useTrendingBills = () => {
	const [data, setData] = useState<Bill[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;
		const updatedSince = getPastDate(30, "days");

		const fetchAll = async () => {
			setIsLoading(true);
			setError("");

			try {
				// Check cache per topic
				const topicResults = TOPICS.map((topic) => ({
					topic,
					params: buildParams(topic, updatedSince),
					cached: getCached<Bill>(makeCacheKey("/bills", buildParams(topic, updatedSince))),
				}));

				const uncached = topicResults.filter((r) => r.cached === null);

				// Only fetch topics not in cache — use allSettled so one failure doesn't kill everything
				const settledResponses = uncached.length > 0
					? await Promise.allSettled(
							uncached.map((r) =>
								apiClient.get<{ results: Bill[] }>("/bills", {
									signal,
									params: r.params,
									paramsSerializer: (p) => stringify(p, { arrayFormat: "repeat" }),
								})
							)
						)
					: [];

				if (signal.aborted) return;

				// Cache only the topics that succeeded
				uncached.forEach((r, i) => {
					const result = settledResponses[i];
					if (result.status === "fulfilled") {
						setCached(makeCacheKey("/bills", r.params), result.value.data.results);
					}
				});

				// If every uncached topic failed, surface an error
				const allFailed =
					settledResponses.length > 0 &&
					settledResponses.every((r) => r.status === "rejected");
				if (allFailed) {
					setError("Couldn't load trending bills. Try refreshing.");
					return;
				}

				// Merge cached + fresh (treat failed topics as empty), then deduplicate
				const seen = new Set<string>();
				const combined: Bill[] = [];

				for (const r of topicResults) {
					const freshIdx = uncached.indexOf(r);
					const settled = freshIdx >= 0 ? settledResponses[freshIdx] : null;
					const bills =
						r.cached ??
						(settled?.status === "fulfilled" ? settled.value.data.results : []);
					for (const bill of bills) {
						if (!seen.has(bill.id)) {
							seen.add(bill.id);
							combined.push(bill);
						}
					}
				}

				const sevenDaysAgo = new Date();
				sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

				// Enrich, filter, sort — same logic as useBills nationwide branch
				const enriched = combined
					.map((bill) => {
						const safe = {
							...bill,
							sources: bill.sources || [],
							subject: bill.subject || [],
							actions: bill.actions || [],
							votes: bill.votes || [],
							sponsorships: bill.sponsorships || [],
						};
						const momentum = analyzeBillMomentum(safe);
						const trendingReason = isBillTrending(safe) ? "Trending" : "";
						const relevanceScore =
							momentum.score + (HIGH_IMPACT.test(safe.title) ? 50 : 0);
						return { ...safe, momentum, trendingReason, relevanceScore };
					})
					.filter((bill) => {
						if (JUNK.test(bill.title)) return false;
						if (
							bill.momentum.level === "Stalled" ||
							bill.momentum.level === "Enacted"
						) {
							const actionDate = bill.latest_action_date
								? new Date(bill.latest_action_date)
								: null;
							if (!actionDate || actionDate < sevenDaysAgo) return false;
						}
						return true;
					})
					.sort((a, b) => b.relevanceScore - a.relevanceScore);

				setData(enriched);
			} catch (err: unknown) {
				if (signal.aborted) return;
				const message =
					err instanceof Error ? err.message : "Failed to load trending bills";
				setError(message);
			} finally {
				if (!signal.aborted) setIsLoading(false);
			}
		};

		fetchAll();
		return () => controller.abort();
	}, []);

	return { data, isLoading, error };
};

export default useTrendingBills;
