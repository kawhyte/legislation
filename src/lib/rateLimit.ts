/**
 * In-memory fixed-window rate limiter.
 *
 * LIMITATION: this state is per server process. On Vercel, each serverless
 * function instance has its own memory, so a caller distributed across
 * multiple warm instances (or after a cold start) gets a fresh bucket per
 * instance. This raises the effective ceiling above `limit` but does NOT
 * remove it — an attacker still cannot get truly unlimited free requests,
 * and this is a large improvement over having no limit at all. If usage
 * data later shows this isn't enough, replace the Map below with a
 * Firestore- or Redis-backed counter keyed the same way.
 */

interface Bucket {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, Bucket>();

// Periodically evict old buckets so this Map doesn't grow forever in a long-lived process.
const MAX_BUCKETS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * @param key      Unique identifier for the caller, e.g. `summarize:${ip}`.
 * @param limit    Max requests allowed per window.
 * @param windowMs Window size in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart > windowMs) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear(); // crude eviction, fine for this scale
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1 };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count };
}

/**
 * Best-effort client IP extraction for Vercel/Next.js deployments.
 *
 * Prefers `x-real-ip`, which Vercel's edge sets to the single true client IP
 * and which a client cannot override. `x-forwarded-for` is only a fallback:
 * its leftmost value is client-controllable when an upstream proxy appends
 * (rather than replaces) the real IP, so trusting it first would let an
 * attacker rotate the header to get a fresh rate-limit bucket per request.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return 'unknown';
}

/** Returns true if the request's Origin/Referer header matches this deployment's own host. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin') ?? request.headers.get('referer');
  if (!origin) return false; // no-UI callers (curl, scripts) always fail this check — intentional
  try {
    const originHost = new URL(origin).host;
    const requestHost = new URL(request.url).host;
    return originHost === requestHost;
  } catch {
    return false;
  }
}
