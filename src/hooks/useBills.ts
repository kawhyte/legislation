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
		};

		console.log('[useBills] Selected jurisdiction:', selectedJurisdiction);

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
			// FIXED: API requires either 'jurisdiction' or 'q' parameter
			console.log('[useBills] Fetching trending bills - API requires q parameter...');
			
			baseParams.per_page = 20;
			baseParams.updated_since = RecentForTrending;
			
			// REQUIRED: Provide a simple, broad query that should return results
			// Using OR syntax (most APIs support this)
            baseParams.q = selectedTopic || 'artificial intelligence';
			
			console.log('[useBills] Trending query params:', baseParams);
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
			console.log('[useBills] No raw data received from API');
			return [];
		}

		console.log(`[useBills] Processing ${rawData.length} bills from API`);

		// NEW: Safe trending filtering only for nationwide view
		let filteredBills = [...rawData]; // Safe copy to avoid mutations
		
		if (!selectedJurisdiction) {
			console.log('[useBills] Applying trending filters for nationwide results...');
			
			// CRITICAL: Ensure we get bills from multiple states, not just Massachusetts
			const massachusettsBills = filteredBills.filter(bill => 
				bill.jurisdiction?.name?.toLowerCase() === 'massachusetts'
			);
			const otherStateBills = filteredBills.filter(bill => 
				bill.jurisdiction?.name?.toLowerCase() !== 'massachusetts'
			);
			
			console.log(`[useBills] Bills by state: Massachusetts: ${massachusettsBills.length}, Other states: ${otherStateBills.length}`);
			
			// If we only have Massachusetts bills, that's the API limitation issue
			if (otherStateBills.length === 0 && massachusettsBills.length > 0) {
				console.warn('[useBills] WARNING: API only returned Massachusetts bills. This suggests a query limitation.');
				console.warn('[useBills] Recommendation: Contact API provider or use different query strategy');
			}
			
			// For now, limit Massachusetts bills to ensure variety if we have other states
			if (otherStateBills.length > 0) {
				const limitedMassBills = massachusettsBills.slice(0, Math.min(5, massachusettsBills.length));
				filteredBills = [...limitedMassBills, ...otherStateBills];
				console.log(`[useBills] Balanced state distribution: MA: ${limitedMassBills.length}, Others: ${otherStateBills.length}`);
			}
			
			// Apply other trending filters
			const recentActivityBills = filteredBills.filter(bill => {
				if (!bill.latest_action_date) return true; // Keep bills without dates
				const actionDate = new Date(bill.latest_action_date);
				const cutoffDate = new Date(RecentForTrending);
				return actionDate > cutoffDate;
			});
			
			console.log(`[useBills] Bills with recent activity: ${recentActivityBills.length}/${filteredBills.length}`);
			
			// Use recent activity if we have enough, otherwise keep all
			if (recentActivityBills.length >= 10) {
				filteredBills = recentActivityBills;
			}
			
			// Sort by most recent activity for trending relevance
			filteredBills.sort((a, b) => {
				const dateA = new Date(a.latest_action_date || a.introduced);
				const dateB = new Date(b.latest_action_date || b.introduced);
				return dateB.getTime() - dateA.getTime();
			});
			
			// Limit to reasonable number for trending display
			filteredBills = filteredBills.slice(0, 20);
		}

		// SAFE: Keep existing enrichment logic unchanged
		const enrichedBills = filteredBills.map(bill => {
			// Ensure all expected properties exist for BillCard compatibility
			const safeBill = {
				...bill,
				sources: bill.sources || [], // Ensure sources array exists
				subject: bill.subject || [], // Ensure subject array exists
				actions: bill.actions || [], // Ensure actions array exists
				votes: bill.votes || [],
				sponsorships: bill.sponsorships || [],
			};
			
			const momentum = analyzeBillMomentum(safeBill);
			const trendingReason = isBillTrending(safeBill) ? "Trending" : "";
			return { ...safeBill, momentum, trendingReason };
		});
		
		console.log(`[useBills] Final result:`, {
			mode: selectedJurisdiction ? 'State-specific' : 'Trending',
			fetched: rawData.length,
			filtered: filteredBills.length,
			enriched: enrichedBills.length,
			sampleTitles: enrichedBills.slice(0, 3).map(b => b.title)
		});
		
		return enrichedBills;
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
