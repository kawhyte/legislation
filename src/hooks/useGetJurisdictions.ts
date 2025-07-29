import apiClient from "@/services/api-client";
import { CanceledError } from "axios";
import { useEffect, useState } from "react";

interface Jurisdiction {
	id: string;
	name: string;
	url: string;
}
interface FetchJurisdictionsResponse {
	results: Jurisdiction[];
}
const useGetJurisdictions = () => {
	const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
	const [error, setError] = useState("");
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;
		setLoading(true);
		apiClient
			.get<FetchJurisdictionsResponse>("/jurisdictions", { signal })
			.then((res) => {
				console.log(res.data.results);

				setJurisdictions(res.data.results);
				setLoading(false);
			})
			.catch((err) => {
				if (err instanceof CanceledError) return;

				setError(err.message);
				setLoading(false);
			});

		return () => controller.abort();
	}, []);

	return { jurisdictions, error, isLoading };
};

export default useGetJurisdictions;
