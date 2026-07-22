'use client';

import { useEffect, useState } from 'react';
import { getCachedSummary } from '@/services/cacheService';
import type { Bill, BillSummaryData } from '@/types';

/**
 * Reads already-cached AI summaries for a list of bills. Read-only: this never
 * triggers generation, so a feed of 40 cards costs zero Gemini tokens. Bills with
 * no cached summary are simply absent from the returned map and their cards fall
 * back to the title.
 */
export function useCachedSummaries(bills: Bill[]): Map<string, BillSummaryData> {
  const [map, setMap] = useState<Map<string, BillSummaryData>>(new Map());
  // Keyed on the joined id string, not the array — callers build a fresh array
  // every render, which would otherwise refire the effect forever. Same
  // technique as the coords memo in useReps.ts.
  const ids = bills.map(b => b.id).join(',');

  useEffect(() => {
    let cancelled = false;
    if (!ids) return;
    const idList = ids.split(',');
    Promise.all(idList.map(id => getCachedSummary(id).then(s => [id, s] as const)))
      .then(entries => {
        if (cancelled) return;
        const next = new Map<string, BillSummaryData>();
        for (const [id, s] of entries) if (s) next.set(id, s);
        setMap(next);
      })
      .catch(() => { /* summaries are an enhancement — never break the feed */ });
    return () => { cancelled = true; };
  }, [ids]);

  return map;
}

export default useCachedSummaries;
