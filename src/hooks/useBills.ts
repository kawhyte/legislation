'use client';

import type { States } from "@/components/JurisdictionSelector";
import useData from "./useData";
import { useMemo } from "react";
import { analyzeBillMomentum } from "../utils/billMomentum";
import { getPastDate } from "@/lib/utils";
import type { Bill } from "@/types";

import { isBillTrending } from "../utils/isBillTrending";

// Keep existing date calculations - NO CHANGES to avoid breaking state queries
const MonthAgo = getPastDate(5, 'months');

const DaysAgo = getPastDate(90, 'days');
const RecentForTrending = getPastDate(30, 'days'); // New: Only for trending



const useBills = (selectedJurisdiction: States | null, selectedTopic: string | null) => {
	const params = useMemo(() => {
		const baseParams: Record<string, string | number | string[]> = {
			sort: 'updated_desc',
			include: ['actions','sources','abstracts', 'votes', 'sponsorships'],
			classification: 'bill',
		};

		if (selectedJurisdiction) {
			// UNCHANGED: Keep existing state-specific logic to avoid breaking BillCard
			baseParams.action_since = DaysAgo;
			baseParams.jurisdiction = selectedJurisdiction.name;
			baseParams.created_since = MonthAgo;
			baseParams.per_page = 20;
			if (selectedTopic) {
				baseParams.q = selectedTopic;
			}
		} else {
			baseParams.per_page = 20;
			baseParams.updated_since = RecentForTrending;
			
			// REQUIRED: Provide a simple, broad query that should return results
			// Using OR syntax (most APIs support this)
            baseParams.q = selectedTopic || 'artificial intelligence';
			
		}
		
		return baseParams;
	}, [selectedJurisdiction, selectedTopic]);

	const { data: rawData, error, isLoading } = useData<Bill>(
		"/bills",
		{ params },
		[params]
	);

	// Enhanced processing with safe fallbacks
	const processedData = useMemo(() => {
		if (!rawData || rawData.length === 0) {
			return [];
		}

		// NEW: Safe trending filtering only for nationwide view
		let filteredBills = [...rawData]; // Safe copy to avoid mutations
		
		if (!selectedJurisdiction) {
			// CRITICAL: Ensure we get bills from multiple states, not just Massachusetts
			const massachusettsBills = filteredBills.filter(bill => 
				bill.jurisdiction?.name?.toLowerCase() === 'massachusetts'
			);
			const otherStateBills = filteredBills.filter(bill => 
				bill.jurisdiction?.name?.toLowerCase() !== 'massachusetts'
			);
			
			// If we only have Massachusetts bills, that's the API limitation issue
			if (otherStateBills.length === 0 && massachusettsBills.length > 0) {
				console.warn('[useBills] WARNING: API only returned Massachusetts bills. This suggests a query limitation.');
				console.warn('[useBills] Recommendation: Contact API provider or use different query strategy');
			}
			
			// For now, limit Massachusetts bills to ensure variety if we have other states
			if (otherStateBills.length > 0) {
				const limitedMassBills = massachusettsBills.slice(0, Math.min(5, massachusettsBills.length));
				filteredBills = [...limitedMassBills, ...otherStateBills];
			}
			
			// Apply other trending filters
			const recentActivityBills = filteredBills.filter(bill => {
				if (!bill.latest_action_date) return true; // Keep bills without dates
				const actionDate = new Date(bill.latest_action_date);
				const cutoffDate = new Date(RecentForTrending);
				return actionDate > cutoffDate;
			});
			
			// Use recent activity if we have enough, otherwise keep all
			if (recentActivityBills.length >= 10) {
				filteredBills = recentActivityBills;
			}
			
		}

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
					subject: bill.subject || [],
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

		// Nationwide: cap after relevance sort
		const finalBills = !selectedJurisdiction ? enrichedBills.slice(0, 20) : enrichedBills;

		return finalBills;
	}, [rawData, selectedJurisdiction]);

	return { 
		data: processedData, 
		error, 
		isLoading,
		totalFetched: rawData?.length || 0,
		totalDisplayed: processedData.length
	};
};

export default useBills;
