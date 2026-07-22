import type { Bill } from '@/types';
import { analyzeBillMomentum } from './billMomentum';
import { TOPIC_WEIGHTS } from '@/constants/trendingTopics';

/**
 * Aggregated engagement for one bill, read from the `billEngagement` Firestore
 * collection (see src/services/userService.ts). All fields optional so the
 * score works fine before any engagement data has accrued.
 */
export interface BillEngagement {
  views: number;
  saves: number;
  /** ms epoch of the last view/save, used for recency decay. */
  lastActivityAt?: number | null;
}

const DAY_MS = 1000 * 60 * 60 * 24;

// --- Tunable weights -------------------------------------------------------
// "Trending" = genuine, current legislative movement, nudged toward the topics
// a 21–39 audience cares about. Live velocity is the dominant term; topic
// salience is a strong secondary; engagement is intentionally capped low until
// real traffic accumulates (see PLAN — client-written counters are abusable).
const VELOCITY_PER_ACTION = 8;      // per action in the last 14 days
const RECENCY_BONUS = { d3: 15, d7: 8, d14: 3 };
const MILESTONE: Record<string, number> = {
  Passed: 18,   // cleared both chambers
  High: 12,     // cleared one chamber (or high in-progress score)
  Enacted: 6,   // recently signed (older enacted bills are filtered out upstream)
  Medium: 5,
  Low: 0,
  Stalled: 0,   // stalled bills are excluded upstream anyway
};
const ENGAGEMENT_UNIT = 2;          // points per (view + 3·save)
const ENGAGEMENT_CAP = 20;          // hard ceiling so hype can't bury real movement
const ENGAGEMENT_HALFLIFE_DAYS = 30;

/**
 * Per-topic multiplier keyed by TOPIC_WEIGHTS id. Absent ids default to 1, so a
 * partial map — or a map holding an id that no longer exists — is harmless.
 */
export type TopicBoosts = Record<string, number>;

/**
 * Topic-relevance component: sum of every TOPIC_WEIGHTS pattern that matches.
 *
 * @param boosts optional per-topic multipliers (see src/lib/topicAffinity.ts).
 *   Omitting them reproduces the un-personalised score exactly, which is what
 *   keeps `/api/trending` user-agnostic and CDN-cacheable.
 */
export function topicRelevance(bill: Bill, boosts?: TopicBoosts): number {
  const haystack = `${bill.title || ''} ${(bill.subject || []).join(' ')}`;
  let score = 0;
  for (const { id, pattern, weight } of TOPIC_WEIGHTS) {
    if (pattern.test(haystack)) score += weight * (boosts?.[id] ?? 1);
  }
  return score;
}

/** Recent-movement component: action velocity + recency of the latest action. */
function activityScore(bill: Bill, now: Date): number {
  const actions = bill.actions || [];
  if (actions.length === 0) return 0;

  const nowMs = now.getTime();
  const fourteenDaysAgo = nowMs - 14 * DAY_MS;

  let recentActions = 0;
  let latestMs = -Infinity;
  for (const a of actions) {
    const t = new Date(a.date).getTime();
    if (Number.isNaN(t)) continue;
    if (t > fourteenDaysAgo) recentActions++;
    if (t > latestMs) latestMs = t;
  }

  let score = recentActions * VELOCITY_PER_ACTION;

  if (latestMs > -Infinity) {
    const ageDays = (nowMs - latestMs) / DAY_MS;
    if (ageDays <= 3) score += RECENCY_BONUS.d3;
    else if (ageDays <= 7) score += RECENCY_BONUS.d7;
    else if (ageDays <= 14) score += RECENCY_BONUS.d14;
  }

  return score;
}

/** Engagement component: capped, recency-decayed views + saves. */
function engagementScore(engagement: BillEngagement | null | undefined, now: Date): number {
  if (!engagement) return 0;
  const raw = (engagement.views || 0) + 3 * (engagement.saves || 0);
  if (raw <= 0) return 0;

  let decay = 1;
  if (engagement.lastActivityAt) {
    const ageDays = (now.getTime() - engagement.lastActivityAt) / DAY_MS;
    decay = Math.pow(0.5, Math.max(0, ageDays) / ENGAGEMENT_HALFLIFE_DAYS);
  }
  return Math.min(ENGAGEMENT_CAP, raw * ENGAGEMENT_UNIT * decay);
}

/**
 * Compute a bill's trending score. Pure and deterministic given `now` — no
 * network, no globals — so it's directly unit-testable.
 *
 * @param now injectable clock for tests; defaults to the real current time.
 * @param boosts optional per-topic multipliers. Only the topic component is
 *   scaled — activity, milestone and engagement are untouched, so a strongly
 *   preferred topic is nudged up without ever burying a high-momentum bill.
 */
export function computeTrendingScore(
  bill: Bill,
  engagement?: BillEngagement | null,
  now: Date = new Date(),
  boosts?: TopicBoosts,
): number {
  const activity = activityScore(bill, now);
  const topic = topicRelevance(bill, boosts);
  const milestone = MILESTONE[analyzeBillMomentum(bill).level] ?? 0;
  const engage = engagementScore(engagement, now);
  return activity + topic + milestone + engage;
}
