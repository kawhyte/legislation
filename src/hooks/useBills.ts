'use client';

import type { States } from "@/components/JurisdictionSelector";
import useData from "./useData";
import { useMemo } from "react";
import { analyzeBillMomentum } from "../utils/billMomentum";
import { getPastDate, cleanSubjects } from "@/lib/utils";
import type { Bill } from "@/types";

import { isBillTrending } from "../utils/isBillTrending";

// Keep existing date calculations - NO CHANGES to avoid breaking state queries
const MonthAgo = getPastDate(5, 'months');

const DaysAgo = getPastDate(90, 'days');

/**
 * Bills for one state jurisdiction, enriched with momentum and filtered for
 * relevance.
 *
 * There is deliberately no nationwide mode: the national feed is computed and
 * ranked server-side by `/api/trending` (see `useTrendingBills`), so this hook
 * requires a jurisdiction.
 *
 * @param selectedJurisdiction the state to query. Callers whose jurisdiction
 *   arrives asynchronously may pass null; that is treated as "not ready yet"
 *   and fires no request — it is not a nationwide query.
 * @param selectedTopic optional full-text query, or null for all bills
 * @param options.enabled pass false to suppress the request for a caller that
 *   is not ready (e.g. the dashboard, waiting on Firestore preferences).
 */
const useBills = (
	selectedJurisdiction: States | null,
	selectedTopic: string | null,
	options: { enabled?: boolean } = {}
) => {
	const { enabled = true } = options;
	const params = useMemo(() => {
		if (!selectedJurisdiction) return null;

		const baseParams: Record<string, string | number | string[]> = {
			sort: 'updated_desc',
			// NOTE: `votes` and `abstracts` are intentionally omitted. Requesting
			// `votes` for 20 bills makes the OpenStates backend time out (504) on
			// high-volume states like California — dropping it takes the query from
			// ~60s/timeout to ~1s. `votes` was only used by isBillTrending's
			// close-vote signal (the other trending criteria still work), and
			// `abstracts` is not consumed anywhere in the app.
			include: ['actions', 'sources', 'sponsorships'],
			classification: 'bill',
			action_since: DaysAgo,
			jurisdiction: selectedJurisdiction.name,
			created_since: MonthAgo,
			per_page: 20,
		};

		if (selectedTopic) {
			baseParams.q = selectedTopic;
		}

		return baseParams;
	}, [selectedJurisdiction, selectedTopic]);

	const { data: rawData, error, isLoading } = useData<Bill>(
		enabled && params ? "/bills" : null,
		{ params: params ?? {} },
		[params]
	);

	// Enhanced processing with safe fallbacks
	const processedData = useMemo(() => {
		if (!rawData || rawData.length === 0) {
			return [];
		}

		const filteredBills = [...rawData]; // Safe copy to avoid mutations

		const HIGH_IMPACT = /tax|fee|rent|housing|health|medical|weapon|gun|school|education|zoning|abortion|appropriation|budget/i;
		const JUNK = /mourning|congratulating|designating|commending|renaming|honoring|recognizing|celebrating|memorializing|declaring/i;
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		// Enrich, filter, and sort
		const enrichedBills = filteredBills
			.map(bill => {
				const safeBill = {
					...bill,
					sources: bill.sources || [],
					subject: cleanSubjects(bill.subject),
					actions: bill.actions || [],
					votes: bill.votes || [],
					sponsorships: bill.sponsorships || [],
				};
				const momentum = analyzeBillMomentum(safeBill);
				const trendingReason = isBillTrending(safeBill) ? "Trending" : "";
				const relevanceScore = momentum.score + (HIGH_IMPACT.test(safeBill.title) ? 50 : 0);
				return { ...safeBill, momentum, trendingReason, relevanceScore };
			})
			.filter(bill => {
				if (JUNK.test(bill.title)) return false;
				if (bill.momentum.level === 'Stalled' || bill.momentum.level === 'Enacted') {
					const actionDate = bill.latest_action_date ? new Date(bill.latest_action_date) : null;
					if (!actionDate || actionDate < sevenDaysAgo) return false;
				}
				return true;
			})
			.sort((a, b) => b.relevanceScore - a.relevanceScore);

		return enrichedBills;
	}, [rawData]);

	return { 
		data: processedData, 
		error, 
		isLoading,
		totalFetched: rawData?.length || 0,
		totalDisplayed: processedData.length
	};
};

export default useBills;
