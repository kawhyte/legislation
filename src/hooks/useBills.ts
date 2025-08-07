import type { States } from "@/components/JurisdictionSelector";
import useData from "./useData";

interface Jurisdiction {
	id: string;
	name: string;
	classification: string;
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
	house_passage_date: string; // need to update to the correct type
	senate_passage_date: string; // need to update to the correct type
	enacted_date: string; // need to update to the correct type
}
 // --- 1. Dynamically Calculate the Date ---
 const date = new Date();
 date.setMonth(date.getMonth() - 1); // Set date to 5 months ago

 const year = date.getFullYear();
 const month = String(date.getMonth() + 1).padStart(2, '0');
 const day = String(date.getDate()).padStart(2, '0');
 const fiveMonthsAgoDate = `${year}-${month}-${day}`;

 console.log(`Fetching bills created since: ${fiveMonthsAgoDate}`);


 
const useBills = (selectedJurisdiction: States | null) =>{

	
	return useData<Bill>(
		selectedJurisdiction ? "/bills" : null, // pass `null` to short-circuit in useData
		selectedJurisdiction
			? {
					params: {
						jurisdiction: selectedJurisdiction.name,
						subject:["Technology"],
						created_since: fiveMonthsAgoDate,
						per_page: 12,
						sort: 'updated_desc',
					},
			  }
			: undefined,
		[selectedJurisdiction?.name]
	);
}
export default useBills;
