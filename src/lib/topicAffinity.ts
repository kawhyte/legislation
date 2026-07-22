/**
 * Topic affinity — the rules-based, token-free half of "For You".
 *
 * Tapping a topic chip is the only interest signal, it lives entirely in
 * localStorage, and it is turned into a multiplier on the topic component of
 * computeTrendingScore. No AI, no refetch, nothing sent to the server: the feed
 * response stays user-agnostic and shared by every visitor.
 */

const KEY = 'billhound:topicAffinity';

/** Ceiling on a single topic's multiplier. See tapsToBoosts for why. */
export const MAX_BOOST = 2.5;

/** Per-topic tap ceiling. Anything larger is a hand-edited value, not a user. */
const MAX_TAPS = 50;

export type Taps = Record<string, number>;

/** Stored tap counts, keyed by TOPIC_WEIGHTS id. Never throws. */
export function readTaps(): Taps {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    // localStorage is user-writable and this value multiplies a sort key, so
    // the shape is validated on the way out. A hand-edited `1e999` would
    // otherwise produce Infinity/NaN scores and collapse the sort silently.
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, v]) => typeof v === 'number' && Number.isFinite(v) && v > 0)
        .map(([k, v]) => [k, Math.min(v as number, MAX_TAPS)])
    );
  } catch {
    return {}; // Safari private mode / storage disabled / malformed JSON
  }
}

/** Records one tap on `topicId` and returns the updated counts. */
export function recordTap(topicId: string): Taps {
  const taps = readTaps();
  taps[topicId] = Math.min((taps[topicId] ?? 0) + 1, MAX_TAPS);
  try {
    localStorage.setItem(KEY, JSON.stringify(taps));
  } catch {
    /* best-effort — a failed write just means no personalisation next visit */
  }
  return taps;
}

/** Forgets every topic preference. */
export function clearTaps(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* best-effort */
  }
}

/**
 * Diminishing returns: 1 tap ≈ 1.35×, 5 taps ≈ 1.9×, asymptotic at MAX_BOOST.
 *
 * The curve is deliberate. A linear boost means five taps on "Weed" turn the
 * feed into nothing but cannabis bills — a filter bubble built by accident.
 */
export function tapsToBoosts(taps: Taps): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [id, n] of Object.entries(taps)) {
    out[id] = 1 + (MAX_BOOST - 1) * (1 - Math.exp(-n / 3));
  }
  return out;
}
