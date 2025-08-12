import { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiService } from '../services/geminiServices';
import type { Bill } from './useBills'; // Import the Bill type

interface UseBillSummaryOptions {
  maxLength?: number;
  targetAge?: string;
}

interface UseBillSummaryReturn {
  summary: string | null;
  impacts: string[] | null;
  isLoading: boolean;
  error: string | null;
  generateSummary: () => void;
  cleanup: () => void;
}

export const useBillSummary = (
  bill: Bill,
  options: UseBillSummaryOptions = {}
): UseBillSummaryReturn => {
  const [summary, setSummary] = useState<string | null>(null);
  const [impacts, setImpacts] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { maxLength = 150, targetAge = "18-40" } = options;
  const geminiService = useRef(new GeminiService());
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
      const result = await geminiService.current.summarizeBillWithImpacts(
        bill,
        { maxLength, targetAge, useCache: true }
      );
      
      if (!abortController.current.signal.aborted) {
        setSummary(result.summary);
        setImpacts(result.impacts);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('[useBillSummary] Error in generateSummary:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate summary');
      }
    } finally {
      setIsLoading(false);
    }
  }, [bill, maxLength, targetAge, cleanup]);

  return {
    summary,
    impacts,
    isLoading,
    error,
    generateSummary,
    cleanup
  };
};