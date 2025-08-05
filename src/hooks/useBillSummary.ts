import { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiServices';

interface UseBillSummaryOptions {
  enabled?: boolean;
  maxLength?: number;
  targetAge?: string;
}

interface UseBillSummaryReturn {
  summary: string | null;
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}

export const useBillSummary = (
  billTitle: string,
  options: UseBillSummaryOptions = {}
): UseBillSummaryReturn => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { enabled = true, maxLength = 150, targetAge = "18-40" } = options;
  const geminiService = useRef(new GeminiService());
  const abortController = useRef<AbortController | null>(null);

  const generateSummary = async () => {
    if (!billTitle || !enabled) return;

    // Cancel any existing request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const summaryResult = await geminiService.current.summarizeBillTitle(
        billTitle,
        { maxLength, targetAge, useCache: true }
      );
      
      if (!abortController.current.signal.aborted) {
        setSummary(summaryResult);
      }
    } catch (err) {
      if (!abortController.current.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
        setError(errorMessage);
        console.error('Summary generation error:', err);
      }
    } finally {
      if (!abortController.current.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  const retry = () => {
    setError(null);
    setSummary(null);
    generateSummary();
  };

  useEffect(() => {
    generateSummary();

    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [billTitle, enabled, maxLength, targetAge]);

  return {
    summary,
    isLoading,
    error,
    retry
  };
};