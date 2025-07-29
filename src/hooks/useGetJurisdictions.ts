import useData from "./useData";

export interface Jurisdiction {
	id: string;
	name: string;
	url: string;
}

const useGetJurisdictions = () => useData<Jurisdiction>("/jurisdictions");

export default useGetJurisdictions;
