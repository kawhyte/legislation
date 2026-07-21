import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BillSummaryData, CachedBillSummary } from '@/types';
import { summaryDocId, SUMMARY_PROMPT_VERSION } from '@/lib/summaryCacheKey';

function isValidSummary(data: unknown): data is BillSummaryData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.gist === 'string' &&
    typeof d.whoItAffects === 'string' &&
    typeof d.walletImpact === 'string' &&
    !!d.controversy &&
    typeof d.controversy === 'object' &&
    Array.isArray((d.controversy as Record<string, unknown>).for) &&
    Array.isArray((d.controversy as Record<string, unknown>).against)
  );
}

export async function getCachedSummary(billId: string): Promise<BillSummaryData | null> {
  try {
    const snap = await getDoc(doc(db, 'bill_summaries', summaryDocId(billId)));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (!isValidSummary(data)) return null;
    // Summaries written by an older prompt are a miss: returning null falls
    // through to /api/summarize, which regenerates the doc exactly once.
    const meta = (data as CachedBillSummary)._meta;
    if ((meta?.promptVersion ?? 0) < SUMMARY_PROMPT_VERSION) return null;
    return data;
  } catch {
    return null;
  }
}
