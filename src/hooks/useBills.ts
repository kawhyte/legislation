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
	identifier: string;
	latest_action_date: string;
	house_passage_date:string // need to update to the correct type
	senate_passage_date:string // need to update to the correct type
	enacted_date:string // need to update to the correct type
}

// interface FetchBillsResponse {
// 	results: Bill[];
// }

const useBills = () => useData<Bill>("/bills");


export default useBills;
