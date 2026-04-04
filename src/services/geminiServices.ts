import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Bill, BillSummaryData } from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

// Internal alias — matches the JSON schema Gemini returns
type SummaryResult = BillSummaryData;

interface CacheEntry {
  data: SummaryResult;
  timestamp: number;
  expiresIn: number;
}

const summaryCache = new Map<string, CacheEntry>();
const pendingRequests = new Map<string, Promise<SummaryResult>>();

interface SummaryOptions {
  maxLength?: number;
  targetAge?: string;
  useCache?: boolean;
}

const FALLBACK: SummaryResult = {
  gist: "Summary unavailable at this time.",
  whoItAffects: "General public",
  walletImpact: "No direct cost impact.",
  controversy: { for: [], against: [] },
};

export class GeminiService {
  private model;
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly REQUEST_DELAY = 4000; // 4 seconds between requests
  private lastRequestTime = 0;

  constructor() {
    this.model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
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
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }

  private parseResponse(text: string): SummaryResult {
    try {
      return JSON.parse(text) as SummaryResult;
    } catch {
      console.error('[GeminiService] JSON parse failed. Raw response:', text.slice(0, 500));
      return FALLBACK;
    }
  }

  async summarizeBillWithImpacts(
    bill: Bill,
    options: SummaryOptions = {}
  ): Promise<SummaryResult> {
    const { useCache = true } = options;
    const cacheKey = this.getCacheKey(bill.title);

    if (useCache) {
      const cachedEntry = summaryCache.get(cacheKey);
      if (cachedEntry && this.isCacheValid(cachedEntry)) {
        return cachedEntry.data;
      }
    }

    if (pendingRequests.has(cacheKey)) {
      return await pendingRequests.get(cacheKey)!;
    }

    const requestPromise = this.makeRequest(bill);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      if (useCache && result) {
        summaryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
          expiresIn: GeminiService.CACHE_DURATION,
        });
      }
      return result;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  }

  private async makeRequest(bill: Bill): Promise<SummaryResult> {
    await this.enforceRateLimit();

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

    const prompt = `You are a legislative analyst. Respond ONLY with a valid JSON object — no markdown, no explanation, no extra text.

Use this exact schema:
{
  "gist": "1-3 sentence plain-English summary of what this bill does",
  "whoItAffects": "The primary group affected (e.g. homeowners, teachers, small businesses)",
  "walletImpact": "Direct financial effect — costs, taxes, fines, or savings. If none, say 'No direct cost impact.'",
  "controversy": {
    "for": ["1-2 short bullet points supporting the bill"],
    "against": ["1-2 short bullet points opposing the bill"]
  }
}

Bill information:
${context}`;

    try {
      console.log('[GeminiService] Making API request for:', bill.title);
      const result = await this.model.generateContent(prompt);
      const text = result.response.text().trim();
      return this.parseResponse(text);
    } catch (error) {
      console.error('[GeminiService] API request failed:', error);
      return FALLBACK;
    }
  }

  clearExpiredCache(): void {
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
      keys: Array.from(summaryCache.keys()),
    };
  }
}
