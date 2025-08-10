import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Bill } from '@/hooks/useBills'; // Import the Bill type

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
        maxOutputTokens: 300,
      }
    });
  }

  private getCacheKey(title: string): string {
    return `summary_${title.toLowerCase().replace(/\s+/g, '_').slice(0, 50)}`;
  }

  private isCacheValid(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.expiresIn;
  }

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

  private parseResponse(text: string): SummaryResult {
    try {
      const impactMarkers = ['Impact if passed', 'Impacts if passed', 'If passed:', 'Impact:'];
      let summaryText = text.trim();
      let impactsText = '';

      for (const marker of impactMarkers) {
        const markerIndex = text.toLowerCase().indexOf(marker.toLowerCase());
        if (markerIndex !== -1) {
          summaryText = text.substring(0, markerIndex).trim();
          impactsText = text.substring(markerIndex + marker.length).trim();
          break;
        }
      }

      const impacts = impactsText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('*') || line.startsWith('-') || line.startsWith('•'))
        .map(line => line.replace(/^[*-•]\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

      return {
        summary: summaryText || "This bill addresses legislative matters.",
        impacts: impacts.length > 0 ? impacts : ["Legislative changes may affect current policies."]
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return {
        summary: "This bill introduces new legislation.",
        impacts: ["Policy changes may occur."]
      };
    }
  }

  async summarizeBillWithImpacts(
    bill: Bill, // Changed from title: string to bill: Bill
    options: SummaryOptions = {}
  ): Promise<SummaryResult> {
    const { useCache = true } = options;
    const cacheKey = this.getCacheKey(bill.title);

    if (useCache) {
      const cachedEntry = summaryCache.get(cacheKey);
      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        console.log('[GeminiService] Using cached result for:', bill.title);
        return cachedEntry.data;
      }
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = this.makeRequest(bill, options);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (useCache && result) {
        summaryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expiresIn: GeminiService.CACHE_DURATION
        });
      }
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  }

  private async makeRequest(bill: Bill, options: SummaryOptions): Promise<SummaryResult> {
    await this.enforceRateLimit();

    const { maxLength = 150, targetAge = "18-40" } = options;

    // --- Build the new, richer context ---
    let context = `Bill Title: "${bill.title}"`;
    if (bill.abstracts && bill.abstracts.length > 0 && bill.abstracts[0].abstract) {
      context += `\nOfficial Abstract: "${bill.abstracts[0].abstract}"`;
    }
    if (bill.subject && bill.subject.length > 0) {
      context += `\nSubjects: ${bill.subject.join(', ')}`;
    }
    if (bill.latest_action_description) {
      context += `\nLatest Action: ${bill.latest_action_description}`;
    }

    try {
      const prompt = `
        You are an expert at explaining complex legislation in simple terms.
        Analyze the following bill information and provide:
        1. A clear summary (maximum ${maxLength} characters).
        2. Exactly 3 bullet points about the real-world impact if this bill becomes law.
        
        Guidelines:
        - Write for people aged ${targetAge}.
        - Use simple, everyday language.
        - Focus on practical impacts.
        - Start the summary with "This bill..." or "This law...".
        
        Format your response exactly like this:
        [Your summary here]
        
        Impact if passed:
        * [First impact]
        * [Second impact]  
        * [Third impact]
        
        --- Bill Information ---
        ${context}
      `;

      console.log('[GeminiService] Making API request for:', bill.title);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      return this.parseResponse(text);
    } catch (error) {
      console.error('[GeminiService] API request failed:', error);
      return {
        summary: "This bill introduces new legislation that may impact public policy.",
        impacts: [
          "Changes to regulations may occur.",
          "Administrative processes may be updated.", 
          "Public services may be affected."
        ]
      };
    }
  }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of summaryCache.entries()) {
      if (!this.isCacheValid(entry)) {
        summaryCache.delete(key);
      }
    }
  }

  clearCache(): void {
    summaryCache.clear();
    pendingRequests.clear();
  }

  getCacheStats(): { size: number; pendingRequests: number; keys: string[] } {
    return {
      size: summaryCache.size,
      pendingRequests: pendingRequests.size,
      keys: Array.from(summaryCache.keys())
    };
  }
}