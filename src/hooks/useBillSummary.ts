import { useState, useRef } from 'react';
import { GeminiService } from '../services/geminiServices';

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
}

export const useBillSummary = (
  billTitle: string,
  options: UseBillSummaryOptions = {}
): UseBillSummaryReturn => {
  const [summary, setSummary] = useState<string | null>(null);
  const [impacts, setImpacts] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { maxLength = 150, targetAge = "18-40" } = options;
  const geminiService = useRef(new GeminiService());
  const abortController = useRef<AbortController | null>(null);

  const generateSummary = async () => {
    if (!billTitle) {
      console.log('[useBillSummary] No bill title provided');
      return;
    }

    // Prevent multiple simultaneous requests for the same bill
    if (isLoading) {
      console.log('[useBillSummary] Request already in progress, skipping');
      return;
    }

    console.log('[useBillSummary] Starting summary generation for:', billTitle);

    // Cancel any existing request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      console.log('[useBillSummary] Calling geminiService.summarizeBillWithImpacts');
      const result = await geminiService.current.summarizeBillWithImpacts(
        billTitle,
        { maxLength, targetAge, useCache: true }
      );
      
      console.log('[useBillSummary] Received result:', result);
      
      //if (!abortController.current.signal.aborted) {
        console.log('[useBillSummary] Setting summary and impacts:', result.summary, result.impacts);
        setSummary(result.summary);
        setImpacts(result.impacts);
        setIsLoading(false);
      //}
    } catch (err) {
      console.error('[useBillSummary] Error in generateSummary:', err);
      if (!abortController.current.signal.aborted) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate summary';
        setError(errorMessage);
        console.error('Summary generation error:', err);
      }
    } finally {
      if (!abortController.current.signal.aborted) {
        console.log('[useBillSummary] Setting loading to false');
        setIsLoading(false);
      }
    }
  };

  // Cleanup function to cancel requests
  const cleanup = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
  };

  return {
    summary,
    impacts,
    isLoading,
    error,
    generateSummary,
    cleanup: () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    }
  };
};