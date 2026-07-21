'use client';

import { useMemo } from "react";
import apiClient from "../services/api-client";
import useData from "./useData";

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

// Reps for a given point change very rarely, and several widgets can ask for
// the same coordinates at once (the dashboard renders one while a rep page
// mounts another). Going through useData gives this the shared apiCache — which
// already grants /people.geo a 24-hour TTL — plus in-flight deduplication, so
// identical lookups no longer each hit the network.
const useReps = (coords?: { lat: number; lng: number }) => {
	// Keyed on the coordinate values, not the object identity — callers build a
	// fresh coords object each render, which would otherwise refire every time.
	const params = useMemo(
		() => (coords ? { lat: coords.lat, lng: coords.lng } : {}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[coords?.lat, coords?.lng]
	);

	const { data, error, isLoading } = useData<Rep>(
		coords ? "/people.geo" : null,
		{ params },
		[params]
	);

	// Callers distinguish "nothing requested" (null) from "requested and came
	// back empty" ([]), so preserve that rather than always handing back an array.
	return { data: coords ? data : null, isLoading, error };
};

/**
 * Fetch a single representative by their OpenStates person id.
 * Used as a fallback when a rep isn't already present in SearchCacheContext
 * (e.g. a direct or shared link to /rep/[repId] with no prior session state).
 *
 * OpenStates v3 has no `/people/{id}` path lookup (it 404s) — the id must be
 * passed as a query param to the list endpoint, which returns it inside the
 * usual `{results: [...]}` wrapper.
 */
export async function fetchRepById(repId: string): Promise<Rep | null> {
	try {
		const res = await apiClient.get<PeopleResponse>("/people", { params: { id: repId } });
		return res.data.results[0] ?? null;
	} catch {
		return null;
	}
}

export default useReps;
