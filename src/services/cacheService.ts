import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { BillSummaryData } from '@/types';

export async function getCachedSummary(billId: string): Promise<BillSummaryData | null> {
  try {
    const snap = await getDoc(doc(db, 'bill_summaries', billId));
    return snap.exists() ? (snap.data() as BillSummaryData) : null;
  } catch {
    return null;
  }
}

export async function cacheSummary(billId: string, summary: BillSummaryData): Promise<void> {
  try {
    await setDoc(doc(db, 'bill_summaries', billId), summary);
  } catch {
    // silent — cache write failure must never break the UI
  }
}
