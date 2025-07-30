
import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError, type AxiosRequestConfig } from "axios";

interface FetchResponse<T> {
	results: T[];
}

const useData = <T>(
	endpoint: string | null,
	requestConfig?: AxiosRequestConfig,
	deps: unknown[] = []
) => {
	const [data, setData] = useState<T[]>([]);
	const [error, setError] = useState("");
	const [isLoading, setLoading] = useState(false);
	console.log("Inital data", data);
	console.log("Inital requestConfig", requestConfig);
	useEffect(() => {
console.log("[useData] Running effect. Endpoint:", endpoint);
		if (!endpoint) return;

		const controller = new AbortController();
		const signal = controller.signal;
		setLoading(true);
		apiClient
			.get<FetchResponse<T>>(endpoint, { signal, ...requestConfig })
			.then((res) => {
							console.log("[useData] Got response:", res.data.results); // ✅ Add this

				console.log("USE data", res.data.results);

				setData(res.data.results);
				setLoading(false);
			})
			.catch((err) => {
							console.error("[useData] Fetch error:", err.message); // ✅ Add this

				if (err instanceof CanceledError) return;

				setError(err.message);
				setLoading(false);
			});

		return () => controller.abort();
	}, [endpoint, requestConfig?.params?.jurisdiction, ...deps]);

	return { data, error, isLoading };
};

export default useData;
