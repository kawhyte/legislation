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
 * Sized by the Gemini free tier, which caps gemini-2.5-flash at **5 requests
 * per minute** (quotaId GenerateRequestsPerMinutePerProjectPerModel-FreeTier).
 * A measured run at 8 × 4s spacing (15/min) 429ed one bill every time.
 *
 * 13s spacing → the first request fires immediately, then 3 more at 13s apart:
 * 4 requests in ~39s + Gemini latency ≈ 45-50s. Under 5/min, and inside the
 * 60s Vercel function cap. Raising either constant breaks one of those two.
 */
const BATCH_SIZE = 4;
const DELAY_MS = 13000;

export async function POST(request: NextRequest) {
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

  const db = getAdminDb();
  const report = { considered: bills.length, skipped: 0, generated: 0, failed: 0 };

  for (const raw of bills) {
    if (report.generated >= BATCH_SIZE) break;

    const docRef = db.collection('bill_summaries').doc(summaryDocId(raw.id));
    const snap = await docRef.get();
    const meta = snap.exists
      ? (snap.data()?._meta as { promptVersion?: number } | undefined)
      : undefined;
    if (snap.exists && (meta?.promptVersion ?? 0) >= SUMMARY_PROMPT_VERSION) {
      report.skipped++;
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

  return NextResponse.json(report);
}
