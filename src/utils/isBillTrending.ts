import type { Bill } from "@/types";
import { getPastDate } from "@/lib/utils";
import { legislatureSizes } from "../data/legislatureSizes";

export const isBillTrending = (bill: Bill): boolean => {
	// Sort actions by date descending to easily find the latest
	const sortedActions = bill.actions
		? [...bill.actions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		: [];
	const actionDates = sortedActions.map(a => new Date(a.date));

	// Criterion 1: Speed of actions
    if (actionDates.length >= 2) {
        const twentyDaysAgo = getPastDate(14, 'days');
        const recentActions = actionDates.filter(d => d > new Date(twentyDaysAgo));
        if (recentActions.length >= 2) {
            return true;
        }
    }

	// Criterion 2: High sponsorship and recent action
	const lastActionDate = actionDates.length > 0 ? actionDates[0] : null;
	if (lastActionDate) {
		const twentyDaysAgo = new Date(getPastDate(5, 'days'));
		if (lastActionDate > twentyDaysAgo) {
			const sponsorCount = bill.sponsorships?.length || 0;
			const jurisdictionName = bill.jurisdiction?.name;
			// FIX: Get chamber from the latest action's organization
			const latestAction = sortedActions[0];
			const chamber = latestAction?.organization?.classification;

			if (jurisdictionName && chamber && legislatureSizes[jurisdictionName]) {
				const chamberInfo = legislatureSizes[jurisdictionName];
                if ('unicameral' in chamberInfo) {
                    if (sponsorCount > 0.6 * chamberInfo.unicameral) return true;
                } else if (chamber === 'upper' || chamber === 'lower') { // Ensure chamber is valid
                    const chamberSize = chamberInfo[chamber];
				    if (chamberSize && sponsorCount > 0.6 * chamberSize) {
				    	return true;
				    }
                }
			}
		}
	}

	// Criterion 3: Close vote
	if (bill.votes) {
		const tenDaysAgo = new Date(getPastDate(5, 'days'));
		for (const vote of bill.votes) {
			const voteDate = new Date(vote.date);
			if (voteDate > tenDaysAgo) {
				const yesCount = vote.counts.find(c => c.option === 'yes')?.value || 0;
				const noCount = vote.counts.find(c => c.option === 'no')?.value || 0;
				if ((yesCount > 0 || noCount > 0) && Math.abs(yesCount - noCount) <= 3) {
					return true;
				}
			}
		}
	}

	return false;
};