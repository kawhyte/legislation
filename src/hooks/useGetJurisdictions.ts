import useData from "./useData";

export interface Jurisdiction {
	id: string;
	name: string;
	url: string;
	classification: string;
}

const useGetJurisdictions = () =>
	useData<Jurisdiction>("/jurisdictions", {
		params: {
			classification: "state",
		},
	},['state']);

export default useGetJurisdictions;
