import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BillSummaryData } from '@/types';

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
    const snap = await getDoc(doc(db, 'bill_summaries', encodeURIComponent(billId)));
    if (!snap.exists()) return null;
    const data = snap.data();
    return isValidSummary(data) ? data : null;
  } catch {
    return null;
  }
}
