'use client';

import { useState, useRef, useCallback } from 'react';
import { GeminiService } from '../services/geminiServices';
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
  const geminiService = useRef(new GeminiService());
  const abortController = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const generateSummary = useCallback(async () => {
    if (isLoading) return;

    cleanup();
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      // L2: check Firestore global cache first
      const cached = await getCachedSummary(bill.id);
      if (cached) {
        if (!abortController.current.signal.aborted) {
          setStructured(cached);
        }
        return;
      }

      // L1: call Gemini (has its own in-memory session cache)
      const result = await geminiService.current.summarizeBillWithImpacts(
        bill,
        { maxLength, targetAge, useCache: true }
      );

      if (!abortController.current.signal.aborted) {
        await cacheSummary(bill.id, result);
        setStructured(result);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== 'AbortError') {
          console.error('[useBillSummary] Error:', err);
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [bill, maxLength, targetAge, cleanup]);

  return {
    structured,
    isLoading,
    error,
    generateSummary,
    cleanup,
  };
};
