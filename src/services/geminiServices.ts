import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Cache for storing summaries to avoid repeated API calls
const summaryCache = new Map<string, string>();

interface SummaryOptions {
  maxLength?: number;
  targetAge?: string;
  useCache?: boolean;
}

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3, // Lower temperature for more consistent summaries
        maxOutputTokens: 200, // Limit output length
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
   * Summarize bill title using Gemini API
   */
  async summarizeBillTitle(
    title: string, 
    options: SummaryOptions = {}
  ): Promise<string> {
    const {
      maxLength = 150,
      targetAge = "18-40",
      useCache = true
    } = options;

    // Check cache first
    if (useCache) {
      const cacheKey = this.getCacheKey(title);
      const cachedSummary = summaryCache.get(cacheKey);
      if (cachedSummary) {
        return cachedSummary;
      }
    }

    try {
      const prompt = `
        You are an expert at explaining complex legislation in simple terms. 
        
        Take this bill title and create a clear, engaging summary that:
        - Is written for people aged ${targetAge}
        - Uses simple, everyday language
        - Explains what the bill actually does in practical terms
        - Is maximum ${maxLength} characters
        - Starts with "This bill..." or "This law..."
        - Focuses on real-world impact
        
        Bill title: "${title}"
        
        Summary:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();

      // Cache the result
      if (useCache && summary) {
        const cacheKey = this.getCacheKey(title);
        summaryCache.set(cacheKey, summary);
      }

      return summary || "This bill addresses legislative matters that may affect various aspects of governance and public policy.";
    } catch (error) {
      console.error('Error generating summary:', error);
      
      // Fallback summary
      return "This bill introduces new legislation that may impact various areas of public policy and governance.K";
    }
  }

  /**
   * Batch summarize multiple bill titles
   */
  async summarizeBillTitles(titles: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Process in batches to respect rate limits (15 requests per minute)
    const batchSize = 10;
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    for (let i = 0; i < titles.length; i += batchSize) {
      const batch = titles.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (title) => {
        const summary = await this.summarizeBillTitle(title);
        results.set(title, summary);
      });
      
      await Promise.all(batchPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < titles.length) {
        await delay(60000); // 60 second delay between batches
      }
    }
    
    return results;
  }

  /**
   * Clear the summary cache
   */
  clearCache(): void {
    summaryCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: summaryCache.size,
      keys: Array.from(summaryCache.keys())
    };
  }
}