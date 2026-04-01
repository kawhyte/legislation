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
				params: { lat: coords.lat, lng: coords.lng, include: ["party"] },
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

export default useReps;
