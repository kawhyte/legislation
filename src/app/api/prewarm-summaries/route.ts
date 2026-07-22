/**
 * Cron endpoint: pre-generates AI summaries for bills in the national trending
 * feed so the homepage can lead with AI content at zero live token cost.
 *
 * This deliberately does NOT reuse `/api/summarize`. That route calls
 * `isSameOrigin` (a GitHub Action has no matching Origin → 403) and rate-limits
 * 10 requests/minute per IP (one runner IP × 40 bills → 429). The bearer secret
 * below is this route's access control instead.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { Bill } from '@/types';
import { getAdminDb } from '@/lib/firebase-admin';
import { summaryDocId, SUMMARY_PROMPT_VERSION } from '@/lib/summaryCacheKey';
import {
  clampBillInput,
  generateForBill,
  isFallback,
  SUMMARY_MODEL,
} from '@/lib/summaryGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * These constants are squeezed between two hard limits, both measured in
 * production rather than assumed:
 *
 *  - The Gemini free tier caps gemini-3.6-flash at **5 requests per minute**
 *    (quotaId GenerateRequestsPerMinutePerProjectPerModel-FreeTier), so the
 *    spacing cannot drop below 12s. A run at 4s spacing 429ed a bill every time.
 *  - Vercel Hobby kills the function at **60s** and does not honour a higher
 *    maxDuration. A production run at BATCH_SIZE=4 (3 gaps × 13s = 39s, plus
 *    the Gemini round trips and the Firestore skip-scan) returned 504, even
 *    though the same batch finished locally in 47s — Gemini is slower from
 *    Vercel's region than from a laptop.
 *
 * BATCH_SIZE=3 is 2 gaps = 26s + ~3 Gemini calls ≈ 35s, leaving real headroom
 * for the cold start, the /api/trending fetch and the per-bill Firestore reads.
 * If you need more throughput, raise the cron frequency — never these numbers.
 */
const BATCH_SIZE = 3;
const DELAY_MS = 13000;

/**
 * Stop starting new work past this point so the handler always returns a report
 * instead of being killed mid-generation at 60s. A 504 tells you nothing about
 * where the time went; a partial report does, and the next hourly run picks up
 * exactly where this one stopped.
 */
const TIME_BUDGET_MS = 45_000;
/**
 * A generation costs its own spacing delay plus a Gemini round trip. The 5s
 * allowance is measured: gemini-3.6-flash answers this prompt in ~5.1s. It was
 * 8s, which was pessimistic enough that a run stopped after 2 generations at
 * 26s with 19s of budget left, making BATCH_SIZE=3 unreachable dead config.
 */
const PER_BILL_COST_MS = DELAY_MS + 5_000;

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const since = () => Date.now() - startedAt;

  const secret = process.env.CRON_SECRET;
  // No secret configured = the endpoint does not exist. Never run open, and 404
  // rather than 401 so a prober cannot confirm the route is here.
  if (!secret) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The request's own origin, not a hardcoded URL, so preview deployments
  // prewarm their own cache. `no-store` so we see the current feed.
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/trending`, { cache: 'no-store' });
  if (!res.ok) {
    return NextResponse.json({ error: 'trending unavailable' }, { status: 502 });
  }
  const { bills } = (await res.json()) as { bills: Bill[] };
  const trendingMs = since();

  const db = getAdminDb();
  const report = {
    considered: bills.length,
    skipped: 0,
    generated: 0,
    failed: 0,
    stoppedEarly: false,
    trendingMs,
    scanMs: 0,
    elapsedMs: 0,
  };

  for (const raw of bills) {
    // Bound by ATTEMPTS, not successes. Counting only successes meant that when
    // Gemini was failing for every bill (as it was in production, with a stale
    // GEMINI_API_KEY), nothing ever incremented `generated`, so the loop walked
    // all 40 bills paying DELAY_MS each and the function was killed at 60s.
    if (report.generated + report.failed >= BATCH_SIZE) break;
    // Never begin a generation that cannot finish inside the function's life.
    if (since() + PER_BILL_COST_MS > TIME_BUDGET_MS) {
      report.stoppedEarly = true;
      break;
    }

    const docRef = db.collection('bill_summaries').doc(summaryDocId(raw.id));
    const snap = await docRef.get();
    const meta = snap.exists
      ? (snap.data()?._meta as { promptVersion?: number } | undefined)
      : undefined;
    if (snap.exists && (meta?.promptVersion ?? 0) >= SUMMARY_PROMPT_VERSION) {
      report.skipped++;
      // Time spent scanning past already-cached bills, isolated from generation
      // time so a slow skip-scan is visible in the report rather than inferred.
      report.scanMs = since() - trendingMs;
      continue;
    }

    const bill = clampBillInput(raw);
    const data = await generateForBill(bill, { delayMs: DELAY_MS });

    if (isFallback(data)) {
      // Never persist a fallback — every later read is a cache hit, so writing
      // one would permanently poison this bill.
      report.failed++;
      continue;
    }

    await docRef.set({
      ...data,
      _meta: {
        generatedAt: new Date().toISOString(),
        model: SUMMARY_MODEL,
        promptVersion: SUMMARY_PROMPT_VERSION,
      },
    });
    report.generated++;
  }

  report.elapsedMs = since();
  console.log('[/api/prewarm-summaries]', JSON.stringify(report));
  return NextResponse.json(report);
}
