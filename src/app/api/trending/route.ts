import { NextResponse } from 'next/server';
import type { Bill } from '@/types';
import { analyzeBillMomentum } from '@/utils/billMomentum';
import { isBillTrending } from '@/utils/isBillTrending';
import { computeTrendingScore } from '@/utils/trendingScore';
import { TRENDING_QUERY_TOPICS, JUNK_TITLE } from '@/constants/trendingTopics';
import { getPastDate } from '@/lib/utils';

/**
 * Server-computed national trending feed.
 *
 * Why this exists: OpenStates' nationwide full-text search is slow and
 * inconsistent (broad terms 504 at 60s). Doing the 8 topic queries + ranking
 * once on the server and caching the result means users get an instant,
 * pre-ranked feed instead of each browser hammering OpenStates on every visit.
 *
 * Caching: `revalidate = 600` caches this route's JSON for 10 minutes (ISR),
 * and each upstream fetch is independently cached in Next's Data Cache for the
 * same window. A cron pinging this route (see vercel.json) keeps it warm so the
 * cold-fill cost is never paid by a real user.
 *
 * This response is intentionally user-agnostic (no engagement, no auth) so it is
 * fully shareable/cacheable. The client applies the per-user engagement nudge
 * and does the final sort (see useTrendingBills.ts).
 */
export const revalidate = 600;
// Allow the cold-fill pass room to finish on platforms that cap function
// duration (e.g. Vercel). Ignored where not applicable.
export const maxDuration = 60;

const PER_TOPIC_TIMEOUT_MS = 25_000;
const CANDIDATE_CAP = 40; // headroom for the client's engagement re-rank

async function fetchTopic(topic: string, updatedSince: string): Promise<Bill[]> {
  const params = new URLSearchParams({
    q: topic,
    per_page: '10',
    updated_since: updatedSince,
    sort: 'updated_desc',
    classification: 'bill',
  });
  // include is repeatable — actions powers the score, sources feeds the card
  params.append('include', 'actions');
  params.append('include', 'sources');

  try {
    const res = await fetch(`https://v3.openstates.org/bills?${params.toString()}`, {
      headers: { 'X-API-KEY': process.env.OPENSTATES_API_KEY ?? '' },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(PER_TOPIC_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { results?: Bill[] };
    return json.results ?? [];
  } catch {
    // Slow/504/timeout on one topic must never break the whole feed
    return [];
  }
}

export async function GET() {
  const updatedSince = getPastDate(30, 'days');

  const lists = await Promise.all(
    TRENDING_QUERY_TOPICS.map((topic) => fetchTopic(topic, updatedSince))
  );

  // Merge + dedupe across topics
  const byId = new Map<string, Bill>();
  for (const list of lists) {
    for (const bill of list) {
      if (!byId.has(bill.id)) byId.set(bill.id, bill);
    }
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const bills = [...byId.values()]
    .map((bill) => {
      const safe = {
        ...bill,
        sources: bill.sources || [],
        subject: bill.subject || [],
        actions: bill.actions || [],
        votes: bill.votes || [],
        sponsorships: bill.sponsorships || [],
      };
      const momentum = analyzeBillMomentum(safe);
      const trendingReason = isBillTrending(safe) ? 'Trending' : '';
      return { ...safe, momentum, trendingReason };
    })
    .filter((bill) => {
      if (JUNK_TITLE.test(bill.title)) return false;
      if (bill.momentum.level === 'Stalled' || bill.momentum.level === 'Enacted') {
        const actionDate = bill.latest_action_date ? new Date(bill.latest_action_date) : null;
        if (!actionDate || actionDate < sevenDaysAgo) return false;
      }
      return true;
    })
    // Base ranking without engagement (client re-ranks with engagement on top)
    .sort((a, b) => computeTrendingScore(b) - computeTrendingScore(a))
    .slice(0, CANDIDATE_CAP);

  return NextResponse.json({ bills });
}
