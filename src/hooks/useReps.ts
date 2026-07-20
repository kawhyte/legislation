'use client';

import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";

export interface Rep {
	id: string;
	name: string;
	party: string;
	image?: string | null;
	current_role?: {
		title: string;
		district: string;
		org_classification: string;
	};
	jurisdiction?: {
		id: string;
		name: string;
		classification: string; // "state" | "country"
	};
}

interface PeopleResponse {
	results: Rep[];
}

const useReps = (coords?: { lat: number; lng: number }) => {
	const [data, setData] = useState<Rep[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!coords) {
			setData(null);
			setIsLoading(false);
			setError("");
			return;
		}

		const controller = new AbortController();
		setIsLoading(true);
		setError("");

		apiClient
			.get<PeopleResponse>("/people.geo", {
				signal: controller.signal,
				params: { lat: coords.lat, lng: coords.lng },
			})
			.then((res) => {
				if (!controller.signal.aborted) {
					setData(res.data.results);
					setIsLoading(false);
				}
			})
			.catch((err) => {
				if (err instanceof CanceledError) return;
				if (!controller.signal.aborted) {
					setError(err.message);
					setIsLoading(false);
				}
			});

		return () => controller.abort();
	}, [coords?.lat, coords?.lng]);

	return { data, isLoading, error };
};

type SinglePersonResponse = Rep;

/**
 * Fetch a single representative by their OpenStates person id.
 * Used as a fallback when a rep isn't already present in SearchCacheContext
 * (e.g. a direct or shared link to /rep/[repId] with no prior session state).
 */
export async function fetchRepById(repId: string): Promise<Rep | null> {
	try {
		const res = await apiClient.get<SinglePersonResponse>(`/people/${encodeURIComponent(repId)}`);
		return res.data;
	} catch {
		return null;
	}
}

export default useReps;
