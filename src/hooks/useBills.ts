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

// interface FetchBillsResponse {
// 	results: Bill[];
// }
const useBills = (selectedJurisdiction: States | null) =>{

	
	return useData<Bill>(
		selectedJurisdiction ? "/bills" : null, // pass `null` to short-circuit in useData
		selectedJurisdiction
			? {
					params: {
						jurisdiction: selectedJurisdiction.name,
					},
			  }
			: undefined,
		[selectedJurisdiction?.name]
	);
}
export default useBills;
