import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { checkRateLimit, getClientIp, isSameOrigin } from '@/lib/rateLimit';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Product-analytics sink. Events arrive from `src/lib/analytics.ts` (usually via
 * `navigator.sendBeacon`) and are written to the `analytics_events` collection
 * with the Admin SDK.
 *
 * Why a route instead of a client-side Firestore write: a client write path
 * would require security rules that let anyone create documents in the
 * collection, which is an open spam target. Here the browser never touches
 * Firestore, and this route is the only writer — so it can enforce the closed
 * event vocabulary, drop unknown props, and rate-limit by IP.
 *
 * This deliberately replaces the third-party analytics vendor the original plan
 * called for: no account, no plan tier, no possibility of a bill.
 */
export const dynamic = 'force-dynamic';

/** Must stay in sync with `AnalyticsEvent` in `src/lib/analytics.ts`. */
const ALLOWED_EVENTS = new Set([
  'feed_view',
  'bill_card_click',
  'location_set',
  'summary_view',
  'topic_chip_tap',
]);

// Generous enough for real use, low enough that a scripted flood cannot run up
// Firestore write volume. See the per-process caveat in `src/lib/rateLimit.ts`.
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

const MAX_PROPS = 10;
const MAX_STRING_LEN = 120;

/**
 * Props are attacker-controllable, so they are copied field by field rather than
 * stored wholesale: only primitives survive, strings are truncated, and the
 * object is capped. Nothing identifying is accepted or derived — no uid, no
 * display name, no email, and the IP is used only for rate limiting, never stored.
 */
function sanitizeProps(input: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PROPS) break;
    if (typeof value === 'string') out[key] = value.slice(0, MAX_STRING_LEN);
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'boolean') out[key] = value;
    // anything else (objects, arrays, null, undefined) is dropped
  }
  return out;
}

export async function POST(request: Request) {
  // Browser-only endpoint: reject curl/scripted callers the same way the other
  // write-adjacent routes do.
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { allowed } = checkRateLimit(`track:${getClientIp(request)}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let payload: { event?: unknown; props?: unknown; path?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (typeof payload.event !== 'string' || !ALLOWED_EVENTS.has(payload.event)) {
    return NextResponse.json({ error: 'Unknown event' }, { status: 400 });
  }

  try {
    await getAdminDb().collection('analytics_events').add({
      event: payload.event,
      props: sanitizeProps(payload.props),
      path: typeof payload.path === 'string' ? payload.path.slice(0, MAX_STRING_LEN) : null,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // A missing Admin credential or a Firestore hiccup must never surface to the
    // user — analytics is strictly best-effort.
    console.error('[api/track] write failed:', err);
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
