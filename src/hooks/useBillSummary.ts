'use client';

import { useState, useRef, useCallback } from 'react';
import { getCachedSummary, cacheSummary } from '../services/cacheService';
import type { Bill, BillSummaryData, UseBillSummaryOptions, UseBillSummaryReturn } from '@/types';

export const useBillSummary = (
  bill: Bill,
  options: UseBillSummaryOptions = {}
): UseBillSummaryReturn => {
  const [structured, setStructured] = useState<BillSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { maxLength = 150, targetAge = "30-40" } = options;
  // maxLength/targetAge are accepted for API compat but currently handled server-side
  void maxLength; void targetAge;

  const abortController = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    abortController.current?.abort();
  }, []);

  const generateSummary = useCallback(async () => {
    if (isLoading) return;

    cleanup();
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // L2: Firestore global cache — persists 24 h across all users
      const cached = await getCachedSummary(bill.id);
      if (cached) {
        if (!abortController.current.signal.aborted) setStructured(cached);
        return;
      }

      // L1: server-side API route (has its own in-memory session cache + rate limiter)
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.current.signal,
        body: JSON.stringify({ bill }),
      });

      if (!res.ok) throw new Error(`Summarize request failed: ${res.status}`);

      const result = await res.json() as BillSummaryData;

      if (!abortController.current.signal.aborted) {
        await cacheSummary(bill.id, result);
        setStructured(result);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('[useBillSummary] Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill, cleanup]);

  return { structured, isLoading, error, generateSummary, cleanup };
};
