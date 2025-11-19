import { useState, useRef, useCallback } from 'react';
import { geminiServiceInstance } from '../services/geminiServices';
import type { Bill, UseBillSummaryOptions, UseBillSummaryReturn } from '@/types';
import { logger } from '@/lib/logger';

export const useBillSummary = (
  bill: Bill,
  options: UseBillSummaryOptions = {}
): UseBillSummaryReturn => {
  const [summary, setSummary] = useState<string | null>(null);
  const [impacts, setImpacts] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { maxLength = 150, targetAge = "30-40" } = options;
  const abortController = useRef<AbortController | null>(null);

  const cleanup = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  const generateSummary = useCallback(async () => {
    if (isLoading) return;

    cleanup(); // Abort any previous request
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const result = await geminiServiceInstance.summarizeBillWithImpacts(
        bill,
        { maxLength, targetAge, useCache: true }
      );

      if (!abortController.current.signal.aborted) {
        setSummary(result.summary);
        setImpacts(result.impacts);
      }
    } catch (err) {
      if (err instanceof Error) {
        if (err.name !== 'AbortError') {
          logger.error('[useBillSummary] Error in generateSummary:', err);
          setError(err.message);
        }
      } else {
        logger.error('[useBillSummary] Unexpected error in generateSummary:', err);
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [bill, maxLength, targetAge, cleanup, isLoading]);

  return {
    summary,
    impacts,
    isLoading,
    error,
    generateSummary,
    cleanup
  };
};