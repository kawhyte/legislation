import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";

interface VoteEntry {
	voter_id: string;
	voter_name: string;
	option: string;
}

export interface VoteEvent {
	id: string;
	motion_text: string;
	result: string;
	start_date: string;
	bill?: { identifier: string; title: string };
	votes: VoteEntry[];
}

export interface VoteStats {
	totalVotes: number;
	yesVotes: number;
	noVotes: number;
	missedVotes: number;
}

interface VotesResponse {
	results: VoteEvent[];
}

const useRepVotes = (repId: string | undefined) => {
	const [votes, setVotes] = useState<VoteEvent[]>([]);
	const [stats, setStats] = useState<VoteStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!repId) {
			setVotes([]);
			setStats(null);
			setIsLoading(false);
			return;
		}

		const controller = new AbortController();
		setIsLoading(true);
		setError("");

		apiClient
			.get<VotesResponse>("/votes", {
				signal: controller.signal,
				params: { voter_id: repId, per_page: 50, sort: "updated_desc" },
			})
			.then((res) => {
				if (controller.signal.aborted) return;
				const results = res.data.results;

				let yes = 0, no = 0, missed = 0;
				for (const event of results) {
					const entry = event.votes?.find(v => v.voter_id === repId);
					if (!entry) continue;
					const opt = entry.option.toLowerCase();
					if (opt === "yes") yes++;
					else if (opt === "no") no++;
					else if (opt === "excused" || opt === "not voting" || opt === "absent") missed++;
				}

				setVotes(results);
				setStats({ totalVotes: results.length, yesVotes: yes, noVotes: no, missedVotes: missed });
				setIsLoading(false);
			})
			.catch((err) => {
				if (err instanceof CanceledError) return;
				if (!controller.signal.aborted) {
					setError(err.message);
					setIsLoading(false);
				}
			});

		return () => controller.abort();
	}, [repId]);

	return { votes, stats, isLoading, error };
};

export default useRepVotes;
