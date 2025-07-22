import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";

interface Bill {
	id: string;
	title: string;
	// introduced: string
	// status: string
	// summary: string
	// sources: string[]
}

interface FetchBillsResponse {
	results: Bill[];
}

const useBills = () => {
	const [bills, setBills] = useState<Bill[]>([]);
	const [error, setError] = useState("");

	useEffect(() => {

         const controller = new AbortController();
         const signal = controller.signal;

		apiClient
			.get<FetchBillsResponse>("/bills", {signal})
			.then((res) => {
				console.log(res.data.results);

				setBills(res.data.results);
			})
			.catch((err) => {
                if (err instanceof CanceledError) return;
			
				setError(err.message);
			});

             return () => controller.abort();
	}, []);

	return { bills, error };
};

export default useBills;
