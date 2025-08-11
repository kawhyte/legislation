// hooks/useBills.ts - Updated with momentum filtering

import type { States } from "@/components/JurisdictionSelector";
import useData from "./useData";
import { useMemo } from "react";
import { enrichBillsWithMomentum, type MomentumAnalysis } from "../utils/billMomentum";
import { getPastDate } from "@/lib/utils";

interface Jurisdiction {
	id: string;
	name: string;
	classification: string;
}

  interface Organization {
	id: string;
	name: string;
	classification: 'lower' | 'upper' | string; // Can be specific or a general string
  }
  
interface Action {
	id: string;
	organization: Organization;
	description: string;
	date: string; // The type is string, but you can convert it to a Date object upon processing.
	classification: string[];
	order: number;
  }

export interface Bill {
	id: string;
	title: string;
	introduced: string;
	status: string;
	summary: string;
	sources: string[];
	jurisdiction: Jurisdiction;
	latest_action?: string;
	identifier: string;
	latest_action_date: string;
	first_action_date: string;
	last_action_date: string;
	subject: string[];
	house_passage_date: string;
	senate_passage_date: string;
	enacted_date: string;
	actions?: Action[];
	momentum?: MomentumAnalysis;
	trendingReason?: string; // Add field for trending context
}

// Dynamically calculate the date
const MonthAgo = getPastDate(4, 'months');
const OneYearAgo = getPastDate(12, 'months');
const DaysAgo = getPastDate(280, 'days');

const useBills = (selectedJurisdiction: States | null) => {
	// The useMemo hook ensures that the params object is only recreated when the jurisdiction changes.
	// This is crucial for preventing infinite loops and unnecessary API calls in the useData hook.
	const params = useMemo(() => {
		const baseParams: Record<string, any> = {
			sort: 'updated_desc',
			include: 'actions',
			action_since: DaysAgo,
		};

		if (selectedJurisdiction) {
			// Logic for when a specific state is selected
			baseParams.jurisdiction = selectedJurisdiction.name;
			baseParams.created_since = MonthAgo;
			baseParams.per_page = 20;
		} else {
			// Logic for the nationwide "Trending" view
			baseParams.per_page = 20; // Get the max allowed bills to ensure a good mix
			// This query searches for bills that contain any of these high-impact keywords.
			baseParams.q = '("artificial intelligence" OR "paid leave" OR "housing" OR "rent control" OR "teacher salary" OR "election security" OR "voting rights" OR "water rights" OR "clean energy")';
			// Adding a date filter makes the nationwide query much faster and avoids timeouts.
			baseParams.created_since = OneYearAgo;
		}
		return baseParams;
	}, [selectedJurisdiction]);

	const { data: rawData, error, isLoading } = useData<Bill>(
		"/bills",
		{ params },
		[params] // The dependency array now uses the stable params object
	);

	// Process bills with momentum analysis and filtering
	const processedData = useMemo(() => {
		if (!rawData || rawData.length === 0) return [];

		const trendingKeywords = [
			'artificial intelligence', 'paid leave', 'housing', 'rent control', 
			'teacher salary', 'election security', 'voting rights', 'water rights', 'clean energy'
		];

		// Implements a "best available reason" strategy for why a bill is trending.
		const getTrendingReason = (bill: Bill): string => {
			// 1. First, try to find a direct keyword match in the title or abstract.
			const searchableText = (
				bill.title + ' ' + (bill.abstracts?.[0]?.abstract || '')
			).toLowerCase();
			
			const keywordReason = trendingKeywords.find(keyword => searchableText.includes(keyword));
			if (keywordReason) return keywordReason;

			// 2. If no keyword match, fall back to the first subject tag.
			if (bill.subject && bill.subject.length > 0) {
				return bill.subject[0];
			}

			// 3. As a final resort, use a generic but relevant reason.
			return "Recent Activity";
		};

		// Enrich bills with momentum and a guaranteed trending reason
		const enrichedBills = rawData.map(bill => {
			const momentum = enrichBillsWithMomentum([bill])[0].momentum;
			const trendingReason = getTrendingReason(bill);
			return { ...bill, momentum, trendingReason };
		});
		
		console.log(`[useBills] Displaying ${enrichedBills.length} trending bills`);
		
		return enrichedBills;
	}, [rawData]);

	return { 
		data: processedData, 
		error, 
		isLoading,
		// Additional metadata for debugging
		totalFetched: rawData?.length || 0,
		totalDisplayed: processedData.length
	};
};

export default useBills;