'use client';

import { useEffect, useState, useRef, useMemo } from "react";
import apiClient from "../services/api-client";
import { type AxiosRequestConfig } from "axios";
import { getCached, setCached, makeCacheKey } from "../lib/apiCache";

interface FetchResponse<T> {
	results: T[];
}

/**
 * Requests that have been sent but not yet resolved, keyed by cache key.
 * apiCache is only written once a response lands, so without this two
 * consumers asking for the identical endpoint+params in the same tick would
 * both miss the cache and fire duplicate network requests. Sharing the promise
 * collapses them into one. Entries are removed as soon as the request settles,
 * after which apiCache takes over.
 */
const inFlight = new Map<string, Promise<unknown[]>>();

const fetchShared = <T>(
	cacheKey: string,
	endpoint: string,
	requestConfig?: AxiosRequestConfig
): Promise<T[]> => {
	const existing = inFlight.get(cacheKey);
	if (existing) return existing as Promise<T[]>;

	const request = apiClient
		.get<FetchResponse<T>>(endpoint, { ...requestConfig })
		.then((res) => {
			setCached(cacheKey, res.data.results); // TTL is set on read, not write
			return res.data.results;
		})
		.finally(() => {
			inFlight.delete(cacheKey);
		});

	inFlight.set(cacheKey, request as Promise<unknown[]>);
	return request;
};

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

		// The request itself is shared, so it is never aborted on unmount — a
		// second consumer may still be waiting on it, and the response fills
		// the cache either way. This flag just drops the result for a consumer
		// that unmounted or moved on to different deps.
		let stale = false;

		setLoading(true);
		setError("");

		fetchShared<T>(cacheKey, endpoint, requestConfigRef.current)
			.then((results) => {
				if (stale) return;
				setData(results);
				setLoading(false);
			})
			.catch((err) => {
				console.error("[useData] Fetch error:", err.message);
				if (stale) return;
				setError(err.message);
				setLoading(false);
			});

		return () => {
			stale = true;
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