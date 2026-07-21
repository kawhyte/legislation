'use client';

/**
 * The complete, closed set of product events. Adding a variant here is a
 * deliberate act — an open-ended event name space becomes unanalysable within
 * weeks. Props are kept non-identifying: no user ids, no free text.
 *
 * Events are POSTed to `/api/track`, which writes them to Firestore with the
 * Admin SDK. There is no third-party analytics vendor and no client-side write
 * path, so the collection cannot be written to except through that route.
 */
export type AnalyticsEvent =
  | 'feed_view'        // { feed: 'trending' | 'state' | 'following', count: number }
  | 'bill_card_click'  // { feed: string, position: number, hasSummary: boolean }
  | 'location_set'     // { method: 'dropdown' | 'zip' | 'chip' | 'profile' }
  | 'summary_view'     // { cached: boolean }
  | 'topic_chip_tap';  // { topic: string }

type Props = Record<string, string | number | boolean | null>;

/**
 * jsdom defines `window`, so the browser check alone would leave the unit suite
 * chattering. The explicit env flag is what actually keeps tests and `next dev`
 * silent — set it to 'true' only in the production environment.
 */
const enabled =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';

const ENDPOINT = '/api/track';

/** Fire-and-forget. Never throws, never blocks a render, silent in tests. */
export function track(event: AnalyticsEvent, props?: Props): void {
  if (!enabled) return;
  try {
    const body = JSON.stringify({ event, props: props ?? {}, path: window.location.pathname });

    // sendBeacon survives the page transition a bill-card click starts; a plain
    // fetch would be cancelled mid-flight and the event lost.
    if (typeof navigator.sendBeacon === 'function') {
      const ok = navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      if (ok) return;
    }

    // `keepalive` gives the fallback the same survive-navigation property.
    void fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never surface an error */
    });
  } catch {
    /* analytics must never break the app */
  }
}
