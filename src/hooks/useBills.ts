// hooks/useBills.ts - Updated with momentum filtering

import type { States } from "@/components/JurisdictionSelector";
import useData from "./useData";
import { useMemo } from "react";
import { filterBillsByMomentum, enrichBillsWithMomentum, type MomentumAnalysis } from "../utils/billMomentum";
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
	actions?: Action[]; // Add actions array
	momentum?: MomentumAnalysis; // Add momentum analysis
}

// Dynamically calculate the date
const MonthAgo = getPastDate(3, 'months');
const DaysAgo = getPastDate(80, 'days');





const useBills = (selectedJurisdiction: States | null) => {
	const { data: rawData, error, isLoading } = useData<Bill>(
		selectedJurisdiction ? "/bills" : null,
		selectedJurisdiction
			? {
					params: {
						jurisdiction: selectedJurisdiction.name,
						// subject: ["Paid Leave", "Artificial Intelligence","Technology", "Healthcare", "Education", "Housing"],
						created_since: MonthAgo,
						per_page: 20, // Increased to account for filtering
						sort: 'updated_desc',
						q:'Paid Leave OR Redistricting OR Technology OR Health care OR Voting OR Artificial Intelligence OR Education OR Election',
						// Include actions in API response
						include: 'actions',
						action_since:DaysAgo
					},
			  }
			: undefined,
		[selectedJurisdiction?.name]
	);

	// Process bills with momentum analysis and filtering
	const processedData = useMemo(() => {
		if (!rawData || rawData.length === 0) return [];

		console.log(`[useBills] Processing ${rawData.length} bills for momentum`);
		
		// Step 1: Enrich bills with momentum analysis
		const enrichedBills = enrichBillsWithMomentum(rawData);
		
		// Step 2: Filter out low/no momentum introduction-stage bills
		const filteredBills = filterBillsByMomentum(enrichedBills);
		
		console.log(`[useBills] Filtered from ${rawData.length} to ${filteredBills.length} bills`);
		
		// Step 3: Log momentum distribution for debugging
		const momentumCounts = filteredBills.reduce((acc: any, bill: Bill) => {
			const level = bill.momentum?.level || 'None';
			acc[level] = (acc[level] || 0) + 1;
			return acc;
		}, {});
		
		console.log('[useBills] Momentum distribution:', momentumCounts);
		
		return filteredBills;
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