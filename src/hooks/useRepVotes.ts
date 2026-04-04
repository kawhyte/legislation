'use client';

import { useEffect, useState } from "react";
import apiClient from "../services/api-client";
import { CanceledError } from "axios";

export interface RepVote {
	id: string;
	motion_text: string;
	vote_result: string;    // "pass" | "fail" — outcome of this specific vote
	start_date: string;
	option: string;         // this rep's choice: "yes" | "no" | "excused" | …
	bill_id: string;
	bill_identifier: string; // "HB 1325"
	bill_title: string;
	bill_status: string;    // most recent action description
	primary_sponsor?: { name: string; party?: string };
}

export interface VoteStats {
	totalVotes: number;
	yesVotes: number;
	noVotes: number;
	missedVotes: number;
	partyLineVotes: number; // sponsor shares rep's party
}

// ── Raw OpenStates shapes ─────────────────────────────────────────────────────

interface PersonVoteEntry {
	option: string;
	voter_name: string;
	voter?: { id: string; name: string };
}

interface VoteEvent {
	id: string;
	motion_text: string;
	result: string;
	start_date: string;
	votes?: PersonVoteEntry[];
}

interface Sponsor {
	name: string;
	primary: boolean;
	classification: string;
	person?: { id: string; name: string; party?: string };
}

interface Action {
	date: string;
	description: string;
	classification: string[];
}

interface Bill {
	id: string;
	identifier: string;
	title?: string;
	votes?: VoteEvent[];
	sponsorships?: Sponsor[];
	actions?: Action[];
}

interface BillsResponse {
	results: Bill[];
}

const useRepVotes = (repId: string | undefined, stateName: string | undefined) => {
	const [votes, setVotes] = useState<RepVote[]>([]);
	const [stats, setStats] = useState<VoteStats | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!repId || !stateName) {
			setVotes([]);
			setStats(null);
			setIsLoading(false);
			return;
		}

		const controller = new AbortController();
		setIsLoading(true);
		setError("");

		apiClient
			.get<BillsResponse>("/bills", {
				signal: controller.signal,
				params: {
					jurisdiction: stateName,
					include: ["votes", "sponsorships", "actions"],
					per_page: 20,
					classification: "bill",
					sort: "updated_desc",
				},
			})
			.then((res) => {
				if (controller.signal.aborted) return;

				const repVotes: RepVote[] = [];

				for (const bill of res.data.results) {
					// Primary sponsor (first entry with primary=true or classification=primary)
					const sponsor = bill.sponsorships?.find(s => s.primary || s.classification === "primary");
					const primarySponsor = sponsor
						? { name: sponsor.person?.name ?? sponsor.name, party: sponsor.person?.party }
						: undefined;

					// Latest action (last in array — OpenStates returns chronological order)
					const latestAction = bill.actions?.at(-1);
					const billStatus = latestAction?.description ?? "Status unknown";

					for (const event of (bill.votes ?? [])) {
						const entry = event.votes?.find(v => v.voter?.id === repId);
						if (!entry) continue;

						repVotes.push({
							id: event.id,
							motion_text: event.motion_text,
							vote_result: event.result,
							start_date: event.start_date,
							option: entry.option.toLowerCase(),
							bill_id: bill.id,
							bill_identifier: bill.identifier ?? "",
							bill_title: bill.title ?? "Untitled Bill",
							bill_status: billStatus,
							primary_sponsor: primarySponsor,
						});
					}
				}

				let yes = 0, no = 0, missed = 0, partyLine = 0;
				// We'll calculate partyLine in the page where we know the rep's party
				for (const v of repVotes) {
					if (v.option === "yes") yes++;
					else if (v.option === "no") no++;
					else if (["excused", "not voting", "absent"].includes(v.option)) missed++;
				}

				setVotes(repVotes);
				setStats({ totalVotes: repVotes.length, yesVotes: yes, noVotes: no, missedVotes: missed, partyLineVotes: partyLine });
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
	}, [repId, stateName]);

	return { votes, stats, isLoading, error };
};

export default useRepVotes;
