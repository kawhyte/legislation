import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Enhanced cache with expiration
interface CacheEntry {
  data: { summary: string; impacts: string[] };
  timestamp: number;
  expiresIn: number;
}

const summaryCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<{ summary: string; impacts: string[] }>>();

interface SummaryOptions {
  maxLength?: number;
  targetAge?: string;
  useCache?: boolean;
}

interface SummaryResult {
  summary: string;
  impacts: string[];
}

export class GeminiService {
  private model;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REQUEST_DELAY = 4000; // 4 seconds between requests
  private lastRequestTime = 0;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300, // Increased for summary + impacts
      }
    });
  }

  /**
   * Generate a cache key for the bill title
   */
  private getCacheKey(title: string): string {
    return `summary_${title.toLowerCase().replace(/\s+/g, '_').slice(0, 50)}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.expiresIn;
  }

  /**
   * Rate limiting - ensure minimum delay between requests
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < GeminiService.REQUEST_DELAY) {
      const waitTime = GeminiService.REQUEST_DELAY - timeSinceLastRequest;
      console.log(`[GeminiService] Rate limiting: waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Parse the AI response to extract summary and impacts
   */
  private parseResponse(text: string): SummaryResult {
    try {
      console.log('[GeminiService] Parsing response text:', text);
      
      // Look for the summary (everything before "Impact if passed" or similar)
      const impactMarkers = ['Impact if passed', 'Impacts if passed', 'If passed:', 'Impact:'];
      let summaryText = text.trim();
      let impactsText = '';

      // Find the impact section
      for (const marker of impactMarkers) {
        const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase());
        if (markerIndex !== -1) {
          summaryText = text.substring(0, markerIndex).trim();
          impactsText = text.substring(markerIndex + marker.length).trim();
          console.log('[GeminiService] Found impact marker:', marker);
          console.log('[GeminiService] Summary text:', summaryText);
          console.log('[GeminiService] Impacts text:', impactsText);
          break;
        }
      }

      // Extract bullet points from impacts text
      const impacts = impactsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('*') || line.startsWith('-') || line.startsWith('•'))
        .map(line => line.replace(/^[*\-•]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3); // Limit to 3 impacts

      console.log('[GeminiService] Extracted impacts:', impacts);

      const result = {
        summary: summaryText || "This bill addresses legislative matters that may affect various aspects of governance.",
        impacts: impacts.length > 0 ? impacts : ["Legislative changes may affect current policies", "Implementation may require administrative adjustments", "Public services may be impacted"]
      };

      console.log('[GeminiService] Final parsed result:', result);
      return result;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        summary: "This bill introduces new legislation that may impact various areas of public policy.",
        impacts: ["Policy changes may occur", "Administrative adjustments may be needed", "Public services may be affected"]
      };
    }
  }

  /**
   * Summarize bill title with impacts using Gemini API
   */
  async summarizeBillWithImpacts(
    title: string, 
    options: SummaryOptions = {}
  ): Promise<SummaryResult> {
    const {
      maxLength = 150,
      targetAge = "18-40",
      useCache = true
    } = options;

    const cacheKey = this.getCacheKey(title);

    // Check cache first
    if (useCache) {
      const cachedEntry = summaryCache.get(cacheKey);
      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        console.log('[GeminiService] Using cached result for:', title);
        return cachedEntry.data;
      }
    }

    // Check if there's already a pending request for this title
    if (pendingRequests.has(cacheKey)) {
      console.log('[GeminiService] Request already pending for:', title);
      return await pendingRequests.get(cacheKey)!;
    }

    // Create new request
    const requestPromise = this.makeRequest(title, maxLength, targetAge);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // Cache the result
      if (useCache && result) {
        summaryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expiresIn: GeminiService.CACHE_DURATION
        });
      }

      return result;
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Make the actual API request
   */
  private async makeRequest(title: string, maxLength: number, targetAge: string): Promise<SummaryResult> {
    await this.enforceRateLimit();

    try {
      const prompt = `
        You are an expert at explaining complex legislation in simple terms.
        
        Take this bill title and provide:
        1. A clear summary (maximum ${maxLength} characters)
        2. Exactly 3 bullet points about what would happen if this bill becomes law
        
        Guidelines:
        - Write for people aged ${targetAge}
        - Use simple, everyday language
        - Focus on real-world practical impacts
        - Be specific about consequences
        - Start summary with "This bill..." or "This law..."
        
        Format your response exactly like this:
        [Your summary here]
        
        Impact if passed:
        * [First impact]
        * [Second impact]  
        * [Third impact]
        
        Bill title: "${title}"
      `;

      console.log('[GeminiService] Making API request for:', title);
      console.log('[GeminiService] Prompt:', prompt);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      console.log('[GeminiService] Raw API response text:', text);
      console.log('[GeminiService] Full API response object:', response);

      return this.parseResponse(text);
    } catch (error) {
      console.error('[GeminiService] API request failed:', error);
      
      // Return fallback result
      return {
        summary: "This bill introduces new legislation that may impact various areas of public policy and governance.",
        impacts: [
          "Changes to current regulations may occur",
          "Administrative processes may be updated", 
          "Public services may be affected"
        ]
      };
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of summaryCache.entries()) {
      if (!this.isCacheValid(entry)) {
        summaryCache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    summaryCache.clear();
    pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; pendingRequests: number; keys: string[] } {
    return {
      size: summaryCache.size,
      pendingRequests: pendingRequests.size,
      keys: Array.from(summaryCache.keys())
    };
  }
}