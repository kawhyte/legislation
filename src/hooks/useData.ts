import { useEffect, useState, useRef, useMemo } from "react";
import apiClient from "../services/api-client";
import { CanceledError, type AxiosRequestConfig } from "axios";
import { getCached, setCached, makeCacheKey } from "../lib/apiCache";

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
	
	// Use ref to avoid unnecessary re-renders from requestConfig changes
	const requestConfigRef = useRef(requestConfig);
	requestConfigRef.current = requestConfig;

	// Create stable dependency strings to prevent unnecessary effect triggers
	const stableDeps = useMemo(() => JSON.stringify(deps), [deps]);
	const stableParams = useMemo(() => 
		JSON.stringify(requestConfig?.params || {}), 
		[requestConfig?.params]
	);

	useEffect(() => {
		console.log("[useData] Running effect. Endpoint:", endpoint);
		
		// Early return if no endpoint
		if (!endpoint) {
			setData([]);
			setLoading(false);
			setError("");
			return;
		}

		// Check cache before making a network request
		// Reps and jurisdictions change very rarely — use a 24-hour TTL for them
		const LONG_TTL = 24 * 60 * 60 * 1000;
		const cacheTtl = (endpoint === '/people.geo' || endpoint === '/jurisdictions') ? LONG_TTL : undefined;
		const cacheKey = makeCacheKey(endpoint, requestConfigRef.current?.params || {});
		const cached = getCached<T>(cacheKey, cacheTtl);
		if (cached) {
			setData(cached);
			setLoading(false);
			return;
		}

		const controller = new AbortController();
		const signal = controller.signal;

		setLoading(true);
		setError("");

		apiClient
			.get<FetchResponse<T>>(endpoint, {
				signal,
				...requestConfigRef.current
			})
			.then((res) => {
				console.log("[useData] Got response:", res.data.results);

				// Only update state if request wasn't aborted
				if (!signal.aborted) {
					setData(res.data.results);
					setCached(cacheKey, res.data.results); // TTL is set on read, not write
					setLoading(false);
				}
			})
			.catch((err) => {
				console.error("[useData] Fetch error:", err.message);

				// Don't handle canceled requests
				if (err instanceof CanceledError) return;

				// Only update state if request wasn't aborted
				if (!signal.aborted) {
					setError(err.message);
					setLoading(false);
				}
			});

		// Cleanup function to abort request on unmount or dependency change
		return () => {
			console.log("[useData] Aborting request for:", endpoint);
			controller.abort();
		};
	}, [endpoint, stableDeps, stableParams]);

	// Reset data when endpoint changes to null
	useEffect(() => {
		if (!endpoint) {
			setData([]);
			setError("");
			setLoading(false);
		}
	}, [endpoint]);

	return { data, error, isLoading };
};

export default useData;