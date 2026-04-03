import type { Bill } from "@/types";
import { getPastDate } from "@/lib/utils";
import { legislatureSizes } from "../data/legislatureSizes";

export const isBillTrending = (bill: Bill): boolean => {
	// Sort actions by date descending to easily find the latest
	const sortedActions = bill.actions
		? [...bill.actions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		: [];
	const actionDates = sortedActions.map(a => new Date(a.date));

	// Criterion 1: Speed of actions — 3+ actions in last 14 days (tightened from 2)
	if (actionDates.length >= 3) {
		const fourteenDaysAgo = new Date(getPastDate(14, 'days'));
		const recentActions = actionDates.filter(d => d > fourteenDaysAgo);
		if (recentActions.length >= 3) return true;
	}

	// Criterion 2a: Passed a chamber within the last 30 days
	const thirtyDaysAgo = new Date(getPastDate(30, 'days'));
	if (bill.house_passage_date && new Date(bill.house_passage_date) > thirtyDaysAgo) return true;
	if (bill.senate_passage_date && new Date(bill.senate_passage_date) > thirtyDaysAgo) return true;

	// Criterion 2b: High sponsorship and very recent action
	const lastActionDate = actionDates.length > 0 ? actionDates[0] : null;
	if (lastActionDate) {
		const fiveDaysAgo = new Date(getPastDate(5, 'days'));
		if (lastActionDate > fiveDaysAgo) {
			const sponsorCount = bill.sponsorships?.length || 0;
			const jurisdictionName = bill.jurisdiction?.name;
			const latestAction = sortedActions[0];
			const chamber = latestAction?.organization?.classification;

			if (jurisdictionName && chamber && legislatureSizes[jurisdictionName]) {
				const chamberInfo = legislatureSizes[jurisdictionName];
				if ('unicameral' in chamberInfo) {
					if (sponsorCount > 0.6 * chamberInfo.unicameral) return true;
				} else if (chamber === 'upper' || chamber === 'lower') {
					const chamberSize = chamberInfo[chamber];
					if (chamberSize && sponsorCount > 0.6 * chamberSize) return true;
				}
			}
		}
	}

	// Criterion 3: Close vote — ≤5 vote margin in last 14 days (loosened from ≤3 in 5 days)
	if (bill.votes) {
		const fourteenDaysAgo = new Date(getPastDate(14, 'days'));
		for (const vote of bill.votes) {
			const voteDate = new Date(vote.date);
			if (voteDate > fourteenDaysAgo) {
				const yesCount = vote.counts.find(c => c.option === 'yes')?.value || 0;
				const noCount = vote.counts.find(c => c.option === 'no')?.value || 0;
				if ((yesCount > 0 || noCount > 0) && Math.abs(yesCount - noCount) <= 5) return true;
			}
		}
	}

	return false;
};
