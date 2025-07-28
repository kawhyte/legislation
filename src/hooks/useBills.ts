import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";

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
}

interface FetchBillsResponse {
	results: Bill[];
}

const useBills = () => {
	const [bills, setBills] = useState<Bill[]>([]);
	const [error, setError] = useState("");
	 const [isLoading, setLoading] = useState(false)

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;
setLoading(true)
		apiClient
			.get<FetchBillsResponse>("/bills", { signal })
			.then((res) => {
				console.log(res.data.results);

				setBills(res.data.results);
				setLoading(false)
			})
			.catch((err) => {
				if (err instanceof CanceledError) return;

				setError(err.message);
				setLoading(false)
			});

		return () => controller.abort();
	}, []);

	return { bills, error, isLoading };
};

export default useBills;
